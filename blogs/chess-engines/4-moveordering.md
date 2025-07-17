---
title: "4 - Move Ordering"
slug: moveordering
description: "Reaching maximum speed-up with alpha-beta search"
date: 2025-07-03
---

# Move Ordering
### 2025-07-03

In alpha-beta search, move ordering becomes extremely important. If we have the better moves towards the front of our move list, we can get an idea of what our "good enough" move is earlier, which allows us to be more aggressive in getting rid of bad moves. This is yet another lossless optimization that can speed up our search by a lot.

There are a ton of different ways to order moves - in fact, many top engines still gain ELO by experimenting with different move ordering techniques. However, I will only cover the most basic ones for now.

Also, it's important to note that most engines do not sort all moves at once, but rather perform a selection sort when they are searching. This is because if we get a beta cutoff on the first few moves (which is likely), we can save a lot of time by not sorting the rest of the moves.

## MVV-LVA

The most basic move ordering technique is MVV-LVA, which stands for "Most Valuable Victim - Least Valuable Attacker". This is used for ordering captures, and it works by just calculating the difference in value between the piece being captured and the piece that is capturing it. The higher the difference, the more valuable the move is.

Intuitively, it makes sense - if we can capture a queen with a pawn, it's almost never bad, but if we're capturing a pawn with a queen, it's probably more risky. However, note that this heuristic does not take into account tactical refutations. For example, if we capture a pawn with a queen that results in our queen being captured, it's obviously not a good move. But, this heuristic will still order it as a good move, because the queen is more valuable than the pawn. Fortunately, this heuristic is still very effective in practice.

Usually, we don't directly subtract the piece values, since generally capturing a piece is better than not performing a capture at all. There are a variety of ways this heuristic can be implemented, but this is how I like to do it.

```cpp
constexpr Value MVV_LVA[7][7] = {
	// PNBRQKX
	{15, 14, 13, 12, 11, 10, 0}, // Taking a pawn
	{25, 24, 23, 22, 21, 20, 0}, // Taking a knight
	{35, 34, 33, 32, 31, 30, 0}, // Taking a bishop
	{45, 44, 43, 42, 41, 40, 0}, // Taking a rook
	{55, 54, 53, 52, 51, 50, 0}, // Taking a queen
	{0, 0, 0, 0, 0, 0, 0}, // Taking a king (should never happen)
	{0, 0, 0, 0, 0, 0, 0} // No Piece
};
```

The cool thing with move ordering is that we can actually measure how effective it is. If we run a search with and without MVV-LVA, we can see how much of a difference it makes.

Without MVV-LVA, we explore `980012` nodes to reach depth 6, and with MVV-LVA, we explore `810380` nodes. Great!

```
--------------------------------------------------
Results of pz-mvvlva vs pz-ab (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 185.06 +/- 48.43, nElo: 204.67 +/- 44.14
LOS: 100.00 %, DrawRatio: 29.41 %, PairsRatio: 8.33
Games: 238, Wins: 166, Losses: 50, Draws: 22, Points: 177.0 (74.37 %)
Ptnml(0-2): [7, 2, 35, 18, 57], WL/DD Ratio: 34.00
LLR: 2.94 (100.0%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

## Killer Moves

Sometimes, we find a move that is so good that it causes a beta cutoff a bunch of times. These moves are called "killer moves", and we order them ahead.

For example, if our queen is being attacked by our opponent, and we notice that when we don't move our queen, they take our queen causing a beta cutoff, we can order this queen capture forward. However, killer moves must be quiet moves, since captures are already ordered by MVV-LVA.

Usually, we store two killer moves per depth.

```cpp
Move killer[2][MAX_PLY];

...

