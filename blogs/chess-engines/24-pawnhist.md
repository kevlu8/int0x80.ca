---
title: "24 - Pawn History"
slug: pawnhist
description: "Using pawn structure to get a history score"
date: 2026-11-17
---

# Pawn History
### 2026-11-17

Can you believe it? There are STILL more history tables.

Pawn history, or pawnhist, is a history table indexed by `[side][pawnhash][src_piece][dst]`, where `pawnhash` is a hash of the pawn structure (modulo some power of two) and the other terms follow standard history indexing (I mean, we've seen this pattern so many times before lol).

The general idea is similar to that of pawn correction history. Positions with the same pawn structure are likely to have similar move quality, so we can create a history table that takes pawn structure into account.

The full history table is usually defined as follows:

```cpp
Value pawnhist[2][1024][6][64];
```

No need for a large pawn hash argument, since that will just kill cache locality. Even a small modulo like this will give us a decent signal.

The rest is pretty simple. When updating history, we just update the entry:

```cpp
update_entry(pawnhist[pos.side][pos.pawn_hash() % PAWNHIST_SZ][piece][dst], bonus);
```

And when scoring a move, just add the corresponding history entry:

```cpp
score += pawnhist[pos.side][pos.pawn_hash() % PAWNHIST_SZ][piece][dst];
```

And that's it!

```
Elo   | 3.94 +- 2.77 (95%)
SPRT  | 40.0+0.40s Threads=1 Hash=128MB
LLR   | 2.91 (-2.25, 2.89) [0.00, 4.00]
Games | N: 14650 W: 3564 L: 3398 D: 7688
Penta | [15, 1638, 3851, 1808, 13]
```
https://ob.int0x80.ca/test/992/
