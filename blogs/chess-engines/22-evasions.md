---
title: "22 - Evasions"
slug: evasions
description: "Making QSearch more useful"
date: 2026-06-24
---

# Evasions
### 2026-06-24

Back when we first implemented quiescence search, we only searched captures and promotions, and if we were in check and no legal capture or promotion move existed, we just returned the evaluation.

This is in fact quite a big flaw, because our static evaluation is inherently unreliable while in check - this is precisely why nearly none of the search heuristics that rely on evaluation are active while in check.

So, we need to somehow allow the engine to escape check, even if it means that we have to search a bit deeper. This is called evasions.


