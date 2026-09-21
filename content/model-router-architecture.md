# Model Router Plugin Architecture

**Intelligent model routing and dynamic escalation for Hermes Agent**

A production-quality Hermes Agent plugin that automatically routes tasks to different AI models based on task complexity and dynamically escalates to more capable models when the current model is struggling.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Hermes Agent Core                       │
│  (run_agent.py, model_tools.py, cli.py, gateway/run.py)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Plugin Context Hooks
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Intelligent Model Router Plugin                │
│  (src/hermes_model_router/)                                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  classify.py │  │  escalate.py │  │    observe.py    │  │
│  │  Heuristic   │  │  Failure     │  │  Tool call &     │  │
│  │  patterns +  │  │  detection + │  │  error tracking  │  │
│  │  override    │  │  policy eval │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┼────────────────────┘            │
│                           ▼                                  │
│                  ┌────────────────┐                          │
│                  │  router.py     │                          │
│                  │  Orchestrator  │                          │
│                  │  (ModelRouter) │                          │
│                  └───────┬────────┘                          │
│                          │                                   │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────────┐          │
│   │ Tier 1   │    │ Tier 2   │    │ Tier 3       │          │
│   │ Efficient│    │ Primary  │    │ Escalation   │          │
│   │ gemma4   │    │ qwen3.5  │    │ glm-5.2      │          │
│   └──────────┘    └──────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. `router.py` — Central Orchestrator

**Class:** `ModelRouter`

The main entry point. Registers all lifecycle hooks with Hermes and coordinates classification, observation, escalation, and model switching.

#### Hook Registration

```python
def register_hooks(self) -> None:
    ctx.register_hook("pre_llm_call", self._on_pre_llm_call)
    ctx.register_hook("post_llm_call", self._on_post_llm_call)
    ctx.register_hook("pre_tool_call", self._on_pre_tool_call)
    ctx.register_hook("post_tool_call", self._on_post_tool_call)
    ctx.register_hook("pre_api_request", self._on_pre_api_request)
    ctx.register_hook("post_api_request", self._on_post_api_request)
    ctx.register_hook("on_session_start", self._on_session_start)
    ctx.register_hook("on_session_end", self._on_session_end)
    ctx.register_hook("on_session_finalize", self._on_session_finalize)
    ctx.register_hook("on_session_reset", self._on_session_reset)
```

#### Key Methods

| Method | Purpose |
|--------|---------|
| `_on_pre_llm_call()` | Classifies task, routes to tier, injects handoff context |
| `_on_post_llm_call()` | Observes turn outcome, detects escalation markers |
| `_on_pre_tool_call()` / `_on_post_tool_call()` | Tracks tool execution and errors |
| `_classify_and_route()` | Heuristic-based tier selection |
| `_maybe_escalate()` | Evaluates escalation policy |
| `_do_escalation()` | Performs model switch and builds handoff |

#### State Management

```python
self._states = StateStore()      # Per-session task state
self._stats = StatsCollector()   # Usage statistics
self._pending_handoffs: Dict[str, str] = {}  # Handoff text injection
self._classified: set[str] = set  # Track classified sessions
```

---

### 2. `config.py` — Configuration Loading

**Key Classes:** `RouterConfig`, `Tier`, `EscalationConfig`

Loads and parses configuration from `plugins.entries.model-router` in `config.yaml`.

#### Tier Structure

```python
@dataclass(frozen=True)
class Tier:
    id: str              # e.g., "efficient", "primary", "escalation"
    provider: str        # e.g., "ollama-cloud"
    model: str           # e.g., "gemma4:31b"
    description: str
    base_url: str = ""
    api_key: str = ""
    api_mode: str = ""
    
    def to_switch_kwargs(self) -> Dict[str, str]:
        return {
            "new_model": self.model,
            "new_provider": self.provider,
            "api_key": self.api_key,
            "base_url": self.base_url,
            "api_mode": self.api_mode,
        }
```

#### Config Hierarchy

```yaml
plugins:
  enabled:
    - model-router
  entries:
    model-router:
      routing:
        mode: automatic          # automatic|manual|locked|escalation_only
      tiers:
        - id: efficient
          provider: ollama-cloud
          model: gemma4:31b
        - id: primary
          provider: ollama-cloud
          model: qwen3.5:cloud
        - id: escalation
          provider: ollama-cloud
          model: glm-5.2:cloud
      classifier:
        enabled: false           # Reserved for v0.2 (LLM classifier)
      escalation:
        enabled: true
        max_consecutive_failures: 2
        detect_repeated_errors: true
        detect_tool_loops: true
        detect_no_progress: true
        require_approval: false  # Ask user before escalating
      usage:
        enabled: true
      logging:
        level: normal            # quiet|normal|verbose
```

