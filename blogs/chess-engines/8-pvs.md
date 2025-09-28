---
title: "8 - Principal Variation Search"
slug: pvs
description: "Relying more on the first move"
date: 2025-07-04
---

# PV-Search
### 2025-07-04

If you recall from the previous post, a smaller search window means a more efficient search. Can we use this in our regular search as well?

Yes, of course!

## Principal Variation Search

Optimally, the first move we search should be the best move. Obviously, this isn't always the case, but the first move we search is usually a pretty decent move. So, we can use this to our advantage.

Once we search the first move, we can use the result to set a smaller search window for the next moves. If it then turns out that there is a better move, we can re-search the move with the full size window.

In more fancy terms, for each move after the first, we attempt to *prove* that the move is worse than the current best move by running a null-window search with bounds $(-\alpha - 1, -\alpha)$. If the result is less than or equal to alpha, we know that the move is indeed worse than the current best move, and we can continue on to the next move. However, if the result is greater than alpha, we have to re-search the move with the full window $(-\beta, -\alpha)$ to get an accurate score.

```cpp
Move m = NullMove;
int m_idx = 0;
while ((m = next_move(scores)) != NullMove) {
	board.make_move(m);
	Value score = 0;
	if (!m_idx) { // First move, search with full window
		score = -negamax(board, depth - 1, -side, ply + 1, -beta, -alpha);
	} else {
		// PVSearch
		score = -negamax(board, depth - 1, -side, ply + 1, -alpha - 1, -alpha);
		if (score > alpha && score < beta) {
			// Move wasn't as bad as we thought, do a full search
			score = -negamax(board, depth - 1, -side, ply + 1, -beta, -alpha);
		}
	}
	board.unmake_move();
	...
}
```

It's important that we specify the score must be below beta. This is because if the score (which is a lower bound) is above beta, we know that there will be a beta cutoff, and we don't need to search the move further.

## Late Move Reductions

In fact, we can actually improve upon this even further. We can limit not only the search window, but also the depth to which we search the move. This is called "late move reductions".

The safest formula is $reduction(i, d) = 0.77 + log(i) \times log(d) / 2.36$, where $i$ is the move index and $d$ is the current depth. There are a number of improvements (e.g. reducing less on captures), but this is a good starting point.

```cpp
score = -negamax(board, depth - reduction[i][d], -side, ply + 1, -alpha - 1, -alpha);
if (score > alpha) {
	// Move wasn't as bad as we thought, do a full search
	score = -negamax(board, depth - 1, -side, ply + 1, -beta, -alpha);
}
```

The only pitfall with this is that if the score of a reduced-depth search is `>= beta`, we cannot be sure that the move will actually be a beta cutoff, because we didn't search the move to full depth. You can do some tweaking to see what works best for you!

```
--------------------------------------------------
Results of pz-pvs vs pz-aspiration (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 139.31 +/- 34.77, nElo: 188.84 +/- 42.23
LOS: 100.00 %, DrawRatio: 29.23 %, PairsRatio: 6.67
Games: 260, Wins: 136, Losses: 37, Draws: 87, Points: 179.5 (69.04 %)
Ptnml(0-2): [3, 9, 38, 46, 34], WL/DD Ratio: 1.38
LLR: 2.97 (100.9%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

Removing the `score < beta` condition:

```
--------------------------------------------------
Results of pz-no-beta-condition vs pz-pvs (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 29.99 +/- 15.61, nElo: 42.36 +/- 21.93
LOS: 99.99 %, DrawRatio: 38.38 %, PairsRatio: 1.50
Games: 964, Wins: 307, Losses: 224, Draws: 433, Points: 523.5 (54.30 %)
Ptnml(0-2): [21, 98, 185, 133, 45], WL/DD Ratio: 0.83
LLR: 2.95 (100.0%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

## Advanced PVSearch

While the previously provided implementation is the simplest one, there is a better (albeit more complex) one.

```cpp
Value score;
if (depth >= 2 && i > 3) {
	// Case 1: Late Move Reductions
	Value r = reduction[i][depth];
	Value searched_depth = depth - r;

	score = -negamax(board, searched_depth, -side, ply+1, -alpha - 1, -alpha);
	if (score > alpha && searched_depth < newdepth) {
		score = -negamax(board, newdepth, -side, ply+1, -alpha - 1, -alpha);
	}
} else if (!pv || i > 0) {
	// Case 2: Null-window search but no LMR
	// Happens in early moves and low depths
	score = -negamax(board, newdepth, -side, ply+1, -alpha - 1, -alpha);
}
if (pv && (i == 0 || score > alpha)) {
	// Case 3: full-window full-depth search
	// Only in PV nodes where we either exceeded alpha or are searching the first move
	score = -negamax(board, newdepth, -side, ply+1, -beta, -alpha);
}
```

This implementation is far more complicated and way less intuitive to read, but it does provide a decent strength boost. The most notable difference is that we don't do late move reductions on the first few moves or at low depths, and when a reduced search fails, we re-search with full-depth null-window before doing a full-depth full-window search.

```
Elo   | 10.38 +- 5.82 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.93 (-2.25, 2.89) [0.00, 5.00]
Games | N: 4554 W: 1145 L: 1009 D: 2400
Penta | [32, 534, 1038, 612, 61]
```
https://sscg13.pythonanywhere.com/test/815/