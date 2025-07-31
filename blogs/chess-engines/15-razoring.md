---
title: 15 - Razoring
slug: razoring
date: 2025-07-22
description: "An aggressive yet effective pruning technique in chess engines."
---

# Razoring
### 2025-07-22

Razoring is a pruning technique used to skip nodes that probably won't exceed alpha.

Essentially, if our static evaluation is very far below alpha, we perform a quiescence search to check if it is possible at all to reach alpha. If not, we can directly skip the node.

```cpp
if (!pv && !in_check && depth <= 3 && cur_eval + RAZOR_MARGIN * depth < alpha) {
	Value razor_score = quiesce(board, alpha, beta, side, ply);
	if (razor_score < alpha)
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