---

### 3. `classify.py` — Task Classification

**Function:** `classify_task(user_message, config) -> Tuple[Tier, str, float]`

Returns `(tier, reason, confidence)` using a layered approach (cheapest first):

#### Layer 1: Explicit Override

```python
# User can force a tier with [route: <tier_id>] prefix
[route: escalation]
Analyze this architecture deeply.
```

Regex: `^\s*\[route:\s*([a-zA-Z0-9_-]+)\s*\]`

#### Layer 2: Deterministic Heuristics

**Simple patterns** → efficient tier (confidence 0.7):
- `summarize`, `rewrite`, `rephrase`, `rename`, `explain`
- `what...?`, `list`, `convert`

**Normal patterns** → primary tier (confidence 0.65):
- `fix`, `add`, `implement`, `write`, `refactor`
- `research`, `update`, `create`, `build`, `configure`

**Complex patterns** → escalation tier (confidence 0.7):
- `design.*architecture`, `analyze.*codebase`
- `debug.*distributed`, `build.*agent`
- `architect`, `redesign`, `migrate.*system`

#### Layer 3: Default Fallback

If no heuristic matches → middle tier (primary), confidence 0.3

**Note:** The classifier model (Layer 4) is reserved for v0.2 — currently not implemented.

---

### 4. `escalate.py` — Escalation Policy

**Function:** `evaluate(state, config) -> EscalationDecision`

Decides whether to escalate based on observed failures.

#### Failure Signals (Priority Order)

| Signal | Detection | Threshold |
|--------|-----------|-----------|
| `repeated_errors` | Same error message 2+ times | `detect_repeated_errors: true` |
| `tool_loop` | Same (tool, args) 3+ times with errors | `detect_tool_loops: true` |
| `tool_errors` | Consecutive failures | `max_consecutive_failures: 2` |
| `no_progress` | 3+ turns with no state change | `detect_no_progress: true` |
| `model_requested` | Model outputs `ESCALATE_REQUIRED` | `allow_model_requested_escalation: true` |

#### Decision Flow

```python
def evaluate(state: TaskState, config: RouterConfig) -> EscalationDecision:
    # 1. Check if escalation disabled
    if not esc.enabled: return no("escalation disabled")
    
    # 2. Check if already at max tier
    if at_max_tier(state): return no("already at max tier")
    
    # 3. Check max escalations reached
    if state.escalation_count >= max_escalations: return no("max reached")
    
    # 4. Evaluate failure signals (priority order)
    if detect_repeated_errors(state): return yes("same error 2+ times", "repeated_errors")
    if detect_tool_loop(state): return yes("repeated tool calls", "tool_loop")
    if state.consecutive_failures >= threshold: return yes("N consecutive failures", "tool_errors")
    if detect_no_progress(state): return yes("no progress", "no_progress")
    if model_requested_escalation(state): return yes("model self-assessment", "model_requested")
    
    return no("within normal parameters")
```

---

### 5. `state.py` — Per-Session State

**Classes:** `TaskState`, `StateStore`, `ToolCallRecord`

Maintains bounded, thread-safe state per session.

#### TaskState Fields

```python
@dataclass
class TaskState:
    session_id: str
    initial_tier: str          # Tier at task start
    current_tier: str          # Current active tier
    attempt_count: int         # Total turns
    tool_calls: int            # Total tool calls
    failures: int              # Total failures
    consecutive_failures: int  # Current failure streak
    escalated: bool            # Has this task escalated?
    escalation_count: int      # Number of escalations
    
    # Pending escalation (require_approval mode)
    pending_escalation_tier: str
    pending_escalation_reason: str
    pending_escalation_signal: str
    
    # Observation buffers (bounded)
    tool_history: List[ToolCallRecord]   # Last 100 calls
    error_history: List[str]             # Last 50 errors
    files_examined: List[str]
    files_modified: List[str]
    commands_run: List[str]
```

#### StateStore

- LRU eviction when >200 sessions
- 6-hour TTL for stale sessions
- Thread-safe with `threading.Lock`
- Cleanup on `on_session_end` / `on_session_reset`

---

### 6. `observe.py` — Tool Observation

**Functions:** `observe_pre_tool_call()`, `observe_post_tool_call()`, `observe_post_llm_call()`

Tracks tool execution for escalation analysis.

