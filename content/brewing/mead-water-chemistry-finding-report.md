---
slug: finding-your-water-report
title: "How to Get Your Water Quality Report"
excerpt: "Learn how to find your local water quality report or order a lab test when municipal data isn't available."
featuredImage: /images/content/brewing/mead-water-chemistry/series-cover.png
tags:
  - brewing
  - mead
  - water chemistry
author: joseph-crawford
publishedAt: '2026-08-17'
draft: true
type: post
series:
  name: "Mead Water Chemistry"
  order: 2
  description: "A comprehensive guide to water chemistry for mead makers — from ion fundamentals to building custom water profiles for different mead styles."
  featuredImage: /images/content/brewing/mead-water-chemistry/series-cover.png
---

## Why You Need a Water Report

Before you can adjust your water, you need to know what's already in it. Your starting point determines what minerals to add — or whether to start from scratch with distilled water.

A water report tells you the concentration of key ions: calcium, magnesium, sodium, chloride, sulfate, bicarbonate, and pH. Without this data, you're brewing blind. You might add calcium to water that's already hard, or boost sulfate when your tap water is already high in it.

## Option 1: Municipal Water Reports (Free)

If you're on city water, your utility publishes an annual **Consumer Confidence Report** (CCR) — also called a **Water Quality Report**. This is required by law for all community water systems in the US.

### How to Find Your Report

**Best search terms:**
```
"[your city name] water quality report"
"[your city name] consumer confidence report"
"[your city name] CCR water"
"[your city name] annual water report"
```

**Where to look:**
1. Your city's water utility website (often under "Water Quality" or "Reports")
2. EPA's CCR database: https://www.epa.gov/ccr
3. Call your water utility directly — they must provide it on request

**What to look for:**
The report will list contaminants and minerals in **mg/L** (milligrams per liter), which equals **ppm** (parts per million) for brewing purposes. You need these values:

- Calcium (Ca)
- Magnesium (Mg)
- Sodium (Na)
- Chloride (Cl)
- Sulfate (SO4)
- Bicarbonate (HCO3) or Total Alkalinity
- pH
- Total Hardness (useful cross-check)

**Pitfall:** Some reports list "Total Alkalinity as CaCO3" instead of bicarbonate. Convert with this formula:
```
Bicarbonate (ppm) = Total Alkalinity (ppm as CaCO3) × 0.82
```

### My Experience

I searched "North Bennington VT water quality report" and found my utility's annual CCR within two clicks. The report was a PDF with a full mineral breakdown. I copied the values into a note and referenced them every brew day.

But here's the catch: **municipal water changes**. Sources shift between groundwater, surface water, and reservoirs seasonally. Your January report might differ from your July water. The CCR is an annual average — useful, but not real-time.

## Option 2: Ward Laboratories (When No Report Exists)

If you're on well water, live in a rural area, or your municipality doesn't publish detailed mineral data, you need a lab test.

**Ward Laboratories** offers a brewing-specific water analysis: https://www.wardlab.com/services/water-analysis/

**What to order:**
- **Ward's Irrigation Water Test** or **Complete Water Analysis** — both include brewing-relevant minerals
- Cost: ~$50–75 (worth it for the accuracy)

**How it works:**
1. Order a sample kit from Ward Lab
2. Collect water sample (follow their instructions — usually a clean bottle, filled to the line, no air)
3. Ship to their lab (prepaid label included)
4. Results in 3–5 business days via email or online portal

**What you get:**
A detailed breakdown of all major ions, pH, hardness, alkalinity, and even trace elements like iron and copper. This is the gold standard for brewing water analysis.

### When to Use Ward Lab vs. Municipal Reports

| Situation | Best Option |
|-----------|-------------|
| City water with published CCR | Start with free municipal report |
| City water, no online report | Call utility, request CCR |
| Well water | Ward Lab test (required) |
| Rural water co-op | Ward Lab test (often no reports) |
| CCR missing key minerals | Ward Lab test for complete data |
| Want current data, not annual average | Ward Lab test |

## Option 3: Test Strips (Quick & Dirty)

Home test strips (like those for aquariums or pools) can give you rough pH and hardness readings. They're cheap and instant, but **not accurate enough for serious water chemistry**.

Use test strips for:
- Quick pH checks
- Verifying your adjustments after mixing
- Troubleshooting off-flavors

Don't use test strips for:
- Building your initial water profile
- Measuring individual ions (Ca, Mg, Cl, SO4)
- Making precise mineral additions

The margin of error is too high. I used them early on and ended up with inconsistent results. Now I use them only as a sanity check after I've already calculated and mixed my minerals.

## What If Your Water Is Terrible?

Some water sources are unsuitable for brewing, even with adjustments:

