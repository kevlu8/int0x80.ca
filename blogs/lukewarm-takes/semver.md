---
title: It's Okay to Not Use Semver
slug: semver
date: 2025-07-20
description: "Semver is kind of overrated, actually."
---

# It's Okay to Not Use Semver
### 2025-07-20

Semantic versioning, or semver, is the standard for versioning software. Essentially, it works like this:

## Version 1.2.3
- **1** is the major version
- **2** is the minor version
- **3** is the patch version

The major version represents a breaking change, meaning that the new version isn't compatible with the previous version. The minor version represents new features that are backwards compatible, and the patch version represents bug fixes that are also backwards compatible.

In theory, this is a great system! It makes versioning clear and easy to understand.

In practice, however, it is very different.

## Nobody Follows Semver

### Minecraft

Minecraft is by far the most popular game that **exposes its versioning** to the user, even making it a part of the game. People talk about Minecraft versions all the time, and it is a big part of the community.

Unfortunately, Minecraft does not follow semver. The entire game is versioned as major version 1, and the minor and patch versions are used for updates.

If Minecraft used semver, that would mean that I could load a 1.0.0 world in 1.20.5 without any issues, but that is very far from the truth.

### Python

If we examine the jump from Python 2 to Python 3, we can see that it is a breaking change and as such was correctly versioned. However, Python 3.0 and Python 3.12 are not compatible, despite being in the same major version.

### Chrome

The current latest version of Chrome is 139.0.7258.43. I don't think I need to explain why this is not semver.

## Semver can be Useful

While semver isn't followed by most software, it can still be very useful, mostly for libraries and APIs.

This use case is where semver shines, since I can trust that my app that uses a library won't just break after an update.

## Conclusion

Semver is a great idea in theory, but most of the time, you don't have to use it. If you are building a library or an API, it can be very useful to follow semver, but for most applications, it is not necessary.

It can actually be detrimental if you try to follow it too strictly - for example, if you are building a project that is in beta, you might release a major version 0, but then you won't know when to release a major version 1 because it's too daunting!

So, it's okay to not use semver. Do whatever you're comfortable with!