#### Tool Call Recording

```python
@dataclass
class ToolCallRecord:
    tool_name: str
    args_repr: str       # Truncated/hashable repr
    result_repr: str     # Truncated result
    had_error: bool
    duration_ms: int
    timestamp: float
```

#### Observation Hooks

- `pre_tool_call`: Record tool name and args
- `post_tool_call`: Record result, error status, duration
- `post_llm_call`: Check for `ESCALATE_REQUIRED` marker in response

---

### 7. `switch.py` — Model Switching

**Function:** `switch_to_tier(agent, tier) -> bool`

Switches the active model in-place while preserving conversation history.

#### Implementation

```python
def switch_to_tier(agent, tier: Tier) -> bool:
    """Switch agent to a different tier's model."""
    try:
        # Use Hermes's built-in model switching
        agent.switch_model(**tier.to_switch_kwargs())
        return True
    except Exception as e:
        logger.error("model-router: switch failed: %s", e)
        return False
```

**Key invariant:** Conversation history, tool results, and session state are preserved across switches.

---

### 8. `handoff.py` — Escalation Handoff

**Function:** `build_handoff_text(state, original_request, from_tier, to_tier, reason)`

Builds structured context for the escalated model.

#### Handoff Format

```
[ESCALATION HANDOFF]
From: {from_tier}
To: {to_tier}
Reason: {reason}

Original Request: {original_request}

Attempt History:
- Turn 1: {summary}
- Turn 2: {summary}
...

Tool Calls: {count}
Errors: {count}
Files Examined: {list}
Files Modified: {list}

Last Error: {error}
Last Progress: {progress}

Continue from here with higher-capability model.
```

---

### 9. `stats.py` — Usage Tracking

**Class:** `StatsCollector`

Collects per-tier usage statistics.

#### Tracked Metrics

- Requests per tier
- Tokens consumed per tier
- Escalation counts by signal type
- Task success/failure rates

#### Slash Command Output

```
/router stats

Model Router Statistics
─────────────────────────────────────────
Tier          Requests    Tokens    Escalations
─────────────────────────────────────────
efficient     45          125K      -
primary       128         890K      12
escalation    23          340K      -
─────────────────────────────────────────
Total:        196         1.35M     12

Escalation Signals:
  tool_errors:       7
  repeated_errors:   2
  tool_loop:         1
  no_progress:       2
```

---

## Lifecycle Flow

### Normal Task Flow

```
1. User sends message
       │
       ▼
2. pre_llm_call hook fires
       │
       ├─► Check for pending escalation approval
       ├─► Check for [route: override]
       ├─► Classify task (heuristics)
       └─► Route to tier → switch_model()
       │
       ▼
3. LLM processes with selected model
       │
       ▼
4. Tool calls observed (pre/post_tool_call)
       │
       ▼
5. post_llm_call records outcome
       │
       ▼
6. Response delivered to user
```

### Escalation Flow (Auto Mode)

```
1. Task starts on primary tier
       │
       ▼
2. Tool failures detected (observe.py)
       │
       ▼
3. pre_llm_call → _maybe_escalate()
       │
       ▼
4. evaluate() returns EscalationDecision.yes()
       │
       ▼
5. _do_escalation() switches model + builds handoff
       │
       ▼
6. Handoff injected into next turn
       │
       ▼
7. Escalation tier continues with full context
```

### Escalation Flow (Require Approval Mode)

```
1. Failure detected
       │
       ▼
2. set_pending_escalation() on TaskState
       │
       ▼
3. User sees: "Escalation recommended: primary → escalation. Reply 'yes' to approve"
       │
       ▼
4. User replies "yes"
       │
       ▼
5. _execute_pending_escalation() performs switch
       │
       ▼
6. Continue on escalated tier
```

---

## Routing Modes

| Mode | Behavior |
|------|----------|
| `automatic` | Classify every turn, route to appropriate tier, escalate on failure |
| `manual` | User chooses tier via `[route: <tier>]` prefix |
| `locked` | No routing — use session's initial model throughout |
| `escalation_only` | Don't classify; use default model, only escalate on failure |

**Note:** Classification happens on **every turn**, not just the first. This ensures simple follow-ups (e.g., "summarize this") drop back to the efficient tier instead of staying on an escalated model.

---

## Key Design Decisions

### 1. Heuristics Over LLM Classifier

- **Why:** Avoids expensive LLM call just to decide routing
- **Trade-off:** Less nuanced than LLM classification, but 100x cheaper
- **Future:** Classifier model reserved for v0.2 as optional Layer 4

