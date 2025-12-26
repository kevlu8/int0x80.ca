---
title: "18 - Continuation History"
slug: more-history
description: "Using previous moves to get a history score"
date: 2025-10-02
---

# Continuation History
### 2025-10-02

We've already covered traditional butterfly, capthist, and counter-move history. But there's still more!

Continuation history, also known as conthist, is a large history table indexed by `[prevside][prevpiece][prevdst][side][piece][dst]`. That's `[2][6][64][2][6][64]` in total, which sounds like a mess, but trust me, it's not that bad.

First of all, we can make a struct:

```cpp
struct ContHistEntry {
    Value history[2][6][64];
    ContHistEntry() { memset(history, sizeof(history), 0); }
};
```

Then, make it so each search stack entry in the `line` contains a pointer to a `ContHistEntry`:

```cpp
struct SSEntry {
	Move best_move;
	Value eval;
	Move excl;
    ContHistEntry *cont_hist;
};
```

Then, we can make a global conthist array for the entire thing:

```cpp
ContHistEntry main_conthist[2][6][64];
```

Right before we make a move in the moveloop, we assign the correct pointer:

```cpp
line[ply].cont_hist = &main_conthist[side][board.piece_on(move.src())][move.dst()];
...
board.make_move(move)
...
```

We treat conthist as (almost) identical to the main butterfly history, updating them at the same time by the same amount. There are some differences though!

## 1-ply conthist

Let's implement 1-ply conthist first just to get an idea of how it works.

In our previous history update function, we use the history gravity formula to update the main history. To do this for conthist, it's very easy:

```cpp
void History::update_history(Board &board, Move &move, int ply, SSEntry *line, Value bonus) {
	int cbonus = std::clamp(bonus, (Value)(-MAX_HISTORY), MAX_HISTORY);
	history[board.side][move.src()][move.dst()] += cbonus - history[board.side][move.src()][move.dst()] * abs(bonus) / MAX_HISTORY;
	int conthist = get_conthist(board, move, ply, line);
	if (ply >= 1 && (line - 1)->cont_hist)
		(line - 1)->cont_hist->hist[board.side][board.mailbox[move.src()] & 7][move.dst()] += cbonus - conthist * abs(bonus) / MAX_HISTORY;
}
```

(Also note that I moved history into its own class - this is very helpful, especially if you plan on adding multithreaded search later on)

Then, when using history for move ordering and for history pruning, we simply add on the conthist value.

```cpp
int History::get_conthist(Board &board, Move move, int ply, SSEntry *line) {
	int score = 0;
	if (ply >= 1 && (line - 1)->cont_hist)
		score += (line - 1)->cont_hist->hist[board.side][board.mailbox[move.src()] & 7][move.dst()];
	return score;
}

int History::get_history(Board &board, Move move, int ply, SSEntry *line) {
	int score = history[board.side][move.src()][move.dst()];
	score += get_conthist(board, move, ply, line);
	return score;
}
```

Simple as that!

Only using conthist for move ordering:

```
Elo   | 4.84 +- 3.50 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.96 (-2.25, 2.89) [0.00, 5.00]
Games | N: 11048 W: 2566 L: 2412 D: 6070
Penta | [67, 1261, 2718, 1407, 71]
```
https://sscg13.pythonanywhere.com/test/1168/

Also using conthist for history pruning:

```
Elo   | 6.74 +- 4.38 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.90 (-2.25, 2.89) [0.00, 5.00]
Games | N: 7014 W: 1696 L: 1560 D: 3758
Penta | [39, 786, 1730, 904, 48]
```
https://sscg13.pythonanywhere.com/test/1170/

You may have realized by now that conthist feels really similar to the counter-move history. In fact, it is! And now that we've added conthist, we can remove counter-move history without losing Elo (possibly even gaining).

Removing counter-move history:

```
Elo   | 1.49 +- 3.17 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.95 (-2.25, 2.89) [-5.00, 0.00]
Games | N: 13546 W: 3158 L: 3100 D: 7288
Penta | [73, 1640, 3311, 1654, 95]
```
https://sscg13.pythonanywhere.com/test/1176/

## N-ply conthist

Well, it's pretty obvious how you can add more plies to conthist. All you need to do is change the `update_history` and `get_conthist` functions to also use more plies.

2-ply conthist:

```
Elo   | 8.04 +- 4.77 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.98 (-2.25, 2.89) [0.00, 5.00]
Games | N: 5618 W: 1347 L: 1217 D: 3054
Penta | [26, 603, 1424, 727, 29]
```
https://sscg13.pythonanywhere.com/test/1171/

Also, it is generally known that even plies work better than odd plies (with the exception of 1).

3-ply conthist:

```
Elo   | 5.31 +- 3.68 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 3.00 (-2.25, 2.89) [0.00, 5.00]
Games | N: 9686 W: 2249 L: 2101 D: 5336
Penta | [44, 1107, 2405, 1231, 56]
```
https://sscg13.pythonanywhere.com/test/1522/

4-ply conthist:

```
Elo   | 10.84 +- 5.68 (95%)
SPRT  | 40.0+0.40s Threads=1 Hash=128MB
LLR   | 2.94 (-2.25, 2.89) [0.00, 5.00]
Games | N: 3846 W: 938 L: 818 D: 2090
Penta | [6, 424, 951, 528, 14]
```
https://sscg13.pythonanywhere.com/test/1535/

(4-ply conthist actually lost Elo at STC)