**Red flags in a water report:**
- Chlorine or chloramine > 4 ppm (off-flavors, kills yeast)
- Iron > 0.3 ppm (metallic taste, staining)
- Nitrate > 10 ppm (health concern, off-flavors)
- Sulfur/hydrogen sulfide (rotten egg smell)
- TDS (total dissolved solids) > 500 ppm (overly mineralized)

**Your options:**
1. **Distilled water** — buy at the grocery store (~$1/gallon). Zero minerals, perfect blank canvas. This is what I use now.
2. **RO (reverse osmosis) system** — under-sink units cost $150–300, produce neutral water on demand. Worth it if you brew often.
3. **Carbon filtration** — removes chlorine/chloramine but leaves minerals. Good if your mineral profile is already decent.

I switched to distilled water after my third batch tasted metallic. Turns out my tap water had 0.5 ppm iron — below EPA safety limits, but enough to ruin flavor. Now I build my profile from zero, every time. Consistent water = consistent mead.

## How to Read a Water Report

Water quality reports are designed for regulators, not brewers. They're dense, full of contaminants you don't care about, and often use units or labels that aren't immediately obvious. Here's how to cut through the noise and extract what you need.

### Understanding the Units

Water reports use several different unit conventions. Knowing how they relate saves you from calculation errors:

| Unit | What It Means | Brewing Equivalent |
|------|--------------|-------------------|
| mg/L | Milligrams per liter | = ppm (parts per million) |
| ppm | Parts per million | = mg/L |
| ppb | Parts per billion | ÷ 1000 to get ppm |
| gpg | Grains per gallon | × 17.1 to get ppm |
| mS/cm | Millisiemens per centimeter | Measures conductivity, not specific ions |

**The key rule:** mg/L and ppm are the same thing. Don't convert between them. If your report says 45 mg/L calcium, that's 45 ppm calcium — the number you use directly in your brewing calculations.

**Grains per gallon (gpg)** shows up on some older reports and water softener documentation. Multiply by 17.1 to convert to ppm. A report saying "10.5 gpg total hardness" means 180 ppm — which matches the example below.

### Finding the Right Numbers

A typical CCR is 4–12 pages long. Most of it covers contaminants that matter for drinking water safety but not for brewing. Here's what to scan for and what to skip:

**What you need (find these):**

| Report Label | What It Is | Why It Matters |
|-------------|-----------|----------------|
| Calcium (Ca) | Calcium concentration | Yeast health, clarity, structure |
| Magnesium (Mg) | Magnesium concentration | Yeast nutrient, enzyme support |
| Sodium (Na) | Sodium concentration | Sweetness enhancement, mouthfeel |
| Chloride (Cl) | Chloride concentration | Fullness, roundness, sweetness |
| Sulfate (SO₄) | Sulfate concentration | Dryness, crispness, flavor clarity |
| Total Alkalinity | Bicarbonate equivalent | pH buffering capacity |
| pH | Acidity/alkalinity scale | Starting must pH |
| Total Hardness | Ca + Mg combined | Cross-check for calcium/magnesium |

**What you can skip:** Lead, copper, arsenic, radon, coliform bacteria, trihalomethanes, haloacetic acids, volatile organic compounds. These are drinking water safety metrics. They tell you whether your water is safe to drink, not whether it's good for mead.

**Exception:** If any safety contaminant exceeds EPA limits, don't brew with that water at all. Use distilled instead.

### Dealing with Missing Data

Not every report lists all six brewing ions. Here's how to fill the gaps:

**If bicarbonate isn't listed:** Look for "Total Alkalinity" (usually reported as mg/L CaCO₃). Convert it:
```
Bicarbonate (ppm) = Total Alkalinity (ppm as CaCO₃) × 0.82
```
Example: Total Alkalinity of 120 mg/L CaCO₃ → 120 × 0.82 = 98 ppm bicarbonate.

**If calcium and magnesium aren't listed separately:** Look for "Total Hardness" (as CaCO₃) and "Calcium Hardness" (as CaCO₃). You can derive both ions:
```
Calcium (ppm) = Calcium Hardness (ppm as CaCO₃) × 0.40
Magnesium (ppm) = (Total Hardness - Calcium Hardness) (ppm as CaCO₃) × 0.24
```
Example: Total Hardness 180, Calcium Hardness 120 → Calcium = 120 × 0.40 = 48 ppm, Magnesium = (180 - 120) × 0.24 = 14 ppm.

**If chloride isn't listed:** Some reports don't include it. You'll need a Ward Lab test or test strips for a rough estimate. Chloride is one of the most commonly omitted ions on municipal reports.

**If sulfate isn't listed:** Also commonly omitted. Same options — Ward Lab or test strips. Don't guess; sulfate has a strong flavor effect and guessing wrong can ruin a profile.

### Reading the Columns

Most CCRs present data in a table with several columns. Here's what each one means:

| Column | What It Tells You |
|--------|------------------|
| **Contaminant** | The substance being measured |
| **MCL** | Maximum Contaminant Level — EPA legal limit for drinking water |
| **MCLG** | Maximum Contaminant Level Goal — non-enforceable health target |
| **Your Result** or **Level Found** | The actual measured value — **this is the number you want** |
| **Range** | Low–high values detected over the year (useful for spotting seasonal variation) |
| **Violation** | Whether the result exceeded MCL (should be "No") |

**Focus on the "Your Result" or "Level Found" column.** That's your actual water. The MCL and MCLG columns tell you about safety regulations, not brewing values.

**Check the "Range" column if available.** If calcium ranges from 30–90 ppm over the year, your actual calcium on any given brew day could be anywhere in that range. A wide range means your water is inconsistent — another argument for starting with distilled.

### Spotting Seasonal Variation

Some utilities source water from multiple locations throughout the year. A reservoir in summer, a groundwater well in winter. The mineral content can shift dramatically. Signs your water varies seasonally:

- The "Range" column shows wide spreads (e.g., calcium 20–120 ppm)
- The report mentions "blended sources" or "multiple sources"
- You notice your mead tasting different despite identical processes

If you see wide ranges, treat the report's average values with caution. For critical ions like chloride and sulfate, a Ward Lab test on a water sample collected on brew day gives you real-time accuracy that an annual average can't.

### A Real Example

Here's a sample municipal report breakdown:

```
Calcium:        45 mg/L
Magnesium:      12 mg/L
Sodium:         25 mg/L
Chloride:       30 mg/L
Sulfate:        80 mg/L
Bicarbonate:    150 mg/L (calculated from alkalinity of 183 mg/L CaCO₃)
pH:             7.4
Total Hardness: 180 mg/L as CaCO3
```

**Step-by-step analysis:**

1. **Calcium (45 ppm):** Decent but below my 75 ppm target. Need +30 ppm. Add calcium chloride or gypsum.
2. **Magnesium (12 ppm):** Within range (5–20 ppm). Skip Epsom salt — no magnesium addition needed.
3. **Sodium (25 ppm):** Acceptable but approaching the 50 ppm ceiling. Skip baking soda and table salt — no sodium addition needed.
4. **Chloride (30 ppm):** Low for a full mead. Need +70 ppm for a 100 ppm target. Add calcium chloride (also helps close the calcium gap).
5. **Sulfate (80 ppm):** Moderate. Good for a balanced profile. Skip gypsum unless I want a drier character.
6. **Bicarbonate (150 ppm):** High. Above my 80 ppm ceiling. This water will push the starting pH up. Two options: dilute with distilled water, or add acid to compensate.
7. **pH (7.4):** Neutral, as expected for municipal water. Will drop during fermentation. The high bicarbonate means it won't drop as fast as I'd like.
8. **Total Hardness (180 ppm as CaCO₃):** Cross-check — 45 ppm Ca × 2.5 + 12 ppm Mg × 4.1 = 112.5 + 49.2 = 162 ppm. Close to 180; the difference likely reflects rounding in the report. The numbers are consistent.

**Adjustments for a balanced traditional mead:**
- Add calcium chloride to boost Ca and Cl simultaneously
- Skip gypsum (sulfate is already 80 ppm)
- Skip Epsom salt (magnesium is already in range)
- Skip sodium additions (already at 25 ppm)
- Consider diluting 50/50 with distilled water to bring bicarbonate down to 75 ppm
- Or add a small amount of acid blend to lower starting pH despite high alkalinity

**Adjustments if starting from distilled instead:**
- Skip all the tap water calculations entirely
- Build the full profile from zero using the target values from the first article
- Simpler, more consistent, and no guesswork about seasonal variation

### Should You Use This Water or Start from Distilled?

After reading your report, you face a decision: adjust your tap water or start from distilled. My rule of thumb:

**Use tap water if:**
- All six brewing ions are listed
- No ion exceeds 2× your target range
- Bicarbonate is under 100 ppm
- No red-flag contaminants (iron, chlorine, high TDS)

**Start from distilled if:**
- Key ions are missing from the report
- Bicarbonate is above 100 ppm (too much buffering to easily adjust)
- Any ion is far outside brewing range
- You want consistency across batches regardless of season
- Your water has taste or odor issues

In the example above, the 150 ppm bicarbonate is the dealbreaker. It's easier to start from distilled and add 50 ppm bicarbonate than to try diluting tap water and recalculating every ion. When one ion is badly out of range, starting from zero is less work than compensating.

## My Recommendation

**Start simple:**
1. Search for your municipal report first — it's free and usually sufficient
2. If no report exists or you're on well water, order Ward Lab test
3. If your water has problematic minerals (iron, high TDS, chloramine), switch to distilled/RO
4. Keep a copy of your report in your brewing notes — reference it every batch

Water chemistry seems intimidating until you have the data. Once you know your starting point, the adjustments are straightforward math. The next articles in this series cover each mineral individually — what it does, when to use it, and exactly how much to add.
