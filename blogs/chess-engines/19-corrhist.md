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
#define CORRHIST_SZ 16384
#define MAX_CORRHIST 1024

Value corrhist_pawn[2][CORRHIST_SZ];
```

To update corrhist, we can still use the history gravity formula:

```cpp
void update_corrhist(Board &board, int bonus) {
	auto update_entry = [=](Value &entry) {
		int update = std::clamp(bonus, -MAX_CORRHIST / 4, MAX_CORRHIST / 4);
		entry += update - entry * abs(update) / MAX_CORRHIST;
	};

	update_entry(corrhist_pawn[board.side][board.pawn_hash() % CORRHIST_SZ]);
}
```

We can call this function at the end of our search, passing in the difference between the static eval and the final eval, as well as the depth of the search. There are, however, a couple of conditions that we should check before updating:

```cpp
if (!in_check && !bestMove.is_capture() && !bestMove.is_promo()
	&& !(flag == UPPER_BOUND && score >= corrected_eval) && !(flag == LOWER_BOUND && score <= corrected_eval)
	&& abs(score) < SCORE_MATE_MAX_PLY) {
	update_corrhist(board, (score - corrected_eval) * depth / 8);
}
```

Let's go through each of these conditions to understand why they are necessary:
- `!in_check`: We don't want to update corrhist when in check, because static evaluation in these positions is often very inaccurate.
- `!bestMove.is_capture() && !bestMove.is_promo()`: Captures and promotions can drastically change the evaluation, so we avoid updating corrhist for these moves.
- `!(flag == UPPER_BOUND && score >= corrected_eval)`: if our score fails low, we know that the true score is below it. If the static eval is below that score, we don't know if the true score is actually lower than the static eval, so we skip updating.
- `!(flag == LOWER_BOUND && score <= corrected_eval)`: similar to the previous condition, but for fail-highs.
- `abs(score) < SCORE_MATE_MAX_PLY`: We don't want to update corrhist for mate scores, since they are not really comparable to static evals

Then, we can use corrhist when we're taking the static evaluation of a position:

```cpp
Value get_correction(Board &board) {
	int corr = 0;
	corr += 128 * corrhist_pawn[board.side][board.pawn_hash() % CORRHIST_SZ];

	return corr / 2048;
}

...

Value raw_eval = eval(board) * side;
Value corrected_eval = raw_eval + get_correction(board); // Make sure to do this in both the main search and quiescence search
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

(Subsequent bug fix test:)

```
Elo   | 11.26 +- 6.62 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.89 (-2.25, 2.89) [-5.00, 0.00]
Games | N: 2932 W: 725 L: 630 D: 1577
Penta | [12, 310, 729, 401, 14]
```
https://sscg13.pythonanywhere.com/test/1686/

## Nonpawn Corrhist

Another easy gainer is using non-pawn hashes. That is, we maintain two hashes for each side, corresponding to the non-pawn pieces they have.

```cpp
uint64_t np_hash[2] = {};
```

We then keep track of this hash value through our move making and unmaking.

The corrhist table is extremely simple:

```cpp
Value nonpawn_corrhist[2][2][CORRHIST_SZ]; // [side to move][color][nonpawn hash of color]

...
void update_corrhist(Board &board, int bonus) {
	...
	update_entry(nonpawn_corrhist[board.side][WHITE][board.nonpawn_hash(WHITE) % CORRHIST_SZ]);
	update_entry(nonpawn_corrhist[board.side][BLACK][board.nonpawn_hash(BLACK) % CORRHIST_SZ]);
}

...
Value get_correction(Board &board) {
	...
	corr += 128 * nonpawn_corrhist[board.side][WHITE][board.nonpawn_hash(WHITE) % CORRHIST_SZ];
	corr += 128 * nonpawn_corrhist[board.side][BLACK][board.nonpawn_hash(BLACK) % CORRHIST_SZ];
	...
}
```

```
Elo   | 16.56 +- 7.33 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.93 (-2.25, 2.89) [0.00, 5.00]
Games | N: 2540 W: 636 L: 515 D: 1389
Penta | [11, 268, 595, 381, 15]
```
https://sscg13.pythonanywhere.com/test/1688/

## Major Corrhist

We can also make a hash key for our major pieces (king, queen, rook) and make a corrhist table for that.

```cpp
Value major_corrhist[2][CORRHIST_SZ];

...
void update_corrhist(Board &board, int bonus) {
	...
	update_entry(major_corrhist[board.side][board.major_hash() % CORRHIST_SZ]);
}

...
Value get_correction(Board &board) {
	...
	corr += 64 * major_corrhist[board.side][board.major_hash() % CORRHIST_SZ];
	...
}
```

We typically weigh this corrhist less because major pieces tend to be more dynamic and their value can swing more wildly based on position.

```
Elo   | 3.73 +- 2.89 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.91 (-2.25, 2.89) [0.00, 5.00]
Games | N: 15106 W: 3460 L: 3298 D: 8348
Penta | [53, 1756, 3777, 1910, 57]
```
https://sscg13.pythonanywhere.com/test/1823/

## Minor Corrhist

Naturally, we can also make a correction history for minor pieces (king, bishop, knight). Note that the king isn't typically known as a "minor piece", but it appears to gain from this treatment.

```cpp
Value minor_corrhist[2][CORRHIST_SZ];
...
void update_corrhist(Board &board, int bonus) {
	...
	update_entry(minor_corrhist[board.side][board.minor_hash() % CORRHIST_SZ]);
}
...
Value get_correction(Board &board) {
	...
	corr += 64 * minor_corrhist[board.side][board.minor_hash() % CORRHIST_SZ];
	...
}
```

```
Elo   | 2.98 +- 2.40 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.91 (-2.25, 2.89) [0.00, 5.00]
Games | N: 21312 W: 4784 L: 4601 D: 11927
Penta | [76, 2428, 5461, 2619, 72]
```
https://sscg13.pythonanywhere.com/test/1828/

## Continuation Corrhist

Similarly to continuation history, we can also maintain a corrhist table indexed by the past 2 played moves. The only difference is that when evaluating, we don't have a current move so we index by the previous move and the move before that.

I won't show the implementation here because it's relatively simple. It's basically the same as the code from the last post, so just yoink that and modify it slightly.

```
Elo   | 5.89 +- 3.98 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 7904 W: 1827 L: 1693 D: 4384
Penta | [26, 882, 2014, 992, 38]
```
https://sscg13.pythonanywhere.com/test/1848/
