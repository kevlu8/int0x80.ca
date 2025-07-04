# Recursion
### 2025-07-03

This, unfortunately, is not a first-year computer science course, so I will be assuming you know what recursion is.

If you think about it, a chess game is basically a directed tree (well, more accurately, it's a directed graph because there are multiple ways to reach the same position, but we'll say it's a tree for simplicity's sake). Each node is a position, and each edge is a move. Naturally, in tree-like data structures, we have several ways to traverse the tree.

## DFS

Depth-first search is a recursive algorithm that traverses the tree by going as deep as possible before backtracking. This is the most common way to traverse a tree, and it is also the most intuitive.

This is my personal favorite way as a competitive programmer! It's short and sweet, and it works for most problems.

## BFS

Breadth-first search focuses more on visiting all the nodes at the current depth before going deeper.

However, BFS is not very useful for chess engines, mainly due to its high memory usage. Since it requires a queue to store all the nodes, it can become very quickly impractical. There have been some BFS-based chess engines back in the early days of engine development, but this kind of technique is almost never seen in modern engines.

## Pitfall

But, a game of chess is not *just* a tree. And, if we were to simply use a traversal algorithm, we quickly run into a problem: there are *way too many* chess positions to search all of them. If we only stop when the game ends, we would have to search through an insane amount of positions.

Chess engines use evaluation functions to solve this problem. Instead of searching all the way to the end, we search to a certain depth, then *evaluate* the position, or make an educated guess about which side is more likely to win.

As previously mentioned, I won't go too deep into evaluation functions. But, they are a crucial part of chess engines. The more accurate the evaluation function, the better the engine will perform. For now, I'll assume you have an evaluation function that is good enough.

You might ask, "Well, if we have this evaluation function, why not just use it to evaluate the position at the root node and be done with it?" Unfortunately, evaluation functions are still estimates at best. There are positions where we might be up 5 queens, but our opponent has a checkmate. In these kinds of positions, our evaluation function would say that we are crushing, but in reality, we are losing. **The more deep we search, the more accurate our evaluation will be, because we make less guesses.**

## Negamax

Let's recap real quick. We have a tree-like structure, and we want to search it efficiently, making educated guesses about which side is more likely to win. Using these guesses, we reach a final verdict of which move is best.

This is where negamax comes in. Negamax is very similar to DFS, but it has a few key differences. The main difference is that negamax assigns values to nodes based on the perspective of the current player. It then uses the values of the child nodes to determine the value of the parent node.

For example, let's say I am playing as white, and I have three possible moves. Move A has a value of 3, move B has a value of 5, and move C has a value of 2. I want to choose the move that maximizes my score, so I would choose move B and get a score of 5.

That sounds simple enough, but how do I know the values of the moves in the first place?

This is where recursion comes in. We search down the tree, making optimal choices for the side to move, and when we reach our maximum depth, we use the evaluation function to get an estimate of the position. We then return this value to the parent node, which will use it to determine its own value.

Negamax is actually a modification upon the minimax algorithm, which is a well-known algorithm in game theory. But, while minimax has a min-player (who wants to minimize the score) and a max-player (who wants to maximize the score), negamax only has one player who wants to maximize their score. We simply negate the scores of the child nodes to get the scores for the parent node, because if one side is winning, the other side is losing.

```cpp
Value negamax(Board& pos, int depth, int side = 1) {
	if (depth == 0) {
		// Once we reach the maximum depth, we evaluate
		return eval(pos) * side;
	}

	Value best = -INF; // Start with the worst possible value
	for (Move m : pos.legal_moves()) {
		pos.make_move(m); // Make the move on the board
		Value score = -negamax(pos, depth - 1, -side); // Negate the score for our perspective
		pos.undo_move(m); // Undo the move to restore the board

		if (score >= MATING) score--;
		if (score <= -MATING) score++; // This is very important!
		// If we find a checkmate, we want the engine to prefer faster mates.
		// By subtracting 1 from a winning score, we ensure that the engine prefers mates in fewer moves (or tries to survive as long as possible).
		// The MATING constant is usually set to MATE - MAX_DEPTH, where MATE is a large constant like 30000.

		if (score > best) {
			best = score; // Update the best score if we found a better one
		}
	}
	return best; // Return the best score found
}
```

It's that easy!

## Iterative Deepening

Our current negamax implementation is very simple, but it has a major flaw: it only searches to a fixed depth. This means that in some positions, it would search a huge number of nodes, while in others, it would search very few. This is not ideal, because we want to be able to search as many nodes as possible in the time we have.

To fix this, we can use a technique called iterative deepening. Iterative deepening is a technique where we start at depth 1 and gradually expand our search depth until we run out of time. This way, we adaptively search deeper in positions that require it, while still being able to search shallower in positions that don't.

Instinctively, this seems a bit inefficient - aren't we searching the same position multiple times? That would be correct, but there are ways to reuse search results from previous iterations, which will be covered in a later post.

```cpp
std::pair<Move, Value> search(Board &board, int64_t time) {
	Move cur_move = NullMove;
	Value cur_eval = -VALUE_INFINITE;

	start_time = clock();
	max_time = time;
	stop_search = false;

	for (int depth = 1; depth <= MAX_PLY; depth++) {
		nodes = 0;
		
		auto res = negamax(board, depth, board.side == WHITE ? 1 : -1);
		Move best_move = res.first;
		Value best = res.second;

		int time_elapsed = (clock() - start_time) / CLOCKS_PER_MS; // Custom macro to get time in milliseconds
		if (time_elapsed >= time) {
			break;
		}
		
		cur_move = best_move;
		cur_eval = best;
	}

	return { cur_move, cur_eval };
}
```

With a little bit more logic for checkmates and time management, our search, albeit terrible, is able to play moves!

```
Results of stash-8 vs pz-negamax (8+0.08, 1t, 16MB, 8moves_v3.pgn):
Elo: 214.85 +/- 56.60, nElo: 335.19 +/- 68.10
LOS: 100.00 %, DrawRatio: 22.00 %, PairsRatio: 38.00
Games: 100, Wins: 61, Losses: 6, Draws: 33, Points: 77.5 (77.50 %)
Ptnml(0-2): [0, 1, 11, 20, 18], WL/DD Ratio: 0.83
```

Tested against an engine with ~1090 ELO, we see that we are around 200 ELO weaker. So, we're approximately at 900 ELO!

However, pure negamax is not very efficient. How can we improve it?
