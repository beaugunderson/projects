Enable `lolcommits` for every repository:

```sh
$ gem install lolcommits
$ p each "lolcommits --enable"
afterlife
installed lolcommmit hook as:
  -> /Users/beau/p/afterlife/.git/hooks/post-commit
(to remove later, you can use: lolcommits --disable)

alfred-yammer
installed lolcommmit hook as:
  -> /Users/beau/p/alfred-yammer/.git/hooks/post-commit
(to remove later, you can use: lolcommits --disable)

badger
installed lolcommmit hook as:
  -> /Users/beau/p/badger/.git/hooks/post-commit
(to remove later, you can use: lolcommits --disable)

<snip>
```

Run `git gc` in every project directory:

```sh
$ p each "git gc"
afterlife
Counting objects: 113, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (60/60), done.
Writing objects: 100% (113/113), done.
Total 113 (delta 50), reused 113 (delta 50)

alfred-yammer
Counting objects: 7, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (7/7), done.
Writing objects: 100% (7/7), done.
Total 7 (delta 0), reused 7 (delta 0)

badger
Counting objects: 38, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (19/19), done.
Writing objects: 100% (38/38), done.
Total 38 (delta 18), reused 38 (delta 18)

<snip>
```

Show which functions from [caolan/async](https://github.com/caolan/async) are
used most often:

```sh
$ p glob --expand --files -0 "**/*.js" | \
    xargs -0 egrep -ho "async\.\w+" | \
    sort | uniq -c | sort -n

   2 async.map
   2 async.mapSeries
   2 async.memoize
   2 async.whilst
   3 async.each
   3 async.eachSeries
   3 async.until
   3 async.waterfall
   6 async.parallel
  14 async.series
  18 async.forEachLimit
  36 async.queue
  92 async.forEach
 100 async.forEachSeries
```

How many files are in each project?

```sh
$ p each "find . -type | ignore-pipe | wc -l"
afterlife:                             26
alfred-yammer:                          5
bookbag-me:                            39
BeauGunderson.Extensions:              31
badger:                                 6
ChangeBindingOrder:                    10
ChrisTracker:                          51
<snip>
```
How many files are there total?

```sh
$ p glob --files "**" | wc -l
   10476
```
