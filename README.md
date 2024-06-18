# Multi-dir `NODE_PATH` vs single dir `NODE_PATH`

To reproduce run the following commands:

1. Run `yarn` to install dependencies
2. Run `yarn test` to run both tests and produce a comparison table

## Why did we do this test?

When building [sandboxes](https://en.wikipedia.org/wiki/Sandbox_(software_development)) for NodeJS tools, we explored strategies to cache and share third-party dependencies across all of our builds. Think of building this system for an organization where multiple engineers work together, and they might have different versions of the dependency tree. When an engineer runs a build, we want them to be able to pull a package from our cache if it exists.

One viable caching strategy could be populating a cache full of individual packages at different versions. There could be a couple of different ways to access these packages from our cache. We attempt to test the following methods of module resolution in this program:

1. We could teach NodeJS the location of the packages in our cache by appending each package to `NODE_PATH` (e.g., `NODE_PATH=/cache/package-a:/cache/package-b...`).
2. Alternatively, we could construct a single `node_modules` directory inside our sandbox that symlinks directories to each package in our cache. This would follow the rules of Node's default module resolution where top-level directories under `node_modules` are the name (or scope) of a package.

We found that approach 2 (not overloading `NODE_PATH`) was much more scalable in terms of performance than 1 (listing individual dirs in `NODE_PATH`). The difference is very noticeable, and it seems like the further the package is listed in `NODE_PATH`, the slower it is to load. Node checks the list for each resolution, making it an O(n) operation, whereas the default resolution is constant.

## Test 1 - Multiple directories in `NODE_PATH`, 1 `node_modules` directory per package

This is a test to see how much overhead it will add to node's package resolution if packages were separately stored in a cache and then listed in `NODE_PATH`. Each package has it's own node_modules directory and all directories are added to `NODE_PATH`.

In this case `NODE_PATH` is this (see full path in `output.txt`):

```
NODE_PATH=/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-H93bat/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-E075kt/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-9XFeJN/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-qtQa0O/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-VNYkLR/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-YAGVQF/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-nMF9hr/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-Z8NjZJ/...
```

## Test 2 - Single `NODE_PATH`, 1 `node_modules` directory

Closer to the structure of root node_modules, we make a directory called `tmp/node_modules` and all packages to that directory.
In this case `NODE_PATH` is this:

```
NODE_PATH=/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules
```

## Results

Results are pretty obvious, when packages are placed in different directories the resolution takes much longer. And the resolution time is proportional to where to package appears in the giant `NODE_PATH` variable paths list.

| Package|Time multiple dirs in `NODE_PATH` (ms)|Time single `NODE_PATH` (ms) |
| ---|---|--- |
| package-161 | 3 | 0 |
| package-182 | 3 | 0 |
| package-185 | 4 | 0 |
| package-263 | 4 | 0 |
| package-379 | 5 | 0 |
| package-389 | 5 | 1 |
| package-503 | 6 | 0 |
| package-554 | 7 | 0 |
| package-627 | 10 | 0 |
| package-683 | 9 | 0 |
| package-697 | 10 | 0 |
| package-708 | 9 | 0 |
| package-788 | 11 | 0 |
| package-810 | 11 | 1 |
| package-845 | 11 | 0 |
| package-887 | 12 | 0 |
| package-958 | 12 | 0 |
| package-1042 | 15 | 0 |
| package-1122 | 16 | 0 |
| package-1163 | 17 | 0 |
| package-1228 | 18 | 0 |
| package-1321 | 19 | 1 |
| package-1405 | 19 | 0 |
| package-1529 | 21 | 0 |
| package-1551 | 22 | 0 |
| package-1692 | 22 | 0 |
| package-1804 | 25 | 0 |
| package-2126 | 36 | 0 |
| package-2372 | 34 | 0 |
| package-2394 | 34 | 1 |
| package-2412 | 33 | 0 |
| package-2417 | 31 | 0 |
| package-2585 | 38 | 0 |
| package-2610 | 35 | 0 |
| package-2691 | 36 | 0 |
| package-2803 | 40 | 0 |
| package-2856 | 40 | 0 |
| package-3135 | 41 | 1 |
| package-3239 | 44 | 0 |
| package-3561 | 47 | 0 |
| package-3662 | 55 | 0 |
| package-3671 | 47 | 0 |
| package-3750 | 49 | 0 |
| package-3826 | 49 | 0 |
| package-4085 | 94 | 0 |
| package-4126 | 58 | 0 |
| package-4298 | 63 | 1 |
| package-4442 | 60 | 0 |
| package-4446 | 59 | 0 |
| package-4527 | 58 | 0 |
| package-4627 | 61 | 0 |
| package-4644 | 60 | 0 |
| package-4740 | 63 | 0 |
| package-4821 | 71 | 0 |
| package-5331 | 71 | 0 |
| package-5537 | 101 | 1 |
| package-5587 | 74 | 0 |
| package-5750 | 78 | 0 |
| package-5850 | 82 | 0 |
| package-6012 | 105 | 0 |
| package-6018 | 79 | 0 |
| package-6062 | 84 | 0 |
| package-6259 | 84 | 0 |
| package-6295 | 83 | 0 |
| package-6584 | 88 | 1 |
| package-6835 | 91 | 0 |
| package-6902 | 96 | 0 |
| package-6940 | 93 | 0 |
| package-6954 | 94 | 0 |
| package-6989 | 92 | 0 |
| package-7026 | 92 | 0 |
| package-7080 | 99 | 0 |
| package-7123 | 94 | 0 |
| package-7251 | 102 | 0 |
| package-7254 | 111 | 1 |
| package-7407 | 97 | 0 |
| package-7664 | 104 | 0 |
| package-7783 | 106 | 0 |
| package-7814 | 103 | 0 |
| package-7971 | 105 | 0 |
| package-8038 | 110 | 0 |
| package-8226 | 108 | 0 |
| package-8298 | 111 | 1 |
| package-8357 | 112 | 0 |
| package-8573 | 117 | 0 |
| package-8854 | 115 | 0 |
| package-8953 | 120 | 0 |
| package-8961 | 129 | 0 |
| package-9019 | 121 | 0 |
| package-9091 | 118 | 0 |
| package-9122 | 118 | 0 |
| package-9267 | 148 | 1 |
| package-9511 | 146 | 0 |
| package-9567 | 129 | 0 |
| package-9713 | 147 | 0 |
| package-9736 | 126 | 0 |
| package-9737 | 142 | 0 |
| package-9873 | 131 | 0 |
| package-9885 | 163 | 0 |

The resolution time (y-axis ms) of multiple `node_modules` directories as the directories are listed in `NODE_PATH` (x-axis packages in `NODE_PATH` order).

```
163.00 ┼                                                                                                 ╭
155.00 ┤                                                                                          ╭╮     │
147.00 ┤                                                                                          │╰╮╭╮╭╮│
139.00 ┤                                                                                          │ ││││││
131.00 ┤                                                                                      ╭╮  │ ╰╯╰╯╰╯
123.00 ┤                                                                                   ╭╮╭╯╰──╯
115.00 ┤                                                                         ╭╮    ╭───╯╰╯
107.00 ┤                                                      ╭╮  ╭╮            ╭╯│╭───╯
99.00  ┤                                           ╭╮         ││  ││     ╭──────╯ ╰╯
91.00  ┤                                           ││         ││  ││╭─╮╭─╯
83.00  ┤                                           ││         ││╭─╯╰╯ ╰╯
75.00  ┤                                           ││       ╭─╯╰╯
67.00  ┤                                           ││╭─╮ ╭──╯
59.00  ┤                                       ╭╮  │╰╯ ╰─╯
51.00  ┤                                     ╭─╯╰──╯
43.00  ┤                          ╭╮   ╭╮╭───╯
35.00  ┤                          │╰───╯╰╯
27.00  ┤                      ╭───╯
19.00  ┤              ╭───────╯
11.00  ┤ ╭────────────╯
3.00   ┼─╯
```
