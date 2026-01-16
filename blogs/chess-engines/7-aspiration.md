---
title: "7 - Aspiration Windows"
slug: aspiration
description: "Narrowing the window of possible evaluations"
date: 2025-07-04
---

# Aspiration Windows
### 2025-07-04

You may recall from a few posts back when I said that we can re-use results from our previous iterative deepening iterations to guide our next search. We've already partly done this with transposition tables, but we can do even better by using a technique called aspiration windows!

Most of the time, our evaluation of a position will not change by too much between iterations. So, we can use the returned evaluation from our previous iteration to set a "window" for our next search, using alpha and beta bounds. Remember, the smaller the alpha-beta bounds, the more efficient our search will be.

However, if our search falls outside of this window, we will have to re-search the position with a larger window. While this may seem inefficient, this doesn't happen too often, and the speedup from using smaller windows is worth it.

Customizing the size of the window on which we search will be a common theme in the future! So, make sure that you roughly understand how alpha-beta works.

```cpp
Value alpha = -VALUE_INFINITE, beta = VALUE_INFINITE;
Value window_sz = ASPIRATION_SIZE; // My aspiration size is set to 50, but feel free to mess around and try different values!
Value eval = -VALUE_INFINITE;

if (cur_eval != -VALUE_INFINITE) {
	// Aspiration windows 
	alpha = cur_eval - window_sz;
	beta = cur_eval + window_sz;
}

while (true) {
	alpha = std::max(alpha, -VALUE_INFINITE);
	beta = std::min(beta, VALUE_INFINITE);
	auto res = negamax(board, depth, board.side == WHITE ? 1 : -1, 0, alpha, beta);

	if (res <= alpha) {
		// Failed low, expand lower bound
		alpha = cur_eval - window_sz * 2;
	} else if (res >= beta) {
		// Failed high, expand upper bound
		beta = cur_eval + window_sz * 2;
	} else break; // Within bounds, done searching

	window_sz *= 2;
}
```

This way, we can use the results from our previous search to guide our next search, while still being able to handle cases where our evaluation changes significantly.

```
--------------------------------------------------
Results of pz-aspiration vs pz-tt-move (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 25.25 +/- 13.92, nElo: 36.44 +/- 20.01
LOS: 99.98 %, DrawRatio: 50.95 %, PairsRatio: 1.65
Games: 1158, Wins: 450, Losses: 366, Draws: 342, Points: 621.0 (53.63 %)
Ptnml(0-2): [40, 67, 295, 123, 54], WL/DD Ratio: 2.88
LLR: 2.95 (100.1%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```