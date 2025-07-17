---
title: Competitive Programming Doesn't Make You a Better Developer
slug: compprogram
description: "Exploring the flaws of the technical interview"
date: 2025-07-16
---

# Competitive Programming Doesn't Make You a Better Developer
### 2025-07-16

Competitive programming is very often used as a benchmark for how qualified a developer is. Many job interviews require candidates to solve algorithmic problems and explain their thought process, and universities often use results on informatics contests to determine whether or not to admit a CS student.

While there is some merit to this, competitive programming skill is ultimately a bad indicator of how well a developer will do in real-world large-scale software development, mainly because algorithmic concepts in competitive programming are very rarely used in real-world applications, and since competitive programming often encourages bad practices that would never otherwise be used in production code.

## Real-World Applications

Many competitive programming techniques beyond the basics (e.g. binary search, greedy algorithms, etc.) are rarely used in actual software development. How often do you think you'll need to implement a 2D sparse segment tree in your day-to-day work? Or do $O(\log n)$ LCA queries? Or even do a BFS? The answer is almost never.

In the vast majority of software development, there is no need to implement complex algorithms for the best asymptotic complexity. There are almost no problems that require you to speed a search from $O(N^2)$ to $O(N \log N)$ from scratch, because most of these problems already have solutions that are implemented in libraries.

I've personally created several projects, such as an online judge, a chess engine, a cryptocurrency miner, and a "compiler" for my own language. The only time I considered using an algorithm from competitive programming was in my "compiler", where I needed to perform several queries on the source code for anti-patterns. Even then, I ended up using brute force, since the $O(|S| \cdot |T|)$ complexity was acceptable for my use case - I didn't want to or need to spend time implementing the Aho-Corasick algorithm, which would have been the competitive programming solution to this problem.

While some may argue that some jobs do actually require complex algorithms, these jobs are ultimately the minority. Unless you are working in something hyper-specific, chances are you will not need to implement algorithms or data structures from scratch in your work. Libraries usually already exist for these tasks, and even if they don't, the naive algorithm is often good enough for the task at hand.

## Bad Practices

In competitive programming, it is usually required that all code is written in a single file, with no external libraries other than the standard library, whereas in production code, you will almost always use external libraries to avoid reinventing the wheel as well as separating your code into multiple files. Single files are very difficult to read and maintain, while also being slower to compile. In competitive programming, this is not a problem, since you only need to write the code once and then never look at it again. However, in production code, you will often need to come back to your code weeks or months later, and having it in a single file makes it much harder to sift through.

Additionally, competitive programming encourages writing barely readable code, doing things like using single-letter variable names, not splitting code into functions, and using macros to shorten the code. While this does save time in a competition where every second matters, it severely harms the readability of the code, meaning that if you come back to it the next day, chances are you will have no idea what it does. Production code should be readable and maintainable, and learning to write such code is not as easy as it seems - especially if you are used to writing competitive programming code.

It may seem like being a good competitive programmer should be correlated with being a good developer, but in reality, these two skills are very different. I've seen competitive programmers much better than me struggle to understand why we need to split code into multiple files, and not even be able to use `git` properly. On the other hand, some of the best developers I know are not competitive programmers at all, and have never even participated in a single contest.

## Conclusion

Competitive programming can be a fun hobby and a cool skill to have, teaching problem-solving and debugging, but the misconception that being a good competitive programmer equates to being a good developer is fundamentally flawed. It is unfortunate that many companies and universities still use competitive programming as a benchmark for "intelligence", when they should instead focus on real-world skills that are actually useful in software development.

That is not to say that competitive programming skill is useless as a basic filter - obviously, someone who can't solve problems like "two-sum" or "reverse a string" won't be a good developer. However, if we keep raising the bar, we will quickly end up with diminishing (and eventually negative) returns.
