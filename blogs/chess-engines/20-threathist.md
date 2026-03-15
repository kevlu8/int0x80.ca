---
title: "20 - Threat History"
slug: threathist
description: "Using threat info to index history"
date: 2026-03-14
---

# Threat History
### 2026-03-14

Back a very long time ago, we added the history heuristic for move ordering through a table indexed by `[side][src][dst]`. This table is decent at encoding the general "goodness" of a move, but, as we know, the more specific the better. For example, playing a centralizing move (e.g. Nd5! in the Italian as white) is often a very good move, but when the destination square is attacked (e.g. by a pawn on c6), the move is much worse. The main history table can't understand the difference between these two cases, indexing them both as [WHITE][C3][D5]. So, how can we fix this?

The solution is very simple: we can simply add more dimensions to our history table, indexing based on the threats towards the `src` and `dst` squares. This is what threat history, or threathist, does.

So, our history table becomes:

```cpp
int history[2][64][64][2][2]; // [side][src][dst][src_attacked][dst_attacked]
```

This way, we can in fact capture the difference between the two cases for Nd5. In the first case, `dst_attacked` is false, whereas in the second case, `dst_attacked` is true, allowing us to give the move a much lower score.

## How to determine if a square is attacked?

This is a great question. If we check for square attacks in the naive way (simulating a superpiece on the square and checking for attacks), this will be extremely expensive because we will be doing this twice for every move in the moveloop.

At the same time, we don't need to maintain a fully efficiently updateable attack map for the entire board - that adds additional complexity for no reason. A very simple solution is to recalculate attacks for both sides on every square at the end of `make_move`.

This is not as expensive as it sounds: keep in mind that we do one `make_move` per node, and in each node we also generate moves (!), calculate the static evaluation, and do a bunch of other stuff. Recalculating attacks on every square is not that much more expensive than all of this and generally won't be a bottleneck. It may slow down the engine by around 2-5%, but threat history will make up for this.

Obviously, we can now determine if a square is attacked easily:

```cpp
bool is_attacked(Square sq, Color side) {
	return attacks[side] & (1ULL << sq);
}
```

## Updating threat history

Everything else stays the exact same as regular history. We update in the same way, only now we take into account the attacks towards the `src` and `dst` squares. I trust you know how to do this.

```
Elo   | 13.12 +- 6.20 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 3.03 (-2.25, 2.89) [0.00, 5.00]
Games | N: 3206 W: 818 L: 697 D: 1691
Penta | [13, 313, 832, 430, 15]
```
https://ob.int0x80.ca/test/333/
