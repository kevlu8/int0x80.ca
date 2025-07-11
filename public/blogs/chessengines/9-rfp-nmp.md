# Reverse Futility Pruning and Null Move Pruning
### 2025-07-04

In the previous posts, we used a couple of techniques to improve our search, mostly relating to the core alpha-beta algorithm. Most of these changes were lossless, meaning that they didn't change the result of the search, but only improved the speed of the search. However, if we want to truly make our search much faster, we need to make some sacrifices.

From this point onward, we will be looking at techniques that are lossy, meaning that they can potentially cause the engine to miss some moves. However, the speedup is usually worth it, and these techniques are widely used in modern engines.

## Reverse Futility Pruning

Let's say that we are at a position where we are up +900cp, with 2 more depth to go. Odds are, we aren't going to lose 450cp of advantage per move, so we can safely prune this branch. This is known as *reverse futility pruning*.

However, we need to be careful with this: what if our queen is hanging? Or, what if we're in check? In general, we should not perform RFP at positions where:
- We are in check
- The node is a PV node (i.e. a node that's part of the best move line)
- We are in a position near a mate (because RFP can lead to missing mates), we can check this by checking if either alpha or beta is near a mate value

Some engines also don't perform RFP at positions where the TT entry is a capture or promotion, but this is not strictly necessary (I've found that it loses elo in my engine).

```cpp
if (!in_check && !pv && !is_possible_mate) {
	if (eval >= beta + 150 * depth) {
		return eval - 150 * depth; // Prune the branch
		// Some engines also return values like `(eval + beta) / 2` or so on
		// Feel free to experiment with this!
	}
}
```

```
Elo   | 145.83 +- 24.41 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.99 (-2.94, 2.94) [0.00, 5.00]
Games | N: 484 W: 243 L: 51 D: 190
Penta | [2, 13, 79, 87, 61]
```
https://sscg13.pythonanywhere.com/test/413/

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

```
Elo   | 51.39 +- 14.64 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.98 (-2.94, 2.94) [0.00, 5.00]
Games | N: 1042 W: 352 L: 199 D: 491
Penta | [17, 81, 205, 168, 50]
```
https://sscg13.pythonanywhere.com/test/414/

Note that both of these techniques are **not lossless** - rather, they are lossy, and can cause the engine to potentially miss some moves. However, the pros vastly outweigh the cons (as you can see from the elo gains), and they are widely used in modern engines.