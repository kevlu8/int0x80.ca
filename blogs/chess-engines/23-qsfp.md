---
title: "23 - QS Futility Pruning"
slug: qsfp
description: "Futility pruning in quiescence search"
date: 2026-10-13
---

# QS Futility Pruning
### 2026-10-13

A lot earlier in this series, we implemented futility pruning in our main search. Naturally, the next question is: can we do the same in quiescence search? And of course, the answer is yes.

There are some differences between main search futility pruning and qsearch futility pruning, however. Remember: in the quiescence search, we are generally only searching noisy moves (which we don't futility prune in the main search). As such, implementation usually goes as follows:

```cpp
// In the move-loop
if (best > -VALUE_MATE_MAX_PLY) {
    // [SEE pruning is usually here]

    Value futility = static_eval + 200;
    if (!in_check) {
        if (futility <= alpha && !pos.see(move, 1)) {
            best = max(best, futility);
            continue;
        }
    }
}
```

Essentially, if the static evaluation is pretty low, we skip moves that are either equal in exchange or worse. We still do a stand-pat-style estimate of the position (through the max with the `futility` variable), but we don't search the move.

```
Elo   | 3.69 +- 2.87 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 15352 W: 3654 L: 3491 D: 8207
Penta | [68, 1735, 3918, 1876, 79]
```
https://ob.int0x80.ca/test/579/
