---
number: 4
title: Hallway shortcuts
difficulty: Medium
topics: [Graphs, BFS]
time: 1 s
memory: 256 MB
due: 2026-10-23T15:10
---

:::note{from="Ms. Patel" initials="SP"}
Reuse your adjacency list from 3.1. Watch out for rooms nobody can reach.
:::

Colonel By has `n` rooms, numbered 1 to `n`, joined by `m` two-way hallways.
Starting from room 1, the front office, find the fewest hallways you need to
walk to reach each room.

If a room can't be reached at all, print `-1` for it.

## Input

The first line has `n` and `m`. Each of the next `m` lines has two rooms `a`
and `b` joined by a hallway.

## Output

One line with `n` integers: the distance to rooms 1 through `n`, in order.

:::sample

```input
5 5
1 2
1 3
2 4
3 4
4 5
```

```output
0 1 1 2 3
```

:::

:::sample

```input
4 3
1 2
2 3
3 4
```

```output
0 1 2 3
```

:::

## Limits

- `1 ≤ n ≤ 200 000`
- `0 ≤ m ≤ 200 000`
- `1 ≤ a, b ≤ n` A hallway can lead from a room back to itself.

:::hint
Treat each room as a node and each hallway as an edge. Every hallway counts
the same, so you're after shortest paths in an unweighted graph.
:::

:::hint
Run a breadth-first search from room 1. A queue visits rooms in order of
distance, so the first time you reach a room, you've found its answer.
:::

:::hint
Start every distance at `-1`. When you take a room off the queue, give each
neighbour still at `-1` that room's distance plus one, then queue it. Any room
left at `-1` was never reached.
:::