### 2. Per-Turn Classification

- **Why:** Tasks evolve — a complex architecture question may have simple follow-ups
- **Implementation:** `_classify_and_route()` called on every `pre_llm_call`
- **Benefit:** Cost savings from dropping back to efficient tier for simple queries

### 3. Bounded State Buffers

- **Why:** Prevent memory leaks in long sessions
- **Limits:** 100 tool calls, 50 errors, 200 sessions in StateStore
- **Eviction:** LRU + 6-hour TTL

### 4. Provider Agnosticism

- **Why:** Users may want gemma (efficient) → qwen (primary) → claude (escalation)
- **Implementation:** Each tier has independent `provider` and `model` fields
- **Benefit:** Mix providers based on cost/capability trade-offs

### 5. Handoff Context Preservation

- **Why:** Escalated model needs full context of what was tried
- **Implementation:** Structured handoff text injected on next turn
- **Benefit:** No repetition of failed approaches

---

## Extension Points

### Adding a New Tier

```yaml
tiers:
  - id: efficient
    provider: ollama-cloud
    model: gemma4:31b
  - id: primary
    provider: ollama-cloud
    model: qwen3.5:cloud
  - id: escalation
    provider: ollama-cloud
    model: glm-5.2:cloud
  - id: nuclear
    provider: anthropic
    model: claude-sonnet-4-6
```

No code changes needed — `RouterConfig.next_tier()` handles arbitrary tier counts.

### Custom Heuristic Patterns

Edit `classify.py`:

```python
_COMPLEX_PATTERNS = [
    r"^\s*design\b.*\barchitecture\b",
    r"^\s*analyze\b.*\bcodebase\b",
    # Add your patterns here
]
```

### Custom Escalation Signals

Edit `escalate.py`:

```python
def detect_custom_signal(state: TaskState) -> bool:
    # Your detection logic
    pass

def evaluate(state, config):
    # ... existing checks ...
    
    if detect_custom_signal(state):
        return EscalationDecision.yes("custom reason", "custom_signal")
```

---

## Testing Strategy

### Unit Tests

```bash
cd ~/Model-Router
~/.hermes/hermes-agent/venv/bin/python -m pytest tests/ -o 'addopts=' -q
```

**Test files:**
- `test_classify.py` — Heuristic pattern matching
- `test_escalate.py` — Failure signal detection
- `test_config.py` — Config loading and defaults
- `test_state.py` — StateStore bounds and eviction
- `test_stats.py` — Usage tracking
- `test_observe.py` — Tool observation

### Integration Testing

```bash
# Create isolated profile
hermes profile create router-test --clone

# Edit ~/.hermes/profiles/router-test/config.yaml
# Add plugins.entries.model-router section

# Test with different task types
router-test chat -q "Summarize this article"      # Should route to efficient
router-test chat -q "Build a REST API"            # Should route to primary
router-test chat -q "Architect a distributed agent system"  # Should route to escalation
```

---

## Performance Characteristics

| Operation | Cost | Frequency |
|-----------|------|-----------|
| Heuristic classification | ~1ms regex match | Every turn |
| State update | ~0.1ms dict write | Every tool call |
| Model switch | ~100ms API call | On tier change |
| Escalation evaluation | ~0.5ms | Every turn (after failures) |
| Handoff injection | ~1ms string concat | On escalation |

**Overhead:** <2ms per turn when no escalation; ~100ms on model switch.

---

## Known Limitations

1. **No LLM classifier yet** — Heuristics can miss nuanced task complexity
2. **No cost tracking** — Usage stats track tokens but not dollar cost
3. **No cross-session learning** — Each session starts fresh
4. **No A/B testing** — Can't compare heuristic vs classifier performance
5. **Require_approval adds latency** — User must respond before escalation proceeds

---

## Future Directions (v0.2+)

- [ ] Lightweight LLM classifier for ambiguous tasks
- [ ] Cost-aware routing (prefer cheaper models when confidence is low)
- [ ] Cross-session learning (remember which tiers succeeded for similar tasks)
- [ ] A/B testing framework for heuristic tuning
- [ ] Multi-agent delegation (escalate to human or specialized agent)
- [ ] Real-time tier switching based on token budget

---

## References

- **Source:** `/home/jcrawford/Model-Router/src/hermes_model_router/`
- **Tests:** `/home/jcrawford/Model-Router/tests/`
- **Config:** `~/.hermes/profiles/lyra/config.yaml` → `plugins.entries.model-router`
- **Docs:** `README.md` in repo root
