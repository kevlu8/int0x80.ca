---
title: "13 - Extensions"
slug: extensions
description: "Searching certain positions deeper"
date: 2025-07-05
---

# Extensions
### 2025-07-05

In theory, we want to search the positions that are likely to lead to a win the deepest, or at least deeper. But how do we determine which positions lead to wins?

## Check Extensions

This is an obvious one. If we play a move that results in us checking the opponent, we should search deeper. This is especially relevant because checks are *forcing moves*, meaning that the opponent has to respond to them. 

An easy way to implement this is not actually in the move loop, but rather at the beginning of the search function. If we are in check, we search deeper.

```cpp
if (in_check) depth++;
```

This one line is sufficient!

```
Elo   | 55.65 +- 14.86 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.97 (-2.94, 2.94) [0.00, 5.00]
Games | N: 850 W: 263 L: 128 D: 459
Penta | [3, 66, 188, 129, 39]
```
https://sscg13.pythonanywhere.com/test/430/

## Internal Iterative Reductions

Okay, I know, the title of the post is "extensions", but this is a very useful technique that I wanted to include here. In general, the current meta is to focus less on extensions, but rather on reductions. Internal iterative reductions are a simple way to do this.

When we reach a position, we either have a transposition table entry or we don't. If we don't, we assume that the position isn't a good position, and we reduce the depth.

```cpp
if (depth > 5 && !tt_entry) {
	depth -= 2;
}
```

Again, the provided numbers are completely arbitrary, and you can adjust them to your liking. The idea is that if we don't have a transposition table entry, the position is likely not very good, so we can reduce the depth.

## Singular Extensions

When we have a position where only one move is good (i.e. all other moves are worse), we can search that move deeper. This is called a singular extension.

Unfortunately, this is a bit more complicated to implement. First, we need to update our search stack to store an excluded move for each ply.

```cpp
struct SSEntry {
	Move best_move;
	Value eval;
	Move excl;
};
```

Then, when we are in the move loop, we run a singular extension check.

```cpp
if (line[ply].excl == NullMove // do not try extending if we are currently in an extension search
	&& depth >= 8 // don't extend at low depths, not worth
	&& ttentry // we have a transposition table entry to base our extension on
	&& move == ttentry->best_move // the move we are searching is the best move in the transposition table
	&& ttentry->depth >= depth - 2 // the entry is reasonably deep
	&& ttentry->flags != UPPER_BOUND // the entry is a reliable score (note that lower bounds work)
) {
	line[ply].excl = move; // set the excluded move
	Value singular_beta = ttentry->eval - 3 * depth; // this is how much all moves must be worse than the singular move to be considered singular
	Value singular_score = search((depth - 1) / 2, singular_beta - 1, singular_beta, side, ply);
	line[ply].excl = NullMove; // reset the excluded move

	if (singular_score < singular_beta) {
		// If after excluding the singular move, we get a bad score, then it's singular
		extension++;
	}
}
```

Unfortunately, this isn't it - we also need to do some more adjustments. Most importantly, we cannot store singular search results in the transposition table (since they may not reflect the actual position), and we also cannot use TT cutoffs for singular searches (because they include the singular move).

If you can implement all this, you will get a modest but real Elo gain!

```
Elo   | 4.98 +- 3.66 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.95 (-2.25, 2.89) [0.00, 5.00]
Games | N: 11926 W: 2895 L: 2724 D: 6307
Penta | [145, 1389, 2728, 1552, 149]
```
https://sscg13.pythonanywhere.com/test/552/

## Negative Extensions

If you implemented singular extensions, you can also implement negative extensions. It's very simple:

```cpp
...
if (singular_score < singular_beta) {
	extension++;
} else if (ttentry->eval >= beta) {
	extension -= 3;
}
```

The logic here is that if it turns out the move isn't singular (i.e. there are multiple good moves), we can put less effort into searching it, especially if our transposition table entry suggests that the move would already exceed beta.

```
Elo   | 12.72 +- 6.38 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.97 (-2.25, 2.89) [0.00, 5.00]
Games | N: 3552 W: 864 L: 734 D: 1954
Penta | [28, 369, 862, 479, 38]
```
https://sscg13.pythonanywhere.com/test/558/
