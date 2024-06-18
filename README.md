# Multi-dir `NODE_PATH` vs single dir `NODE_PATH`

To reproduce run the following commands:

1. Run `yarn` to install dependencies
2. Run `yarn test` to run both tests and produce a comparison table

## Why did we do this test?

When building [sandboxes](<https://en.wikipedia.org/wiki/Sandbox_(software_development)>) for NodeJS tools, we explored strategies to cache and share third-party dependencies across all of our builds. Think of building this system for an organization where multiple engineers work together, and they might have different versions of the dependency tree. When an engineer runs a build, we want them to be able to pull a package from our cache if it exists.

One viable caching strategy could be populating a cache full of individual packages at different versions. There could be a couple of different ways to access these packages from our cache. We attempt to test the following methods of module resolution in this program:

1. We could teach NodeJS the location of the packages in our cache by appending each package to `NODE_PATH` (e.g., `NODE_PATH=/cache/package-a:/cache/package-b...`).
2. Alternatively, we could construct a single `node_modules` directory inside our sandbox that symlinks directories to each package in our cache. This would follow the rules of Node's default module resolution where top-level directories under `node_modules` are the name (or scope) of a package.

We found that approach 2 (a single `node_modules` dir) was much more scalable in terms of performance than 1 (multiple `node_modules` dirs). The difference is very noticeable, and it seems like the larger the package name is, the slower it is to load. Node checks every potential path each package resolution, making it an O(n) operation, whereas the default resolution is constant.

## Test 1 - Multiple directories in `NODE_PATH`, 1 `node_modules` directory per package

This is a test to see how much overhead it will add to node's package resolution if packages were separately stored in a cache and then listed in `NODE_PATH`. Each package has it's own node_modules directory and all directories are added to `NODE_PATH`.

In this case `NODE_PATH` is this (see full path in `output.txt`):

```
NODE_PATH=/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-H93bat/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-E075kt/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-9XFeJN/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-qtQa0O/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-VNYkLR/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-YAGVQF/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-nMF9hr/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-Z8NjZJ/...
```

## Test 2 - Single directory `NODE_PATH`, 1 `node_modules` directory

Closer to the structure of root node_modules, we make a directory called `tmp/node_modules` and all packages to that directory.
In this case `NODE_PATH` is this:

```
NODE_PATH=/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules
```

## Results

Results are pretty obvious, when packages are placed in different directories the resolution takes much longer. And the resolution time is proportional to where to package appears in the giant `NODE_PATH` variable paths list.

| Package      | Time multiple dirs in `NODE_PATH` (ms) | Time single `NODE_PATH` (ms) |
| ------------ | -------------------------------------- | ---------------------------- |
| package-115  | 2                                      | 0                            |
| package-237  | 3                                      | 0                            |
| package-329  | 5                                      | 1                            |
| package-368  | 5                                      | 0                            |
| package-426  | 6                                      | 0                            |
| package-796  | 12                                     | 0                            |
| package-814  | 12                                     | 0                            |
| package-878  | 12                                     | 0                            |
| package-888  | 12                                     | 0                            |
| package-1130 | 16                                     | 0                            |
| package-1147 | 17                                     | 1                            |
| package-1151 | 16                                     | 0                            |
| package-1168 | 16                                     | 0                            |
| package-1340 | 43                                     | 0                            |
| package-1345 | 20                                     | 0                            |
| package-1561 | 24                                     | 0                            |
| package-1697 | 36                                     | 0                            |
| package-1790 | 26                                     | 0                            |
| package-1834 | 27                                     | 1                            |
| package-1839 | 26                                     | 0                            |
| package-2095 | 30                                     | 0                            |
| package-2139 | 33                                     | 0                            |
| package-2410 | 35                                     | 0                            |
| package-2512 | 35                                     | 0                            |
| package-2625 | 36                                     | 0                            |
| package-2819 | 38                                     | 0                            |
| package-2825 | 39                                     | 0                            |
| package-2922 | 42                                     | 1                            |
| package-2986 | 41                                     | 0                            |
| package-3047 | 43                                     | 1                            |
| package-3457 | 49                                     | 0                            |
| package-3626 | 50                                     | 0                            |
| package-3796 | 52                                     | 0                            |
| package-3820 | 53                                     | 0                            |
| package-3878 | 54                                     | 0                            |
| package-4015 | 54                                     | 0                            |
| package-4060 | 56                                     | 0                            |
| package-4210 | 60                                     | 1                            |
| package-4402 | 69                                     | 0                            |
| package-4692 | 80                                     | 0                            |
| package-4989 | 69                                     | 0                            |
| package-5069 | 70                                     | 0                            |
| package-5085 | 85                                     | 0                            |
| package-5099 | 71                                     | 0                            |
| package-5259 | 74                                     | 1                            |
| package-5414 | 74                                     | 0                            |
| package-5461 | 77                                     | 0                            |
| package-5477 | 76                                     | 0                            |
| package-5516 | 79                                     | 0                            |
| package-5518 | 77                                     | 0                            |
| package-5558 | 76                                     | 0                            |
| package-5669 | 77                                     | 0                            |
| package-5675 | 77                                     | 1                            |
| package-5835 | 100                                    | 0                            |
| package-5847 | 109                                    | 0                            |
| package-6050 | 82                                     | 0                            |
| package-6267 | 88                                     | 0                            |
| package-6282 | 89                                     | 0                            |
| package-6293 | 88                                     | 0                            |
| package-6328 | 86                                     | 0                            |
| package-6520 | 90                                     | 1                            |
| package-6669 | 89                                     | 0                            |
| package-6705 | 116                                    | 0                            |
| package-6714 | 95                                     | 0                            |
| package-6731 | 91                                     | 0                            |
| package-6812 | 139                                    | 0                            |
| package-6862 | 92                                     | 0                            |
| package-6976 | 93                                     | 1                            |
| package-7164 | 99                                     | 0                            |
| package-7170 | 105                                    | 0                            |
| package-7188 | 97                                     | 0                            |
| package-7264 | 107                                    | 0                            |
| package-7266 | 102                                    | 0                            |
| package-7341 | 106                                    | 0                            |
| package-7373 | 122                                    | 0                            |
| package-7448 | 106                                    | 0                            |
| package-7450 | 101                                    | 1                            |
| package-7717 | 109                                    | 0                            |
| package-7788 | 109                                    | 0                            |
| package-7941 | 118                                    | 0                            |
| package-8033 | 132                                    | 0                            |
| package-8229 | 139                                    | 0                            |
| package-8287 | 115                                    | 0                            |
| package-8336 | 115                                    | 0                            |
| package-8394 | 125                                    | 0                            |
| package-8478 | 143                                    | 1                            |
| package-8500 | 122                                    | 0                            |
| package-8546 | 116                                    | 0                            |
| package-8853 | 125                                    | 0                            |
| package-8917 | 129                                    | 0                            |
| package-8926 | 125                                    | 0                            |
| package-9225 | 126                                    | 0                            |
| package-9428 | 135                                    | 0                            |
| package-9444 | 155                                    | 0                            |
| package-9545 | 136                                    | 1                            |
| package-9556 | 131                                    | 0                            |
| package-9622 | 136                                    | 0                            |
| package-9706 | 130                                    | 0                            |
| package-9939 | 139                                    | 0                            |
| package-9945 | 162                                    | 0                            |

The resolution time (y-axis ms) of multiple `node_modules` directories as the directories are listed in `NODE_PATH` (x-axis packages in `NODE_PATH` order).

```
162.00 ┼                                                                                                  ╭
154.00 ┤                                                                                            ╭╮    │
146.00 ┤                                                                                    ╭╮      ││    │
138.00 ┤                                                                ╭╮             ╭─╮  ││     ╭╯╰╮╭╮╭╯
130.00 ┤                                                                ││             │ │ ╭╯│ ╭───╯  ╰╯╰╯
122.00 ┤                                                             ╭╮ ││       ╭╮   ╭╯ │ │ ╰─╯
114.00 ┤                                                     ╭╮      ││ ││       ││ ╭─╯  ╰─╯
106.00 ┤                                                    ╭╯│      ││ ││  ╭╮╭──╯╰─╯
98.00  ┤                                                    │ │      │╰╮│╰──╯╰╯
90.00  ┤                                         ╭╮         │ │╭─────╯ ╰╯
82.00  ┤                                      ╭╮ ││  ╭──────╯ ╰╯
74.00  ┤                                     ╭╯╰─╯╰──╯
66.00  ┤                                    ╭╯
58.00  ┤                               ╭────╯
50.00  ┤                             ╭─╯
42.00  ┤            ╭╮ ╭╮      ╭─────╯
34.00  ┤            ││ ││  ╭───╯
26.00  ┤            │╰─╯╰──╯
18.00  ┤    ╭───────╯
10.00  ┤ ╭──╯
2.00   ┼─╯
```
