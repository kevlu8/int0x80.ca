# Other Histories
### 2025-07-05

We've already talked about the history heuristic in the move ordering blog. But, there are a ton of other history heuristics that we can use to improve our search! History heuristics are a very powerful tool, and it is important that we use them to their full potential.

## Capture History

When a capture move fails high, we increment its capture history score. It's basically the exact same as the traditional history heuristic, but just a special table for captures, indexed by `[piece][victim][to]`.

Then, we can use the capture history to replace LVA in our move ordering function:

```cpp
Value score = PieceValue[pos.piece_on(m.to)] + capture_history[pos.piece_on(m.from)][pos.piece_on(m.to)][m.to];
```

## Counter Move History

