---
title: 15 - Razoring
slug: razoring
date: 2025-07-22
description: "An aggressive yet effective pruning technique in chess engines."
---

# Razoring
### 2025-07-22

So far, most pruning techniques we've covered are techniques that prune nodes that will likely produce beta cutoffs. What about the other way around - alpha cutoffs?

Naturally, the challenge with pruning for alpha cutoffs is that alpha cutoffs inherently require *all* moves to be searched and *all* moves to fall below alpha - a much stricter condition than beta cutoffs (just one move must exceed beta). However, we can still use a technique called *razoring*.

Essentially, if our static evaluation is very far below alpha, we perform a quiescence search to check if it is possible at all to reach alpha. If not, we can directly skip the node.

```cpp
if (!pv && !in_check && depth <= 3 && cur_eval + RAZOR_MARGIN * depth < alpha) {
	Value razor_score = quiesce(board, alpha, alpha + 1, side, ply);
	if (razor_score <= alpha)
		return razor_score;
}
```

This goes before the main move loop.

```
Elo   | 30.60 +- 10.32 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.92 (-2.25, 2.89) [0.00, 5.00]
Games | N: 1400 W: 299 L: 176 D: 925
Penta | [11, 108, 356, 197, 28]
```
https://sscg13.pythonanywhere.com/test/500/

A surprising gain for a technique so simple!
