# GCC Optimization Pragmas Lie to You
### 2024-09-22

GCC has many optimization pragmas that can be prepended to files. Generally, they *should* speed up your code the same amount as the equivalent command-line argument, however this is not always the case.

Theoretically, you would expect

```cpp
#pragma GCC optimize("O3")
```

to optimize your code the same way as

```sh
g++ main.cpp -O3
```

But it doesn't! Let's take a look at an example program:

```cpp
#pragma GCC optimize("O3")
#include <bits/stdc++.h>
using namespace std;

#define SZ 10000005

int arr[SZ] = {};

int main() {
    iota(arr, arr+SZ, 1);
    int tgt = 19999473;
    unordered_set<int> s(arr, arr+SZ);
    for (int i = 0; i < SZ; i++) {
        if (s.count(tgt-arr[i])) {
            cout << arr[i] << ' ' << tgt-arr[i] << '\n';
            break;
        }
    }
}
```

This is a pretty simple and well-known solution to a problem. It solves the Two-Sum problem using a hashset.

Here's a chart showing the runtime of the program with and without the pragma:

|      Optimization    | Time (s) |
|----------------------|----------|
| None, without pragma | ~1.79    |
| None, with pragma    | ~0.98    |
| -O3, without pragma  | ~0.36    |
| -O3, with pragma     | ~0.36    |

As you can see, the pragma does much worse than the `-O3` flag, even though they should be equivalent. Why is this?

Looking into the [assembly code generated](https://godbolt.org/z/cE5j3n4a1), we can see that the pragma causes the assembly to be much larger than the `-O3` flag. This is because the pragma causes the compiler to attempt to optimize many standard library functions.