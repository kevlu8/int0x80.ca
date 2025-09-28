---
title: "17 - Advanced LMR"
slug: advanced-lmr
description: "Even more LMR techniques"
date: 2025-09-20
---

# Advanced LMR
### 2025-09-20

We talked about late move reductions (LMR) a long time ago. But the LMR that we went over back then was very basic - we reduced all moves based on a certain formula. Surely we can do better?

## PV-nodes

Since PV-nodes are the most important nodes, it makes sense to do LMR less aggressively on them.

```cpp
Value r = reduction[i][depth];
r -= (node_type == PV_NODE) * 1;
```

```
Elo   | 11.51 +- 6.10 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 3866 W: 946 L: 818 D: 2102
Penta | [24, 426, 921, 522, 40]
```
https://sscg13.pythonanywhere.com/test/831/

## Cutnodes

When we are in an expected cutnode, we can be more aggressive with our reductions.

```cpp
r += (node_type == CUT_NODE) * 1;
```

```
Elo   | 4.84 +- 3.57 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.93 (-2.25, 2.89) [0.00, 5.00]
Games | N: 11850 W: 2824 L: 2659 D: 6367
Penta | [109, 1387, 2792, 1504, 133]
```
https://sscg13.pythonanywhere.com/test/915/

## Killer Moves

We can reduce killer moves less since we know they've worked in the past.

```cpp
if (moves[i] == killer[0][ply] || moves[i] == killer[1][ply]) r -= 1;
```

```
Elo   | 16.22 +- 7.29 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.97 (-2.25, 2.89) [0.00, 5.00]
Games | N: 2680 W: 685 L: 560 D: 1435
Penta | [14, 279, 645, 372, 30]
```
https://sscg13.pythonanywhere.com/test/1052/

## Quantized LMR

We can make our reductions more fine-grained by treating them as floating point numbers, and rounding them at the end.

Obviously, we shouldn't directly use floats (because they're slow and error-prone), so we can instead say that a reduction of 1 ply is 1024 units.

This allows us to be more precise with our reductions, especially when performing SPSA tuning.

```cpp
Value r = reduction[i][depth]; // in 1024 units
r -= (node_type == PV_NODE) * 1024;
r += (node_type == CUT_NODE) * 1024;
if (moves[i] == killer[0][ply] || moves[i] == killer[1][ply]) r -= 1024;
...
Value searched_depth = depth - r / 1024;
...
```
