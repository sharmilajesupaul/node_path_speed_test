# Multi-dir NODE_PATH vs single dir NODE_PATH

To reproduce run the following commands:

1. `yarn`
2. `node index.js`

## Test 1 - Multi NODE_PATH, 1 node_modules directory per package

This is a test to see how much overhead it will add to node's package resolution if packages were all over the place. Each package has it's own node_modules directory and all directories are added to NODE_PATH.

In this case NODE_PATH is this (see full path in output.txt):

```
NODE_PATH=/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-H93bat/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-E075kt/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-9XFeJN/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-qtQa0O/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-VNYkLR/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-YAGVQF/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-nMF9hr/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-Z8NjZJ/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-gElJIP/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-Y6MD8b/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-1K82Jd/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-QEeXLO/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-KSpN3p/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-hrACoL/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-zIIjCs/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-f7vQrJ/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-rYM4Ye/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-NCeO36/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-MwHMSE/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-APhYXP/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-gs2WHS/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-yvgwXx/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-mEdhLS/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-DH03fG/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-goaFXC/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-MDbzXr/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-iuc2z0/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-DvkT0R/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-nZovy3/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-5BoKWw/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-vQpkM2/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-bwNt90/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules-StIejl/node_modules:/Users/sharmilajesupaul/code/node_path_speed_test/tmp/...
```

## Test 2 - Single NODE_PATH, 1 node_modules directory

Closer to the structure of root node_modules, we make a directory called tmp/node_modules and all packages to that directory.
In this case NODE_PATH is this:

```
NODE_PATH=/Users/sharmilajesupaul/code/node_path_speed_test/tmp/node_modules
```

## Results

Results are pretty obvious, when packages are placed in different directories the resolution takes much longer. And the resolution time is proportional to where to package appears in the giant NODE_PATH variable paths list.

| Package      | Time multi NODE_PATH (ms) | Time single NODE_PATH (ms) |
| ------------ | ------------------------- | -------------------------- |
| package-1858 | 61                        | 1                          |
| package-2396 | 66                        | 0                          |
| package-6184 | 169                       | 1                          |
| package-9891 | 288                       | 0                          |
| package-1528 | 36                        | 1                          |
| package-2050 | 48                        | 0                          |
| package-8640 | 202                       | 0                          |
| package-698  | 22                        | 0                          |
| package-5966 | 183                       | 1                          |
| package-7618 | 220                       | 0                          |
| package-8965 | 218                       | 0                          |
| package-2190 | 55                        | 0                          |
| package-7272 | 180                       | 0                          |
| package-4706 | 122                       | 0                          |
| package-7964 | 198                       | 0                          |
| package-5702 | 159                       | 1                          |
| package-8431 | 235                       | 0                          |
| package-9511 | 235                       | 0                          |
| package-4537 | 112                       | 0                          |
| package-5542 | 137                       | 0                          |
| package-6836 | 168                       | 0                          |
| package-5375 | 144                       | 0                          |
| package-5340 | 135                       | 1                          |
| package-5491 | 148                       | 0                          |
| package-5193 | 127                       | 0                          |
| package-9219 | 224                       | 0                          |
| package-4089 | 101                       | 0                          |
| package-942  | 24                        | 0                          |
| package-5805 | 152                       | 0                          |
| package-2255 | 60                        | 1                          |
| package-3012 | 75                        | 0                          |
| package-9895 | 241                       | 0                          |
| package-1158 | 29                        | 0                          |
| package-5523 | 136                       | 0                          |
| package-6778 | 164                       | 0                          |
| package-2458 | 61                        | 0                          |
| package-8748 | 217                       | 1                          |
| package-8920 | 220                       | 0                          |
| package-8457 | 210                       | 0                          |
| package-4221 | 105                       | 0                          |
| package-276  | 7                         | 0                          |
| package-90   | 3                         | 0                          |
| package-1125 | 31                        | 1                          |
| package-2651 | 68                        | 0                          |
| package-6455 | 166                       | 0                          |
| package-6894 | 178                       | 0                          |
| package-4945 | 124                       | 0                          |
| package-4105 | 103                       | 0                          |
| package-1086 | 28                        | 1                          |
| package-7276 | 183                       | 0                          |
| package-6035 | 190                       | 0                          |
| package-1387 | 43                        | 0                          |
| package-2047 | 54                        | 0                          |
| package-6602 | 160                       | 0                          |
| package-482  | 12                        | 1                          |
| package-9100 | 222                       | 0                          |
| package-6812 | 164                       | 0                          |
| package-636  | 17                        | 0                          |
| package-4107 | 102                       | 0                          |
| package-2280 | 56                        | 1                          |
| package-5586 | 135                       | 0                          |
| package-4226 | 105                       | 0                          |
| package-2477 | 61                        | 0                          |
| package-8291 | 203                       | 0                          |
| package-7325 | 179                       | 0                          |
| package-6863 | 168                       | 1                          |
| package-1577 | 41                        | 0                          |
| package-7155 | 175                       | 0                          |
| package-8805 | 216                       | 0                          |
| package-882  | 22                        | 0                          |
| package-4441 | 110                       | 1                          |
| package-4758 | 118                       | 0                          |
| package-6056 | 151                       | 0                          |
| package-9075 | 222                       | 0                          |
| package-6007 | 148                       | 1                          |
| package-1996 | 52                        | 0                          |
| package-1077 | 27                        | 0                          |
| package-667  | 17                        | 0                          |
| package-2151 | 54                        | 0                          |
| package-9149 | 225                       | 1                          |
| package-6002 | 150                       | 0                          |
| package-5757 | 142                       | 0                          |
| package-2156 | 55                        | 0                          |
| package-2828 | 71                        | 1                          |
| package-5320 | 134                       | 0                          |
| package-604  | 15                        | 0                          |
| package-3165 | 77                        | 0                          |
| package-6451 | 160                       | 1                          |
| package-253  | 7                         | 1                          |
| package-4083 | 101                       | 0                          |
| package-1250 | 31                        | 0                          |
| package-8252 | 206                       | 0                          |
| package-4668 | 120                       | 0                          |
| package-1806 | 46                        | 1                          |
| package-1913 | 49                        | 0                          |
| package-556  | 17                        | 0                          |
| package-960  | 29                        | 1                          |
| package-7147 | 202                       | 1                          |
| package-7780 | 221                       | 0                          |
| package-8915 | 225                       | 1                          |
