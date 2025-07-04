# Quiescence Search
### 2025-07-03

Our engine is at a decent level now. However, it still has a major flaw: it may stop the search at a position that is not "stable".

What does this mean? Let's use a simple example. Let's say we have reached depth 0 (the end of our search), and we have a position where we are up a knight. However, our opponent can capture our queen. Our static evaluation function will say that we are winning, but this isn't true at all, because our opponent can simply capture our queen and we will be down tons of material. This is known as the *horizon effect*.

How do we mitigate this? Do we just search deeper? Well, sure, but then you have another horizon, just a bit deeper. The solution is to use a technique called *quiescence search*.

## Quiescence Search

Once we reach the maximum depth, we don't just return the static evaluation. Instead, we keep on searching "noisy moves" like captures and promotions until we reach a position that is "stable". Our evaluation function is the most accurate in these stable positions, so we can be a lot more confident in our evaluation (though still not 100% sure!).

```cpp
Value quiescence(Board& pos, int side, Value alpha = -INF, Value beta = INF) {
	bool is_stable = true;

	Value best = -INF;

	for (Move m : pos.legal_moves()) {
		if (is_capture(m) || is_promotion(m)) {
			is_stable = false; // If we have a capture or promotion, the position is not stable

			pos.make_move(m);
			Value score = -quiescence(pos, -side, -beta, -alpha);
			pos.undo_move(m);

			if (score > best) {
				best = score; // Update the best score if we found a better one
				if (score > alpha) {
					alpha = score;
				}
			}
			if (score >= beta) {
				return best; // Beta cutoff
			}
		}
	}

	if (is_stable) {
		return eval(pos) * side; // If the position is stable, we can return the evaluation
	}
	return best; // Otherwise, we return the best score found
}
```

Unfortunately, this is very obviously slow. We could potentially search almost 20 moves deep before we reach a stable position. So, how can we speed this up?

We have one main trick up our sleeve.

## Stand Pat

Stand pat? Isn't that from poker? Yes, it is! But, it also applies to chess engines.

The stand pat score is the evaluation of the current position. In theory, not playing a move in almost any given position is worse than playing the best move. So, our stand pat score is basically a lower bound on the score that we can achieve.

So, our new quiescence search function looks like this:

```cpp
Value quiescence(Board& pos, int side, Value alpha = -INF, Value beta = INF) {
	Value stand_pat = eval(pos) * side;

	if (stand_pat >= beta) {
		return stand_pat; // Opponent won't let this happen
	}
	if (stand_pat > alpha) {
		alpha = stand_pat; // Update alpha if we found a better score
	}

	for (Move m : pos.legal_moves()) {
		if (is_capture(m) || is_promotion(m)) {
			is_stable = false; // If we have a capture or promotion, the position is not stable

			pos.make_move(m);
			Value score = -quiescence(pos, -side, -beta, -alpha);
			pos.undo_move(m);

			if (score > stand_pat) {
				best = score; // Update the best score if we found a better one
				if (score > alpha) {
					alpha = score;
				}
			}
			if (score >= beta) {
				return stand_pat; // Beta cutoff
			}
		}
	}
	
	return stand_pat;
}
```

```
[sprt results]
```

## Move Ordering... again?

If you're really sharp, you might have noticed that our quiescence search function is very similar to our alpha-beta search function. So, the logical next question is: can we use move ordering again?

The answer? Absolutely! In fact, if we aren't, we're missing out on a lot of performance.

Move ordering in quiescence search is even easier than in alpha-beta search, because we're only ordering captures and promotions. So, we can simply use the MVV-LVA heuristic again.

I trust you know how to implement this, so I won't provide a code snippet.

```
[put sprt results here when available]
```