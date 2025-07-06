# Extensions
### 2025-07-05

In theory, we want to search the positions that are likely to lead to a win the deepest, or at least deeper. But how do we determine which positions lead to wins?

## Check Extensions

This is an obvious one. If we play a move that results in us checking the opponent, we should search deeper. This is especially relevant because checks are *forcing moves*, meaning that the opponent has to respond to them. 

An easy way to implement this is not actually in the move loop, but rather at the beginning of the search function. If we are in check, we search deeper.

```cpp
if (in_check) depth++;
```

This one line is sufficient!

```
Elo   | 55.65 +- 14.86 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.97 (-2.94, 2.94) [0.00, 5.00]
Games | N: 850 W: 263 L: 128 D: 459
Penta | [3, 66, 188, 129, 39]
```
https://sscg13.pythonanywhere.com/test/430/
