---
title: "10 - Static Exchange Evaluation"
slug: see
description: "Ignoring bad captures"
date: 2025-07-04
---

# Static Exchange Evaluation
### 2025-07-04

Earlier, when we discussed MVV-LVA, we mentioned that one common drawback is that it doesn't account for re-captures. For example, if we capture a pawn with a queen, and our opponent recaptures with a rook, MVV-LVA will still order the queen capture as a good move, even though it results in a net loss.

To fix this, we can use a technique called *static exchange evaluation* (SEE). This technique allows us to "see" the future exchanges that happen after a capture, and use that information to determine whether the capture is actually good or not.

Implementing a fast SEE algorithm is very complex (and beyond the scope of this post). If you're curious, you can see how I did it in my engine [here](https://github.com/kevlu8/PZChessBot/blob/main/engine/movegen.cpp#L702). For now, I'll just outline a very simple recursive approach.

```cpp
Value see(Board& pos, Square sq) {
	// Helper function
	auto [square, piece] = pos.least_valuable_attacker(sq);
	if (square == NO_SQUARE) return 0; // No attackers, return 0
	pos.remove_piece(square); // Remove the piece from the board
	Value val = max(0, PieceValue[piece] - see(pos, square)); // Calculate the value of the exchange
	pos.add_piece(square, piece); // Add the piece back to the board
	return val; // Return the value of the exchange
}

Value see_capture(Board& pos, Move move) {
	Value val = 0;
	Piece victim = pos.piece_on(move.to_square());
	pos.make_move(move);
	val = PieceValue[victim] - see(pos, move.to_square());
	pos.undo_move(move);
	return val;
}
```

If you do plan on implementing SEE, I highly discourage using a recursive approach, as it is very slow.

How do we use this in our quiescence search? Well, we can simply check if the SEE value of a capture is greater than 0 (i.e. does it lead to a net gain in material?). If it doesn't, we just skip the capture.

You might wonder if this would lead to missing some sacrifices or tactics. While this could be true, since we apply this only in our quiescence search, we aren't really missing much. Tactics and sacrifices are usually found in the main search.

```cpp
fastvector<std::pair<Move, Value>> assign_values_qs(fastvector<Move> &moves, Board &pos) {
	fastvector<std::pair<Move, Value>> values;
	for (Move m : moves) {
		if (is_capture(m)) {
			Value see_val = see_capture(pos, m);
			if (see_val < 0)
				continue;
			values.push_back({m, MVV_LVA[pos.piece_on(m.to)][pos.piece_on(m.from)] + 10000});
		}
	}
	return values;
}
```

```
Elo   | 43.51 +- 13.18 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 3.00 (-2.94, 2.94) [0.00, 5.00]
Games | N: 1212 W: 363 L: 212 D: 637
Penta | [22, 94, 247, 197, 46]
```
https://sscg13.pythonanywhere.com/test/415/

## PVS SEE

Naturally, the next question to ask is "can we use this in our main search?" And the answer is yes!

However, we need to be a lot more careful with SEE in our main search so as to avoid skipping tactical sacrifices.

A simple example is:

```cpp
if (depth <= 3 && best > -VALUE_INFINITE) {
	// Low depth and we have established a best move
	Value see = board.see(move);
	if (see < -300) continue; 
}
```

You can tune the max SEE depth and the SEE margin as you *see* fit. *See* what I did there? Okay, I'm sorry, I'll stop.

```
Elo   | 23.99 +- 9.36 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.91 (-2.25, 2.89) [0.00, 5.00]
Games | N: 1900 W: 536 L: 405 D: 959
Penta | [22, 178, 432, 283, 35]
```
https://sscg13.pythonanywhere.com/test/677/

We can take this a step further by having two separate SEE margins for noisy moves and quiet moves.

Generally, we can prune off quiet moves that lose material easier since they are unlikely to actually be good, whereas this isn't as true with captures that lose material.

```cpp
if (see < (-100 - 100 * noisy) * depth) continue;
```

```
Elo   | 5.17 +- 3.75 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 10560 W: 2521 L: 2364 D: 5675
Penta | [94, 1212, 2536, 1319, 119]
```
https://sscg13.pythonanywhere.com/test/917/
