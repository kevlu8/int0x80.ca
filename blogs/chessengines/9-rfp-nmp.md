# Reverse Futility Pruning and Null Move Pruning
### 2025-07-04

In the previous posts, we used a couple of techniques to improve our search, mostly relating to the core alpha-beta algorithm. Most of these changes were lossless, meaning that they didn't change the result of the search, but only improved the speed of the search. However, if we want to truly make our search much faster, we need to make some sacrifices.

## Reverse Futility Pruning

Let's say that we are at a position where we are up +900cp, with 2 more depth to go. Odds are, we aren't going to lose 450cp of advantage per move, so we can safely prune this branch. This is known as *reverse futility pruning*.

However, we need to be careful with this: what if our queen is hanging? Or, what if we're in check? In general, we should not perform RFP at positions where:
- We are in check
- The node is a PV node (i.e. a node that's part of the best move line)
- Our transposition table entry either doesn't exist or is a capture/promotion

```cpp
if (!in_check && !pv && tt_entry && !is_capture(tt_entry->best_move) && !is_promotion(tt_entry->best_move)) {
	if (eval >= beta + 150 * depth) {
		return eval - 150 * depth; // Prune the branch
		// Some engines also return values like `(eval + beta) / 2` or so on
		// Feel free to experiment with this!
	}
}
```

## Null Move Pruning

First off, we need to talk more about the null move observation. We briefly touched on this when talking about stand pat, but we can actually use this to prune branches in our main search!

Again, the null move observation states that in general, choosing to skip our turn is never as good as playing the best move. So, if we skip our turn, perform a reduced-depth search, and find that the score is still above beta, we can prune the branch.

Note that we need to be careful with this as well: we should not perform null move pruning at positions where:
- We are in check (obviously)
- We are in a pawn endgame (i.e. only pawns left where Zugzwangs are common)

```cpp
if (!in_check && !is_pawn_endgame) {
	board.make_null_move();
	Value null_score = -negamax(board, depth - 4, -beta, -beta + 1); // Note that we do a zero-window search because we only want to prove that the score is above beta
	board.undo_null_move();
	if (null_score >= beta) {
		return null_score; // Prune the branch
	}
}
```

