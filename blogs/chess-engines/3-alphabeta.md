---
title: "3 - Alpha-Beta Pruning"
slug: alphabeta
description: "The key optimization in chess engines!"
date: 2025-07-03
---

# Alpha-Beta Pruning
### 2025-07-03

When we as humans calculate in chess, we obviously don't calculate every single move. What most of us do is we only search a handful of moves that look promising.

Unfortunately, computers aren't very good at determining which moves "look promising". There will always be a degree of brute-force involved in the search. But, we can improve it a ton by using a very simple observation.

## The Observation

Let's say we are searching a position, and we already have a move in mind. The resulting position is "good enough" for us. Now, as we begin searching the next move, we realize that the opponent can take our queen, causing us to lose. At this point, we instantly stop searching this move, because it's not going to be better than the move we know is already "good enough".

## Implementation

In practice, this is very easy to implement, requiring only two variables: alpha and beta. Alpha is the best score we have found so far, and beta is the best score (for us) that the opponent will allow to happen. If we find a move that is better than beta, we can instantly stop searching and return this move, because we know that the opponent has a way to prevent this from happening.

The neat part is that our alpha/beta values are our opponents -beta/-alpha values. So, our search function can pretty much stay the same!

```cpp
Value negamax(Board& pos, int depth, int ply = 0, Value alpha = -INF, Value beta = INF) {
	if (depth == 0) {
		// Once we reach the maximum depth, we evaluate
		return eval(pos);
	}

	Value best = -INF; // Start with the worst possible value
	for (Move m : pos.legal_moves()) {
		pos.make_move(m); // Make the move on the board
		Value score = -negamax(pos, depth - 1, ply + 1, -beta, -alpha); // Negate the score for our perspective
		pos.undo_move(m); // Undo the move to restore the board

		if (score > best) {
			best = score; // Update the best score if we found a better one
			if (score > alpha) {
				alpha = score; // If we found a move better than our current best move, update it
			}
		}

		if (score >= beta) {
			// Our opponent will never allow this to happen, so we immediately terminate.
			return best;
		}
	}

	if (best == -INF) {
		// No legal moves, check for checkmate or stalemate
		if (pos.in_check()) {
			return -MATE + ply; // Mate in 'ply' moves
		} else {
			return 0; // Stalemate
		}
	}

	return best; // Return the best score found
}
```

Alpha-beta pruning results in a speedup of around sqrt(N) compared to normal negamax (in the best case). Plus, it's lossless, meaning that it will always find the same best move as normal negamax.

Note: "in the best case" means "with best move ordering". Naturally, if we search the best moves first, we will establish a good "guaranteed score" early on, so we will be able to prune more aggressively.

```
--------------------------------------------------
Results of pz-alphabeta vs pz-negamax (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 263.29 +/- 50.66, nElo: 376.80 +/- 49.93
LOS: 100.00 %, DrawRatio: 18.28 %, PairsRatio: 37.00
Games: 186, Wins: 130, Losses: 11, Draws: 45, Points: 152.5 (81.99 %)
Ptnml(0-2): [0, 2, 17, 27, 47], WL/DD Ratio: 1.12
LLR: 2.96 (100.4%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

## More Alpha-Beta Theory

There are two ways to implement alpha-beta pruning: fail-hard and fail-soft.

In a fail-hard framework, we will only return values in the range of $[\alpha, \beta]$. If we find a better move than beta, we return beta, and if we don't find a move better than alpha, we return alpha. This means that we will never return a value outside of the range $[\alpha, \beta]$. Although this is simpler to implement, it is not as efficient as fail-soft.

In a fail-soft framework, we will return the best move we found, even if it is outside of the range $[\alpha, \beta]$. This means that we can return values outside of the range $[\alpha, \beta]$, but we will still prune the search tree as if we were in a fail-hard framework. The reason this is better is that it gives us more information about how *much* our search failed by.

When we fail outside of the range $[\alpha, \beta]$, the score we get is actually either a lower or upper bound on the true score. Specifically, if we fail low (no move better than alpha exists), the score we get is an upper bound (the true score is equal to or lower than the score we returned). If we fail high (no move worse than beta exists), the score we get is a lower bound (the true score is equal to or higher than the score we returned).

Many search optimizations rely on fail highs - specifically, cases where our score exceeds beta. Usually, when we fail high, we gain valuable information about the move we just searched. Essentially, we know that it is a good move, and we can use this information to improve our search and move ordering.
