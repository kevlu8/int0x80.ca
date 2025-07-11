# Other Histories
### 2025-07-05

We've already talked about the history heuristic in the move ordering blog. But, there are a ton of other history heuristics that we can use to improve our search! History heuristics are a very powerful tool, and it is important that we use them to their full potential.

## Capture History

When a capture move fails high, we increment its capture history score. It's basically the exact same as the traditional history heuristic, but just a special table for captures, indexed by `[piece][victim][to]`.

Then, we can use the capture history to replace LVA in our move ordering function:

```cpp
Value score = PieceValue[pos.piece_on(m.to)] + capture_history[pos.piece_on(m.from)][pos.piece_on(m.to)][m.to];
```

Why does this work better than LVA? Mainly because LVA is a static evaluation, and doesn't change based on the position at all, whereas capture history will change depending on cutoffs previously obtained.

## Counter Move History

Often, a move played by one side can be refuted by a move played by the other side, even if the aforementioned move is played at different depths. When this happens, the refuting move usually doesn't change too much. So, we can keep track of the refuting move and give it a bonus in the move ordering function.

```cpp
Move counter_history[2][64][64]; // [color][from][to]

...

if (m == counter_history[pos.side_to_move()][prev_move.from][prev_move.to]) {
	score += 1000; // CMH bonus
}
```

When a move fails high (beta cutoff), we store it in the counter move history table, indexed by the previous move.

```cpp
if (!m.is_capture()) {
	counter_history[pos.side_to_move()][prev_move.from][prev_move.to] = m;
}
```

Again, note that this is only for non-capture moves. Capture moves are handled by other heuristics (MVV-LVA, capture history, etc.).

How you get the previous move depends on your search implementation, but I suggest creating a `SearchState` struct that contains the move and static evaluation of previous positions. (The eval will come in useful later! Hint: improving heuristic)

```
Elo   | 2.65 +- 2.11 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.95 (-2.94, 2.94) [0.00, 5.00]
Games | N: 39456 W: 8332 L: 8031 D: 23093
Penta | [702, 4492, 9074, 4723, 737]
```
https://sscg13.pythonanywhere.com/test/447/

