---
title: "12 - Time Management"
slug: timeman
description: "Using time effectively"
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

$$f(t, i) = \frac{1}{25}t + \frac{3}{5}i$$

Essentially, we assume the game will continue for 25 moves, and we want to spend 1/25 of our time on each move, plus a bit of the increment. This is a very simple formula, but it works well enough as a basic time management system. It basically covers rules 4 and 5 of our list.

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
double nratio = nodecnt[cur_move.src()][cur_move.dst()] / (double)nodecnt[0][0]; // fraction of nodes used to search bm
double lim = std::clamp(1 - nratio * 0.8, 0.1, 0.7); // most nodes on best move -> use less time to search, vice versa
```

Note that I clamp the limit to prevent it from going too low or too high. You can toy with the values to see what works best for you.

### Small PS

I haven't actually gotten node time management to work well in my engine yet, so I don't have a passing SPRT. I'll update this post once I do though!
