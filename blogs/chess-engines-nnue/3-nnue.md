---
title: "3 - NNUE"
slug: nnue
description: "What is NNUE and how does it work?"
date: 2025-10-11
---

# NNUE
### 2025-10-11

Imagine if we didn't have to spell everything out to the computer. What if we could just show it a bunch of chess positions, and let it figure out what makes a position good or bad?

This is the idea behind neural networks. A neural network is a mathematical model that contains several layers of neurons and functions that connect them. These functions can vary, but for our purposes, we will only be using linear functions and SCReLU activation functions. If you don't know what these are, don't worry about it for now - I'll explain them later!

Historically, we've always wondered if neural networks could be used for chess evaluation. They can encode so many more features than a hand-crafted evaluation, and they can learn from data rather than relying on human knowledge. However, the problem with neural networks is that they are slow. A typical neural network with a few layers and a few hundred neurons per layer can take several milliseconds to evaluate a position. This is far too slow for a chess engine, which needs to evaluate millions of positions per second.

The main breakthrough came in 2018, when the Shogi community discovered NNUE. NNUE, which stands for "Efficiently Updatable Neural Network", eliminates the speed issue by using a sparse input layer with only a single hidden layer. This allows for extremely fast evaluation, while still being able to encode a large number of features.

## Input Layer

First of all, we need an efficient way to pass a chess position to the neural network. Currently, the best approach is to use a sparse 768-neuron binary input layer.

That means that we define an array of length 768 that will represent the position. Each neuron in the input layer will either be 0 or 1, depending on whether a certain feature is present in the position.

Generally, we can index it with the following function:

```cpp
int calculate_index(Square sq, PieceType pt, bool side, bool perspective) {
	if (perspective) { // If we are calculating from black's perspective
		side = !side; // Flip the side
		sq = (Square)(sq ^ 56); // Flip the square vertically
	}
	return side * 64 * 6 + pt * 64 + sq;
}
```

Where `pt` is the piece type (0-5 for pawn, knight, bishop, rook, queen, king), `sq` is the square index (0-63), `side` is 1 if the piece belongs to the opponent and 0 otherwise, and `perspective` is true if we are evaluating from black's perspective.

The architecture of the input layer is crucial to the performance of the NNUE. The reason why this layout is preferred is because we can perform incremental updates on it.

Note that we flip things over for the black side because evaluation is always done from the perspective of the side to move.

## Incremental Updates

Let's assume we have a position and its corresponding input layer. If a piece were to move, we don't need to recalculate the entire input layer from scratch. Instead, we can update only the neurons that correspond to the piece's old and new positions (also accounting for possible captures or promotions).

These incremental updates are what makes NNUE so efficient. We only have to update the parts of network that have changed instead of possibly re-evaluating it from scratch.

## Hidden Layer

The hidden layer is where the magic truly happens! But it's also the most complex part of the network.

Usually, we define a constant `HL_SIZE` to represent the size of the hidden layer. Although there's no "magic value" for this, common sizes are nice multiples of 64 like 512, 1024, or 1536. Going beyond this usually slows down the network without significant gains in accuracy.

During network inference, we maintain two arrays: `stm_acc` and `ntm_acc`, each of size `HL_SIZE`. These arrays are the *accumulators* for the side to move and the non-side to move, respectively.

To determine the values of these accumulators, we propagate the input layer forward through the first layer of weights. This is done using a simple matrix-vector multiplication:

```cpp
void accumulator_set(Accumulator &acc, InputLayer &input) {
	for (int i = 0; i < HL_SIZE; i++) {
		acc[i] = biases1[i];
		int sum = 0;
		for (int j = 0; j < 768; j++) {
			sum += weights1[i][j] * input[j];
		}
		acc[i] += sum;
	}
}
```

Then, we concatenate the two accumulators to form a single array of size `2 * HL_SIZE`. We are now ready to propagate this through the second layer of weights to get our final evaluation.

## Output Layer

The final step is to do one last forward pass.

```cpp
void nnue_eval(Accumulator &stm_acc, Accumulator &ntm_acc) {
	int score = 0;
	for (int i = 0; i < HL_SIZE; i++) {
		int stm_val = std::clamp(stm_acc[i], 0, QA); // clamp to avoid overflows
		int ntm_val = std::clamp(ntm_acc[i], 0, QA);
		score += (stm_val * stm_val) * weights2[i]; // SCReLU activation
		score += (ntm_val * ntm_val) * weights2[i + HL_SIZE]; // basically concatenation without actually doing it
	}

	score /= QA;
	score += bias2;
	score *= SCALE;
	score /= QA * QB;

	return score;
}
```

Here, `QA` and `QB` are constants for quantization (usually QA=255 and QB=64). The `SCALE` constant is used to scale the final output to a reasonable range (usually SCALE=400).

## Quantization

While modern CPUs are decently good at floating point math, integer math is still a lot faster. To take advantage of this, we do all NNUE operations in integer space, sacrificing a little bit of precision for speed.

Usually, your trainer should be able to output quantized weights and you won't need to worry about it.
