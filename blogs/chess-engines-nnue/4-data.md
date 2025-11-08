---
title: "4 - Data"
slug: data
description: "How do we get data for training?"
date: 2025-10-11
---

# Data
### 2025-10-11

If I was able to communicate my ideas clearly in the previous articles, you should now have a good theoretical understanding of NNUE. However, theory is only half the story. To actually create a working NNUE, we need to train it on data.

## Leela Data

In the chess engine world, data from Leela Chess Zero selfplay games is generally considered the best available data. We don't know why it's so much better than basically any other data source, but it just is.

You can download data [here](https://robotmoon.com/nnue-training-data/).

Unfortuantely, the use of Leela data is heavily frowned upon by the engine development community (there is literally a debate every week over the validity of using it). Many people consider it as "cheating", and prefer engines to be trained organically from selfplay games. However, this is a really time-consuming and expensive process, so (at least in my opinion) if you just want to make a strong engine, using Leela data is the way to go.

If you want to take the easy way out (no judgement from me at all, really), feel free to use Leela data. Though, the rest of the posts will be focused on training from selfplay games!

## Selfplay Data

There are two main options when it comes to selfplay data. The first is to train from completely zero-knowledge, and the second is to bootstrap from a hand-crafted evaluation.

In my experience, neither of these methods are particularly faster, so you might as well train from zero-knowledge just for the bragging rights :)

On a serious note, bootstrapping from HCE is also doable (and you'll get to skip the first few iterations of training), but it may inadvertently encode some human biases into the network. Although this is almost definitely negligible, I prefer to avoid it altogether.

## Zero-knowledge Training

Zero-knowledge training is exactly what it sounds like. We start with a completely random neural network, and play self-play games, keeping track of who won each game and the positions that were played.

Although this might sound completely bogus, it actually works surprisingly well. The main reason why is that although the selfplay games are basically random, there is still a weak signal that can be extracted - for example, if one side has a lot more material than the other, it is more likely to win.

If you have a lot of compute power, it's actually surprisingly easy to get a decent network this way!

Here's the results from my NNUE's training from zero-knowledge:

| Network | Elo Gain | Positions | Notes | 
|---------|----------|-----------|-------|
| 1       | -        | 0         | Initial random network |
| 2       | +617     | 200K      | First trained network on 20K games |
| 3       | +33      | 200K      | Trained on another 20K games |
| 4       | +1200    | 7.5M      | Trained on another 50K games |
| 5       | +1200    | 82M       | Trained on another 600K games |
| 6       | +258     | 73M       | Trained on another 500K games |

After only 6 iterations, the network has already reached a rating of over 3000 Elo, being superhuman!

Don't start just yet though - there are a few things you need to know before you start training. I'll cover these in the next articles!
