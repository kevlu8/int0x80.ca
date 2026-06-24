---
title: "21 - More Extensions"
slug: moreextensions
description: "Extending even further"
date: 2026-06-24
---

# More Extensions
### 2026-06-24

In post 13, we covered many different types of extensions, the most significant one being **singular extensions**. This is already a massive improvement for the engine, especially in evaluating forcing lines, but can we do better?

As is often the case, the answer is yes! When a position seems especially forcing (i.e. the singular search score is significantly below the singular beta), we can extend even more.

## Double Extensions

Scaffolding on the code we wrote earlier for singular extensions, it is actually very simple to implement double extensions.

```cpp
...
	if (singular_score < singular_beta) {
		// If after excluding the singular move, we get a bad score, then it's singular
		extension++;

		// Double extensions, for when a move is very forcing
		int dext_margin = 25;
		if (singular_score < singular_beta - dext_margin)
			extension++;
	}
```

Simple as that!

```
Elo   | 3.97 +- 3.08 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.92 (-2.25, 2.89) [0.00, 5.00]
Games | N: 15300 W: 3784 L: 3609 D: 7907
Penta | [121, 1798, 3658, 1931, 142]
```
https://sscg13.pythonanywhere.com/test/1343/

As is the case with many extension heuristics, this tends to not gain very much initially but as your search improves, it will become more and more useful.

## Triple Extensions

Well... it's exactly what the name suggests. Must I say more?

```cpp
...
	if (singular_score < singular_beta) {
		// If after excluding the singular move, we get a bad score, then it's singular
		extension++;

		// Double extensions, for when a move is very forcing
		int dext_margin = 25;
		if (singular_score < singular_beta - dext_margin)
			extension++;

		// Triple extensions, for even more forcing moves
		int text_margin = 100;
		if (!pv && singular_score < singular_beta - text_margin)
			extension++;
	}
```

Note that we don't do triple extensions in PV nodes because PV nodes are extremely expensive to search and we don't want to cause search explosions.

```
Elo   | 3.66 +- 2.85 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.89 (-2.25, 2.89) [0.00, 5.00]
Games | N: 15276 W: 3642 L: 3481 D: 8153
Penta | [39, 1800, 3813, 1933, 53]
```
https://ob.int0x80.ca/test/499/

Again, a heuristic that becomes more useful as your search improves.

## Modifiers on Extension Margins

Not all moves should be treated equally. Certain moves are more worth extending than others. Why is this?

## Captures

As an example, let us zoom out for a second: in the game of chess, trades happen often, whether it be the recapturing of the d4-pawn in the Najdorf or the trade of queens in certain lines of the Philidor. Given this, if we have a capture move that is significantly better than all other moves, it's less likely that the capture is an extremely tactical forcing move rather than a simple recapture. As such, we can increase the margin for higher-order extensions for capture moves.

```cpp
int dext_margin = 25 + (10 * is_capture(move));
...
int text_margin = 100 + (30 * is_capture(move));
```

This way, it's harder for captures to result in double extensions.

## PV Nodes

Like we previously said, we don't do triple extensions in PV nodes. But then why do we do double extensions in PV nodes?

Admittedly, the truth is a bit more complicated - many top engines *don't* do double extensions in PV nodes. However, as an avid fan of extensions and a believer in their scalability (i.e. ability to become more useful in long time controls), I believe that double extensions in PV nodes has merit.

Of course, we should still take care not to recklessly extend expensive PV nodes. As such, we can increase the margin for double extensions in PV nodes.

```cpp
int dext_margin = 25 + (10 * is_capture(move)) + (20 * pv);
```

```
Elo   | 7.69 +- 4.64 (95%)
SPRT  | 8.0+0.08s Threads=1 Hash=32MB
LLR   | 2.96 (-2.25, 2.89) [0.00, 5.00]
Games | N: 5830 W: 1439 L: 1310 D: 3081
Penta | [19, 639, 1481, 746, 30]
```
https://ob.int0x80.ca/test/352/
