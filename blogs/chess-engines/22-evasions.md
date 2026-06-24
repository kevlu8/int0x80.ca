---
title: "22 - Evasions"
slug: evasions
description: "Making QSearch more useful"
date: 2026-06-24
---

# Evasions
### 2026-06-24

Back when we first implemented quiescence search, we only searched captures and promotions, and if we were in check and no legal capture or promotion move existed, we just returned the evaluation.

This is in fact quite a big flaw, because our static evaluation is inherently unreliable while in check - this is precisely why nearly none of the search heuristics that rely on evaluation are active while in check.

So, we need to somehow allow the engine to escape check, even if it means that we have to search a bit deeper. This is called evasions.

(We'll assume that you already have legal move detection)

```cpp
for (Move m : pos.legal_moves()) {
    bool skip_quiets = false;
    if (is_legal(m)) {
        skip_quiets = true; // as soon as we have a legal move, skip quiets

        pos.make_move(m);
        Value score = -quiescence(pos, -side, -beta, -alpha);
        pos.undo_move(m);

        if (score > stand_pat) {
            stand_pat = score; // Update the best score if we found a better one
            if (score > alpha) {
                alpha = score;
            }
        }
        if (score >= beta) {
            return score; // Beta cutoff
        }
    }
}
```

For simplicity's sake, I used a simple boolean flag to skip quiet moves. However, most top engines use something called a "MovePicker" to handle this, which is faster and generates moves in stages. However, I hate it and it's boring and it sucks so I'm not going to cover it in this series.

Rant aside, although evasions can be finnicky to get working, they are very useful in a number of ways. For example, we can now return mate scores from quiescence search!

```
Elo   | 10.98 +- 5.74 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.96 (-2.25, 2.89) [0.00, 5.00]
Games | N: 3892 W: 977 L: 854 D: 2061
Penta | [7, 439, 943, 538, 19]
```
https://ob.int0x80.ca/test/457/
