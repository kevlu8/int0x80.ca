---
title: "19 - Static Evaluation Correction History"
slug: corrhist
description: "Learning from previous searches"
date: 2025-11-08
---

# Static Evaluation Correction History
### 2025-11-08

One of the newest - yet most effective - heuristics in chess engines is called the *static evaluation correction history*, or corrhist for short.

Essentially, no evaluation function is perfect. There will always be positions where the evaluation is off, whether because of a tactic or because of an edge case that the evaluation function doesn't handle well. Corrhist is a way to learn from these mistakes *during the search*, instead of from training data.

When we finish searching a position, we can compare the static evaluation of the position to the final evaluation after search. If there is a large discrepancy between the two, we can update corrhist to reflect this: for example, if the static eval is +50cp but after search we find that the position is actually -100cp, we can decrease the corrhist value for the move that led to this position.

Like other histories, correction history is stored in a table and continually updated during search. Let's start off with the simplest possible implementation.

## Pawn Structure Corrhist

Most people start off with this type of corrhist. It's simple and effective!

First, we will need to modify our bitboard representation to also keep track of a hash only considering pawns. This shouldn't be difficult, but it may be a bit tedious.

Once we have this, we can create a corrhist table indexed by `[side][pawn_hash]`.

```cpp
// Size of corrhist table, will be used for all other corrhist types as well
// Try not to overdo the value here, as corrhist tables can get quite large
#define CORRHIST_SZ 32768
#define CORRHIST_GRAIN 256
#define CORRHIST_WEIGHT 256
// The other two constants are used for the update formula

Value corrhist_pawn[2][CORRHIST_SZ];
```

To update corrhist, we can use the *moving exponential average* formula:

```cpp
void update_corrhist(Board &board, Value diff, int depth) {
	const int scaled_diff = diff * CORRHIST_GRAIN;
	const Value weight = std::min(1 + depth, 16); // Limit weight to 16 for stability

	auto update_entry = [=](Value &entry) {
		int update = entry * (CORRHIST_WEIGHT - weight) + scaled_diff * weight;
		entry = std::clamp(update / CORRHIST_WEIGHT, (Value)(-MAX_HISTORY), MAX_HISTORY);
	};

	update_entry(corrhist_pawn[board.side][board.pawn_hash() % CORRHIST_SZ]);
}
```

We can call this function at the end of our search, passing in the difference between the static eval and the final eval, as well as the depth of the search. There are, however, a couple of conditions that we should check before updating:

```cpp
if (!in_check && !bestMove.is_capture() && !bestMove.is_promo()
	&& !(score < alpha && score >= raw_eval) && !(score > beta && score <= raw_eval)
	&& abs(score) < SCORE_MATE_MAX_PLY) {
	update_corrhist(board, score - raw_eval, depth);
}
```

Let's go through each of these conditions to understand why they are necessary:
- `!in_check`: We don't want to update corrhist when in check, because static evaluation in these positions is often very inaccurate.
- `!bestMove.is_capture() && !bestMove.is_promo()`: Captures and promotions can drastically change the evaluation, so we avoid updating corrhist for these moves.
- `!(score < alpha && score >= raw_eval)`: if our score fails low, we know that the true score is below it. If the static eval is below that score, we don't know if the true score is actually lower than the static eval, so we skip updating.
- `!(score > beta && score <= raw_eval)`: similar to the previous condition, but for fail-highs.
- `abs(score) < SCORE_MATE_MAX_PLY`: We don't want to update corrhist for mate scores, since they are not really comparable to static evals

Then, we can use corrhist when we're taking the static evaluation of a position:

```cpp
Value get_correction(Board &board) {
	int corr = 0;

	corr += corrhist_pawn[board.side][board.pawn_hash() % CORRHIST_SZ];

	return corr / CORRHIST_GRAIN;
}

...

Value raw_eval = eval(board) * side;
Value corrected_eval = raw_eval + get_correction(board);
```

And that's it! You've implemented pawn structure correction history.

```
Elo   | 7.46 +- 4.62 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.91 (-2.25, 2.89) [0.00, 5.00]
Games | N: 6056 W: 1430 L: 1300 D: 3326
Penta | [29, 660, 1525, 780, 34]
```
https://sscg13.pythonanywhere.com/test/1494/

(Do note that my engine really doesn't like corrhist, typical values for corrhist are around 20 Elo)