if (score >= beta) {
	if (!is_capture(move) && m != killer[0][ply] && m != killer[1][ply]) {
		killer[1][ply] = killer[0][ply];
		killer[0][ply] = move; // Store the killer move
	}
	return best;
}
```

Without killer moves, we explore `810380` nodes to reach depth 6, and with killer moves, we explore `220419` nodes.

```
--------------------------------------------------
Results of pz-killer vs pz-mvvlva (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 30.75 +/- 17.21, nElo: 35.66 +/- 19.84
LOS: 99.98 %, DrawRatio: 43.12 %, PairsRatio: 1.46
Games: 1178, Wins: 551, Losses: 447, Draws: 180, Points: 641.0 (54.41 %)
Ptnml(0-2): [72, 64, 254, 86, 113], WL/DD Ratio: 15.93
LLR: 2.96 (100.4%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

## History Heuristic

The history heuristic is a more advanced move ordering technique that uses a 3D array to store how good moves historically have been. If a move has been consistently good in the past, it's likely to be good in the future as well.

The 3D array is indexed by the side to move, source square, and the destination square of the move. However, the value in the array is usually calculated through the *history gravity formula*, which rewards unexpected gains and punishes unexpected losses. Additionally, we can penalize moves that have not produced beta cutoffs.

```cpp
Value history[2][64][64];

void update_history(int side, Square from, Square to, Value bonus) {
	int clamped_bonus = std::clamp(bonus, -MAX_HISTORY, MAX_HISTORY); // Ensure the bonus is within bounds
	history[side][from][to] += clamped_bonus - history[side][from][to] * abs(clamped_bonus) / MAX_HISTORY; // Update the history value
}

...

if (score >= beta) {
	if (!is_capture(move)) {
		Value bonus = depth * depth; // Usually quadratic is a good choice, because it rewards deeper searches more
		update_history(side_to_move, move.from, move.to, bonus); // Update the history
		for (Move m : searched_noncaptures) {
			update_history(side_to_move, m.from, m.to, -bonus); // Penalize bad quiet moves
		}
	}
	...
	return best;
}
```

Without the history heuristic, we explore `220419` nodes to reach depth 6, and with the history heuristic, we explore `130657` nodes.

```
--------------------------------------------------
Results of pz-history vs pz-killer (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 24.24 +/- 14.58, nElo: 29.85 +/- 17.88
LOS: 99.95 %, DrawRatio: 44.83 %, PairsRatio: 1.40
Games: 1450, Wins: 644, Losses: 543, Draws: 263, Points: 775.5 (53.48 %)
Ptnml(0-2): [77, 90, 325, 121, 112], WL/DD Ratio: 11.50
LLR: 2.96 (100.4%) (-2.94, 2.94) [0.00, 10.00]
--------------------------------------------------
```

## Putting It All Together

First, we need a function that takes in a list of raw moves and assigns them scores.

```cpp
fastvector<std::pair<Move, Value>> assign_values(fastvector<Move> moves, Board& pos, int ply) {
	fastvector<std::pair<Move, Value>> scored_moves;
	for (Move m : moves) {
		Value score = 0;
		if (is_capture(m)) {
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

Then, we can use this function in our alpha-beta search:

```cpp
Move next_move(fastvector<std::pair<Move, Value>> &moves) {
	int idx = 0;
	Move best = NullMove;
	Value score = -VALUE_INFINITE;
	for (int i = 0; i < moves.size(); i++) {
		if (moves[i].second > score) {
			score = moves[i].second;
			best = moves[i].first;
			idx = i;
		}
	}
	moves[idx] = { NullMove, -VALUE_INFINITE }; // Remove the best move from the list
	return best;
}
```

## Conclusion

To recap, we went from searching `980012` nodes to `125377` nodes, which is a speedup of around 7.5x! This is a huge improvement, and it shows how important move ordering is in alpha-beta search. Plus, we didn't lose any search quality, meaning that we still find the same best move as before, just in a fraction of the time.

There are many other move ordering techniques that will help in the future, and I will cover them as they become more and more relevant. But, for now, these three techniques are enough to get you started with move ordering in alpha-beta search.
