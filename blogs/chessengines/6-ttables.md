# Transposition Tables
### 2025-07-03

You may recall in post 1 of this series where I mentioned chess game trees aren't actually trees, but rather directed graphs. This is because there are multiple ways to reach the same position. A quick (yet slightly ridiculous) example is the following:

```
1. Na3 Na6
2. Nb1 Nb8
```

...and we're back to the starting position!

If we reach the same position multiple times, we don't want to search it again, because that would be a waste of time. Hmm... storing results of previous searches on smaller subtrees? If you're deep in the competitive programming scene, you might recognize this as dynamic programming. And you would be right!

## Hashing

To store the results of previous searches, we need a way to uniquely identify each position. While yes, we could use the position itself, this would be extremely inefficient and slow. Instead, we use a technique called hashing.

Once again, I won't explain hashing in detail, because this is not a first-year computer science course. But, I will give a brief overview of how it works in chess engines.

While chess positions aren't as easily hashable as strings, we can still use a technique called Zobrist hashing to create a unique hash for each position. Zobrist hashing works by assigning a random number to each piece on each square, and then XORing these numbers together to create a unique hash for the position. We also encode some other information, like each side's castling rights and the en passant square (if it exists).

```cpp
uint64_t zobrist_pieces[64][15]; // 64 squares, 15 pieces (including empty square)
uint64_t zobrist_castling[16]; // 16 castling rights (KQkq, KQk, etc.)
uint64_t zobrist_en_passant[9]; // 8 possible en passant squares + no en passant
uint64_t zobrist_side; // 1 for white, 0 for black
```

We can easily compute this on-the-fly as we make moves by just using the XOR operator. Implementing this correctly, however, is slightly tedious, but the speedup is worth it.

## The Table

Okay, we have a working hash function, but how do we store the results of previous searches?

We use a hash table to store the results of previous searches. The key is the hash of the position, and the value is a struct containing the score, depth, and other information about the search.

```cpp
struct TTEntry {
	Value eval; // The score of the position
	int depth; // The depth at which the score was found
	Move best_move; // The best move found in this position
	uint8_t flag; // The type of entry (exact, lower bound, upper bound) so we don't use cutoff scores as exact scores
};

constexpr int TT_SIZE = 1 << 20; // 1 million entries

TTEntry transposition_table[TT_SIZE];
```

When we return from our negamax function, we try storing the result in the transposition table. Unfortunately, we might discover that the slot is already taken in the table (hash collision). In this case, how do we decide whether to overwrite the entry or not?

On one hand, it might be wise to choose the entry with a higher depth. Entries with high depth have more computational weight behind them, meaning that we save more time by using them.

On the other hand, entries near leaf nodes will probably be hit multiple times, and entries we searched recently will also be hit more often.

For now, we can just use the depth-focused approach, but in the future, we can experiment with more advanced techniques like aging.

```cpp
void TTable::store(uint64_t key, Value eval, uint8_t depth, TTFlag flag, Move best_move, uint8_t age) {
	TTEntry *entry = TT + (key % TT_SIZE);
	if (entry->flags == INVALID) tsize++;
	if (entry->key != key || entry->depth > depth) {
		// This entry contains more information than the new one
		// So we don't overwrite it
		return;
	}
	entry->key = key;
	entry->eval = eval;
	entry->depth = depth;
	entry->flags = flag;
	entry->best_move = best_move;
	entry->age = age;
}
```

And probing is just as simple:

```cpp
TTable::TTEntry *TTable::probe(uint64_t key) {
	TTEntry *entry = TT + (key % TT_SIZE);
	if (entry->key != key)
		return nullptr;
	return entry;
}
```

## Usage

So, how do we even use the results from the transposition table? It's actually quite simple. Before we start searching a position, we check if we have a result for it in the transposition table. If we do, we can use that result instead of searching the position again.

```cpp
TTable::TTEntry *entry = ttable.probe(zobrist_hash);
if (entry && entry->depth >= depth) {
	// Entry exists and satisfies depth requirement
	if (entry->flags == EXACT) {
		return entry->score; // Exact score, we can return it
	} else if (entry->flags == LOWER) {
		if (entry->score >= beta) return entry->score; // Lower bound, we can prune the search
	} else if (entry->flags == UPPER) {
		if (entry->score <= alpha) return entry->score; // Upper bound, we can prune the search
	}
}
```

This is known as transposition table cutoffs.

```
--------------------------------------------------
Results of pz-tt-cutoff vs pz-qs-mvv (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 54.25 +/- 22.98, nElo: 67.15 +/- 27.94
LOS: 100.00 %, DrawRatio: 31.65 %, PairsRatio: 1.86
Games: 594, Wins: 253, Losses: 161, Draws: 180, Points: 343.0 (57.74 %)
Ptnml(0-2): [19, 52, 94, 82, 50], WL/DD Ratio: 3.09
LLR: 2.95 (100.1%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

## Move Ordering

The benefits don't stop there! Since we also store the best move we found in the position, we can use this to order our moves. In the vast majority of cases, the best move that we found before will still be either the best move or one of the best moves in the current position. This means that we can use this move to order our moves, which will result in fewer nodes being searched and a *much* faster search.

```cpp
fastvector<std::pair<Move, Value>> assign_values(fastvector<Move> moves, Board& pos, int ply, Move hash_move) {
	fastvector<std::pair<Move, Value>> scored_moves;
	for (Move m : moves) {
		Value score = 0;
		if (m == hash_move) score = VALUE_INFINITE; // Make sure that hash move goes first
		else if (is_capture(m)) {
			score = MVV_LVA[pos.piece_on(m.to)][pos.piece_on(m.from)] + 10000; // Add an offset for captures
		} else {
			if (m == killer[0][ply]) score += 1500;
			else if (m == killer[1][ply]) score += 1000; // Add a bonus for killer moves
			score += history[pos.side_to_move()][m.from][m.to]; // Use history heuristic for quiet moves
		}
		scored_moves.push_back({m, score});
	}
	return scored_moves;
}
```

```
--------------------------------------------------
Results of pz-tt-move vs pz-tt-cutoff (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 79.58 +/- 27.59, nElo: 99.22 +/- 33.15
LOS: 100.00 %, DrawRatio: 37.91 %, PairsRatio: 3.09
Games: 422, Wins: 202, Losses: 107, Draws: 113, Points: 258.5 (61.26 %)
Ptnml(0-2): [15, 17, 80, 56, 43], WL/DD Ratio: 3.00
LLR: 2.96 (100.6%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```