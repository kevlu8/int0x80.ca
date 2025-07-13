---
title: "10 - Static Exchange Evaluation"
slug: see
description: "Ignoring bad captures"
---

# Static Exchange Evaluation
### 2025-07-04

Earlier, when we discussed MVV-LVA, we mentioned that one common drawback is that it doesn't account for re-captures. For example, if we capture a pawn with a queen, and our opponent recaptures with a rook, MVV-LVA will still order the queen capture as a good move, even though it results in a net loss.

To fix this, we can use a technique called *static exchange evaluation* (SEE). This technique allows us to "see" the future exchanges that happen after a capture, and use that information to determine whether the capture is actually good or not.

Implementing a fast SEE algorithm is very complex (and beyond the scope of this post). If you're curious, you can see how I did it in my engine [here](https://github.com/kevlu8/PZChessBot/blob/main/engine/movegen.cpp#L535). For now, I'll just outline a very simple recursive approach.

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
			if (see_val > 0) {
				values.push_back({m, MVV_LVA[pos.piece_on(m.to)][pos.piece_on(m.from)] + 10000});
			}
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
