---
title: "2 - Hand-Crafted Evaluation"
slug: hand-crafted-evaluation
description: "What came before NNUE?"
date: 2025-10-11
---

# Hand-Crafted Evaluation
### 2025-10-11

*Disclaimer: This article serves mostly as a primer to evaluation and the goals of it. It will only cover theory, and will not include any code snippets. Feel free to skip ahead to the next article if you want!*

## Material Evaluation

If you've ever played chess (as I'm sure you have), the first rule you learned was probably that each piece has a certain value. We generally learn that pawns are worth 1 point, knights and bishops are worth 3 points, rooks are worth 5 points, and queens are worth 9 points. Kings don't have a value since they can't be captured.

This is going to be the basis upon which we can build a hand-crafted evaluation function. We can simply count up the material for each side and subtract our opponent's material from our own to get a score.

Most chess engines represent score in *centipawns* - that is, 1/100s of a pawn. This lets us be more precise with our evaluation and account for small differences. So, a pawn is worth 100 centipawns, a knight or bishop is worth 300 centipawns, a rook is worth 500 centipawns, and a queen is worth 900 centipawns.

## Piece-Square Tables

It's obvious that this method of evaluation is incredibly naive, and we can even see this in practice. If we let our engine run from the starting position with this evaluation function, it will shuffle its pieces around until it sees a way to capture material and gain an "advantage".

The second rule we are usually taught is that we want to control as much of the center of the board as possible. This means putting our pawns in the center, developing our knights and bishops towards the center, and castling to get our king to safety.

The most simple way to represent this knowledge is with piece-square tables. For each piece, we create an 8x8 table that gives a score for the piece being on each square. For example, a knight on the center squares (d4, d5, e4, e5) would get a higher score than a knight on the edge of the board (a1, a8, h1, h8).

Piece-square tables will usually beat material evaluation by a large margin, even if the tables are terribly made, simply because material evaluation virtually ignores all positional factors. In fact, with a good set of piece-square tables and a strong search function, you can get a chess engine to a rating of around 2500 Elo on the CCRL list!

Piece-square tables are the foundation for neural network evaluation - you will see why soon!

## Other Positional Factors

State-of-the-art hand-crafted evaluation functions will also include a variety of other positional factors, such as:

- Tapered evaluation (different weights for opening, middlegame, and endgame)
- Pawn structure (isolated pawns, doubled pawns, passed pawns, etc.)
- King safety (is the king exposed to attacks?)
- Endgame heuristics (can our pawns possibly promote? Can our king support the pawn?)
- Mobility (how many squares can our pieces move to?)
- Control of open files (rooks and queens on open files)

There are way too many to list, but the general theme is that these factors are all things that humans have learned over centuries of playing chess. The goal of a hand-crafted evaluation function is to encode this knowledge into a form that a computer can understand and use.

