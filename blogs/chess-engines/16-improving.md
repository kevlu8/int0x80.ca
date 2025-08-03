---
title: 16 - Improving Heuristic
slug: improving
date: 2025-07-31
description: "A cool little tweak for small gains"
---

# Improving Heuristic
### 2025-07-31

All of our current heuristics basically behave the same no matter what. However, we can improve our heuristics using the *improving* heuristic (haha get it?).

Basically, we are *improving* if the static evaluation of our current position is greater than the static evaluation of the position 2 plies ago. Note that we cannot use the evaluation of positions that are in check, because static evaluation is not reliable in check.

```cpp
bool improving = false;
if (!in_check && ply >= 2 && line[ply-2].eval != VALUE_NONE && cur_eval > line[ply-2].eval) improving = true;
```

When we are improving, we can be more generous towards beta cutoffs, and prune more in general.

## Improving as a modifer to RFP

We can lower the RFP margin when we are improving, since we are more likely to reach beta cutoffs.

```cpp
	if (!in_check && !pv) {
		/**
		 * The idea is that if we are winning by such a large margin that we can afford to lose
		 * RFP_THRESHOLD * depth eval units per ply, we can return the current eval.
		 * 
		 * We need to make sure that we aren't in check (since we might get mated)
		 */
		int margin = (RFP_THRESHOLD - improving * RFP_IMPROVING) * depth;
		if (cur_eval >= beta + margin)
			return cur_eval - margin;
	}
```

My values are `RFP_THRESHOLD = 131`, `RFP_IMPROVING = 30`.

```
Elo   | 18.01 +- 7.88 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 2394 W: 590 L: 466 D: 1338
Penta | [15, 248, 563, 340, 31]
```
https://sscg13.pythonanywhere.com/test/563/

## More Improving

We can also mark the position as improving if the static evaluation is greater than the static evaluation of the position 4 plies ago.

```cpp
else if (!in_check && ply >= 4 && line[ply-2].eval == VALUE_NONE && line[ply-4].eval != VALUE_NONE && cur_eval > line[ply-4].eval) improving = true;
```

