---
title: "12 - Time Management"
slug: timeman
description: "Using time effectively"
date: 2025-07-05
---

# Time Management
### 2025-07-05

By now, you probably have a very strong engine that can be used to analyze positions and play at a high level. However, it still has one major flaw: it doesn't know how to manage its time.

I touched on this very briefly in the second post, but how exactly do we manage our time? If you play bullet chess, you probably have some sense of intuition regarding this, but again, chess engines don't have intuition. They need to be explicitly told what to do.

Let's come up with a simple set of rules that we as humans follow when playing chess:
1. If our opponent just captured one of our pieces, we should capture it back (if possible)
2. If we only have one obvious non-losing move, we should play it (extension of the previous rule)
3. If the position is very complex, we should spend more time on it
4. If we are low on time, we should spend less time on our move
5. If we have a lot of time, we should spend more time on our move

These rules are arguably pretty easy for humans to follow, but for a chess engine, how do we define a "complex position"?

We'll first start with a simple rule: define a formula $f(t, i)$ that takes the time left and the amount of increment we have, and returns how much time we should spend on our move. A simple formula could be:

$$f(t, i) = \frac{1}{20}t + \frac{3}{5}i$$

Essentially, we assume the game will continue for 20 moves, and we want to spend 1/20 of our time on each move, plus a bit of the increment. This is a very simple formula, but it works well enough as a basic time management system. It basically covers rules 4 and 5 of our list.

You can get pretty far with this simple formula, but you might quickly notice that sometimes, we waste a bunch of time trying to reach the next depth, but run out of time before finishing that depth. To alleviate this, we can use a "soft limit".

The aforementioned formula can function as a hard limit - basically, if we reach this time, we stop the search **no matter what**. However, we can also define a "soft limit" that is slightly lower than the hard limit, and we can use this to determine whether we should continue searching or not.

When we finish an iterative deepening iteration, we can check if the time spent is already more than the soft limit. If it is, we stop the search, the logic being that we probably won't be able to finish the next iteration anyway.

```cpp
if (time_elapsed >= 0.5 * time) {
	// Soft limit
	break;
}
```

Feel free to experiment with different values!

```
Elo   | 29.65 +- 9.89 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.96 (-2.94, 2.94) [0.00, 5.00]
Games | N: 1386 W: 366 L: 248 D: 772
Penta | [10, 83, 415, 149, 36]
```
https://sscg13.pythonanywhere.com/test/425/

Unfortunately, we still haven't addressed rules 1, 2, and 3. Is there a way to address all of these rules at once? The answer is, in fact, yes!

## Node Time Management

Usually, the proportion of nodes searched to evaluate a move is roughly an indicator of how good the move is. If a move has many nodes in its subtree, it is probably a good move, and vice versa.

Take this position as an example: `rnb1kbnr/pppp1p1p/5Qp1/4p3/4P3/2N5/PPPP1PPP/R1B1KBNR b KQkq - 0 4`

Black only realistically has one move: `Nxf6`. Our engine spends over 99.5% of its nodes on this move.

Then, consider this position: `rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6`

It's the mainline of the Najdorf Sicilian, and white has many good moves. Here, our engine only spends about 50% of its nodes on the best move, which is `Be3` (according to our engine).

So, we can use this to our advantage and adjust the soft limit based on this ratio. We focus less on increasing the soft limit past what it was before, but instead focus on decreasing it when the best move is obvious.

```cpp
double nratio = nodecnt[cur_move.src()][cur_move.dst()] / nodes; // fraction of nodes used to search bm
double lim = 1.5 - nratio; // most nodes on best move -> use less time to search, vice versa
int maxtime = soft_limit * lim;
```

You can toy with the values to see what works best for you.

```
Elo   | 16.34 +- 7.14 (95%)
SPRT  | 40.0+0.40s Threads=1 Hash=128MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 2362 W: 544 L: 433 D: 1385
Penta | [2, 233, 613, 318, 15]
```
https://sscg13.pythonanywhere.com/test/1096/

## Complexity Time Management

As mentioned with rule 3, we want to spend more time searching complex positions. We've done this implicitly in our node time management, but we can also do this explicitly.

But, how do we define the complexity of a position? A pretty good measure is the difference between the static evaluation and the search evaluation. If the two evaluations are very different, it means that there is a lot of tactical complexity in the position, and we should spend more time searching it.

```cpp
if (depth >= 6) {
	Value complexity = abs(eval - static_eval);
	double factor = std::clamp(complexity / 200.0, 0.0, 1.0);
	double lim = 0.3 + 0.4 * factor; // 0.3 to 0.7
	soft_limit = hard_limit * lim;
}
```

```
Elo   | 8.80 +- 5.15 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.97 (-2.25, 2.89) [0.00, 5.00]
Games | N: 5372 W: 1286 L: 1150 D: 2936
Penta | [33, 617, 1258, 737, 41]
```
https://sscg13.pythonanywhere.com/test/1023/
