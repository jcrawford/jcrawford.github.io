---
title: "MCP Was a Bad Idea, and the Numbers Prove It"
publishedAt: "2026-09-21"
slug: "mcp-bad-idea"
draft: false
author: "joseph-crawford"
excerpt: "The Model Context Protocol was supposed to simplify how AI agents talk to external services. Instead, it became a token-hungry abstraction layer that modern LLMs don't even need. I ran the numbers — they're ugly."
tags: ["ai", "mcp", "llm"]
featuredImage: "/images/content/posts/mcp-bad-idea/featured.jpg"
updatedAt: "2026-09-21"
---

I've been watching the Model Context Protocol ecosystem grow for nearly two years now, and I keep coming back to the same uncomfortable question: what problem does this actually solve that a CLI and a shell don't already solve better?

A [recent article by Maharshi Patel](https://maharship.com/blog/why-mcp-was-always-a-bad-idea/) argued that MCP was always a bad idea — that the models have gotten smart enough to replace most MCP servers with direct API calls and CLI tools. I agree with the conclusion, but I think the argument is even stronger when you look at the actual numbers. So I ran the experiments myself, using the GitHub MCP server and the `gh` CLI as a real-world comparison.

The results are worse than I expected.

### The Token Tax of Just Existing

Before an MCP server does anything useful, it has to tell the model what tools it offers. Every single tool comes with a JSON schema — parameter names, types, descriptions, required fields. All of that gets injected into the model's context window as system tokens. You pay for this on every conversation, whether you use the tools or not.

I spun up the official `@modelcontextprotocol/server-github` package and listed its tools. Here's what I found:

- **26 tools** exposed by the server
- **16,981 characters** of JSON schema describing those tools
- **~4,245 tokens** consumed just to declare what the server can do

That's the cost of *admission*. Before the model has read a single issue, searched a single repository, or looked at a single pull request, you've already burned over four thousand tokens just telling it what's available.

Now compare that to what an agent discovers when it runs `gh --help`:

```
gh --help       2,007 chars  (~502 tokens)
gh repo --help  1,082 chars  (~270 tokens)
gh issue --help 1,196 chars  (~299 tokens)
gh pr --help    1,433 chars  (~358 tokens)
```

An agent with terminal access can discover *all* of `gh`'s capabilities — repositories, issues, pull requests, searches, API access — for about 1,430 tokens if it reads every help page. That's a third of what the MCP server costs just to exist, and the help text is actually useful to the model in a way that raw JSON schemas aren't. The help text includes examples, flags, and human-readable descriptions that models parse naturally.

But here's the thing: the agent doesn't even need to read all the help pages. It can run `gh --help` once (502 tokens), learn that `repo`, `issue`, `pr`, and `search` are subcommands, then drill into only the one it needs. The CLI lets the model *lazy-load* its own context. MCP doesn't.

### The Response Bloat Problem

The token cost of schemas is only half the story. The other half is what happens when the tools actually return data.

I ran the same query through both systems — searching GitHub for repositories matching "mcp model context protocol," requesting three results. Here's what came back:

**MCP `search_repositories` response:**
- 4,014 characters (~1,003 tokens)
- Raw GitHub API JSON payload, passed through with minimal filtering
- Includes `node_id`, `avatar_url`, `git_url`, `ssh_url`, `clone_url`, and a dozen other fields the model will never use

**`gh search repos` (JSON output):**
- 441 characters (~110 tokens)
- Only the fields I asked for: `fullName`, `description`, `stargazersCount`

**`gh search repos` (human-readable output):**
- 361 characters (~90 tokens)
- Formatted as a clean table the model can parse at a glance

The MCP server returned **11 times more tokens** than the `gh` CLI for the same query. And it's not because MCP is choosing to be verbose — it's because MCP is a thin wrapper around the GitHub REST API, and the REST API returns everything. The server doesn't know what the model actually needs, so it sends everything and lets the model sort it out.

The `gh` CLI, by contrast, has a human-first design philosophy that happens to be model-friendly. The `--json` flag lets you specify exactly which fields you want. The default output is a formatted table. Both are compact, both are parseable, and neither wastes a single token on fields nobody asked for.

### The Multiplier Effect

Here's where it gets genuinely painful. Nobody runs just one MCP server.

A realistic developer setup might have GitHub, Slack, a database connector, a file system server, and a web search server. Each one brings its own tool schemas. Let's do the math:

| Server | Tools (approx.) | Schema Tokens (approx.) |
|--------|-----------------|------------------------|
| GitHub MCP | 26 | ~4,245 |
| Slack MCP | 20 | ~3,200 |
| Postgres MCP | 12 | ~2,000 |
| Filesystem MCP | 8 | ~1,300 |
| Web Search MCP | 6 | ~1,000 |
| **Total** | **72** | **~11,745** |

Nearly twelve thousand tokens of system context, before the conversation has even started. That's not a rounding error — it's a significant fraction of a model's usable context window, especially if you're working with a model that has a 32K or 128K context limit and you're already loading in codebase context, conversation history, and file contents.

Now the CLI equivalent. An agent with terminal access discovers `gh`, `psql`, `curl`, `grep`, `find`, and whatever else it needs by running `--help` on demand. It loads context incrementally, only when it needs a tool, and only the specific help section relevant to the current task. The total context cost is whatever the agent has actually used, not the union of everything it *might* use.

### The Abstraction That Hides Nothing

The deeper problem with MCP isn't just token cost — it's that the abstraction doesn't abstract anything.

Most MCP servers are thin wrappers around existing HTTP APIs. The GitHub MCP server doesn't have its own data model or its own business logic. It translates tool calls into GitHub API calls and passes the responses back. The "protocol" is just a JSON-RPC envelope around the same API you could call directly with `curl` or `gh api`.

This means MCP adds a layer of indirection without adding a layer of intelligence. The model still needs to understand GitHub's data model — what a repository is, what a pull request is, what a diff looks like. The MCP server doesn't simplify the concepts; it just renames the access method. Instead of teaching the model to call `GET /repos/{owner}/{repo}/pulls`, you're teaching it to call `list_pull_requests` with the same parameters. The cognitive load on the model is identical, but now you've added a server process, a protocol layer, and 4,000 tokens of schema overhead.

### Models Don't Need Hand-Holding Anymore

The original justification for MCP made sense in late 2024. Models were less reliable at writing scripts, less capable of discovering CLI tools, and more prone to hallucinating API endpoints. Giving them a structured tool interface with validated schemas was a reasonable safety net.

But I've been watching Claude, GPT, and the open-weight models evolve, and the gap between "needs structured tool schemas" and "can just run `gh --help` and figure it out" has closed completely. Modern models discover CLIs, read help text, compose multi-step workflows, and recover from errors with minimal intervention. They write Python scripts to orchestrate APIs. They pipe output through `jq` when they need structured data. They are, frankly, better at adapting to a CLI's idiosyncrasies than most humans.

The article I read suggested that models have "figured out how to use the `--help` command to discover CLIs." That's not a side effect — it's a fundamental capability shift. When a model can discover and use a tool by reading its help text, the structured schema isn't a safety net anymore. It's a toll booth.

### What Actually Works

I'm not arguing that we should abandon all abstraction layers. The `gh` CLI is itself an abstraction over the GitHub API, and a good one. The difference is that `gh` was designed for humans — concise output, sensible defaults, progressive disclosure of complexity — and those design constraints happen to make it efficient for models too.

The pattern that works isn't "wrap everything in a protocol." It's:
1. Give models terminal access
2. Let them discover tools the same way humans do — `--help`, `man`, tab completion
3. Trust them to compose commands and pipe output
4. Let them use `--json` or `--jq` when they need structured data
5. Stay out of the way

This is cheaper, more flexible, and more robust than MCP. It's cheaper because you only pay for what you use. It's more flexible because the agent can improvise — pipe `gh` output into `grep`, chain API calls with `xargs`, write a quick Python script when no existing tool fits. It's more robust because there's no server process to crash, no protocol version to negotiate, and no schema to go stale when the underlying API adds a new field.

### The Real Numbers

I didn't want to write this post with hand-waving estimates, so I ran the actual commands. Here's the summary:

| Metric | GitHub MCP Server | `gh` CLI |
|--------|-------------------|----------|
| Discovery cost (tool schemas or help text) | ~4,245 tokens (26 tools, always loaded) | ~502 tokens (`gh --help`, loaded on demand) |
| Search repos query (3 results) | ~1,003 tokens (raw API JSON) | ~110 tokens (`--json` with selected fields) |
| Multi-server overhead (5 typical servers) | ~11,745 tokens (72 tools, always loaded) | ~0 tokens until a tool is actually needed |
| Response verbosity | 11× more tokens than necessary | Exactly what you ask for |

The MCP server burns 11 times more tokens on a simple repository search, and that's before you account for the 4,245-token tax it charges just to exist in the context window. When you multiply that across every tool call in every conversation across every developer using MCP, the wasted compute is staggering.

### Let It Die

MCP was a reasonable idea for the models of 2024. The models of 2026 don't need it. They don't need JSON schemas to understand a tool's interface. They don't need a protocol layer to call an API. And they certainly don't need to burn four thousand tokens of context just to learn that a server *exists*.

The next time someone tells you MCP is the future of AI tool integration, ask them how many tokens it costs before the model does anything useful. Then ask them how many tokens `gh --help` costs. The difference is the entire argument.