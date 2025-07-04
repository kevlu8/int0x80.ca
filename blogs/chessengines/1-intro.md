# Chess Engine Development
### 2025-07-03

Hey everyone! If you're on this blog, chances are you either want to create a chess engine, or you just want to learn more about them. Either way, buckle in, because this is going to be a long ride.

All code in this "series" will be in C++-style-pseudocode, so that there aren't any language barriers. But, if you want to see the code the way it's actually implemented, you can find it on the [GitHub repository](https://github.com/kevlu8/PZChessBot).

I probably will not be explaining how to implement move generation and the basic bitboard stuff, since this is extremely well documented elsewhere. If you do want to learn about it, check out the [chess programming wiki](https://www.chessprogramming.org/). Instead, I'll be focusing more on search. I might also cover evaluation, but I'm not too sure right now.

I will start out with the very basics of search, eventually explaining more advanced techniques. So, even if you're a beginner, you should be able to follow along! Additionally, I will be providing real-world tested results and benchmarks at each stage, so you can see exactly how much performance you gain from each technique. However, keep in mind that these benchmarks are performed with an extremely good evaluation function, so your results may vary.

## For those who wish to create a chess engine

The most important thing, and I cannot stress this enough, is to **test your code**. Chess engines are extremely complex, and it is very easy to make a mistake that will cause your engine to crash or behave unexpectedly. And "testing your code" does not mean "give it a few puzzles and see if it solves them". To properly test your changes, you need to run a SPRT (Sequential Probability Ratio Test) against the previous version of your engine. This runs a series of games against the previous version, and determines whether your changes are an improvement or not. If you don't do this, you will never know if your changes actually improve your engine or not.

Some good SPRT tools include [fastchess](https://github.com/Disservin/fastchess) and [cutechess](https://github.com/cutechess/cutechess). If you have any questions at all, feel free to ask in the [Stockfish Discord server](https://discord.gg/XUyHyT5ap9).

## A couple of notes

- Do not trust the standard library of the language you are using to be fast. Most of the time, it is not.
- If using C++, do not use `std::vector` or `std::unordered_map` for anything performance-critical. Use your own data structures (allocated on the heap) instead.
	- `std::vector`'s automatic resizing is very slow, and appending N elements is not $O(N)$ but instead $O(N \log N)$.
	- Don't even get me started on `std::unordered_map`. If you have ever used it on CodeForces, you know the pain of getting hacked post-contest. I actually did a benchmark on it: `std::unordered_map` took 3.31 seconds, while my asm-optimized hash map took 1.05 seconds.
- If you are using a compiled language, make sure to compile with optimizations **and intrinsics**. For C++, this means using `-O3` and `-mavx2 -mbmi2` etc. I'd warn against using `-march=native`, especially if you have cutting edge hardware (i.e. supporting AVX-512), since this will cause your code to not run on older hardware that most people have.
