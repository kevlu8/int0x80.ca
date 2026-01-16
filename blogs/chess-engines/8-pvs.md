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

To start off simple, we can reduce the depth of the search for moves after the first few moves. For example, we can reduce the depth by 1 ply for moves after the first 3 moves.

```cpp
Value score;
if (i > 3) {
	// Late Move Reductions
	int r = 2;

	if (capt || promo) r = 1; // No reduction on captures/promotions

	score = -negamax(board, depth - r, -side, ply + 1, -alpha - 1, -alpha);
	if (score > alpha && r > 1) {
		// Move wasn't as bad as we thought, do a full search
		score = -negamax(board, depth - 1, -side, ply + 1, -beta, -alpha);
	}
} else {
	// Regular PVSearch
	...
}
```

This is a very basic implementation of late move reductions, but good enough to already gain Elo. Note that we do not reduce captures or promotions, since these moves can drastically change the evaluation of the position. Also, note that we must remove the `score < beta` condition, since lower-depth fail-highs are not trustworthy.

```
Elo   | 22.09 +- 8.80 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 1984 W: 556 L: 430 D: 998
Penta | [18, 191, 454, 305, 24]
```
https://ob.int0x80.ca/test/81/

We can do even better, however. Since our moves are ordered in approximately best-to-worst, we can reduce later moves even more. A simple formula that takes all this into account is: $reduction(i, d) = 0.77 + log(i) \times log(d) / 2.36$, where $i$ is the move index (1-based) and $d$ is the current depth.

```cpp
int newdepth = depth - 1;
int r = reduction[i][depth];

if (capt || promo) r = 0;

score = -negamax(board, newdepth - r, -side, ply + 1, -alpha - 1, -alpha); // Precomputed for speed
if (score > alpha && r > 1) {
	// Move wasn't as bad as we thought, do a full search
	score = -negamax(board, newdepth, -side, ply + 1, -beta, -alpha);
}
```

```
Elo   | 25.06 +- 9.16 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 3.02 (-2.25, 2.89) [0.00, 5.00]
Games | N: 1778 W: 494 L: 366 D: 918
Penta | [13, 164, 417, 272, 23]
```
https://ob.int0x80.ca/test/84/

## Advanced PVSearch

While the previously provided implementation is the simplest one, there is a better (albeit more complex) one.

```cpp
int newdepth = depth - 1;
Value score;
if (depth >= 2 && i > 3) {
	// Case 1: Late Move Reductions
	int r = reduction[i][depth];

	if (capt || promo) r = 0;

	int searched_depth = newdepth - r;

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
