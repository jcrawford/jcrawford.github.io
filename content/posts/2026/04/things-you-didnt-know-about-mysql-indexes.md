---
slug: things-you-didnt-know-about-mysql-indexes
title: "MySQL Indexes: The Stuff Nobody Explains Until Your Query Is 30 Seconds Slow"
excerpt: "You added an index. It's still slow. Here's what actually matters when MySQL decides whether to use your index—and the gotchas that catch everyone at least once."
featuredImage: /images/content/mysql-indexes-featured.png
tags:
  - mysql
  - database
  - performance
  - backend
author: joseph-crawford
publishedAt: "2026-04-15"
draft: false
---

I've been there. You've got a query that's suddenly taking 30 seconds instead of 30 milliseconds. You add an index. It's still slow. You add another index. Now writes are crawling too.

Here's the thing: indexes aren't magic. They're data structures with specific rules, and MySQL will happily ignore yours if you've broken even one of those rules. Most of the time, the problem isn't that you need *more* indexes—it's that you need to understand how MySQL actually uses them.

Let me walk through what I wish someone had explained to me five years ago.

## What Your Index Actually Does (And Doesn't Do)

Picture an `orders` table:

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  order_date DATE NOT NULL,
  total_cents INT NOT NULL,
  shipping_region VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Without an index, finding all orders for `customer_id = 42` means MySQL reads every single row. On a table with 10 million orders? That's a **full table scan**, and yeah, it's as slow as it sounds.

Add an index on `customer_id`:

```sql
CREATE INDEX idx_customer ON orders (customer_id);
```

Now MySQL has a sorted B-tree it can binary-search. Instead of reading 10 million rows, it jumps directly to the matching ones.

This is Indexing 101. Here's where things get interesting.

## The Leftmost Prefix Rule (Or: Why Your Composite Index Is Useless)

You notice you often query by both `customer_id` and `status`. So you create a composite index:

```sql
CREATE INDEX idx_customer_status ON orders (customer_id, status);
```

This index helps with:
```sql
SELECT * FROM orders WHERE customer_id = 42;
SELECT * FROM orders WHERE customer_id = 42 AND status = 'shipped';
```

But it does **nothing** for:
```sql
SELECT * FROM orders WHERE status = 'shipped';
```

Why? Because MySQL built the index sorted by `customer_id` first, then `status` within each customer. It's like a phone book sorted by last name, then first name. You can find all the "Smiths" quickly. You can find "Smith, John" quickly. But you can't quickly find all the "Johns" across every last name—they're scattered throughout the book.

**The rule:** A composite index on `(col1, col2, col3)` can only be used for queries that include `col1`. If your query skips the leftmost column, the index is useless.

I've seen teams add three separate single-column indexes when one well-ordered composite index would have been faster and smaller. Before you create an index, ask: what queries will actually use this, and in what order?

## Functions Kill Indexes (Even Implicit Ones)

Here's a query that feels totally reasonable:

```sql
SELECT * FROM orders WHERE YEAR(order_date) = 2026;
```

You've got an index on `order_date`. This should be fast, right?

It's not. MySQL can't use the index because you wrapped the column in a function. The index stores raw `order_date` values, not `YEAR(order_date)` results. Same thing happens with `LOWER()`, `DATE()`, `CAST()`, or any function that transforms the column.

Even sneakier: implicit type conversions. If `customer_id` is an INT but you query with a string:

```sql
SELECT * FROM orders WHERE customer_id = '42';
```

MySQL may silently convert the column to a string for comparison, bypassing the index. Not always, but often enough that you should be paranoid about type mismatches.

### The Fix: Functional Key Parts (MySQL 8.0+)

MySQL 8.0 introduced functional key parts—indexes on expressions instead of raw columns:

```sql
CREATE INDEX idx_order_year ON orders ((YEAR(order_date)));
```

Notice the **double parentheses**. The outer pair is for the index definition; the inner pair marks this as an expression. MySQL requires this syntax, and it will error without it.

You can index any deterministic expression:

```sql
CREATE INDEX idx_lower_email ON users ((LOWER(email)));
CREATE INDEX idx_order_month ON orders ((DATE_FORMAT(order_date, '%Y-%m')));
```

**But:** before you reach for functional indexes, ask if you should store the data differently. If you're constantly querying by year, maybe add a `order_year` column and index that. Functional indexes are clever, but they're also hidden complexity.

## EXPLAIN Is Your Best Friend (Use EXPLAIN ANALYZE for Real Numbers)

Stop guessing. Ask MySQL what it's actually doing:

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
```

You'll get output like:

```
+----+-------------+--------+------------+------+---------------+---------------+---------+-------+------+----------+-------+
| id | select_type | table  | partitions | type | possible_keys | key           | key_len | ref   | rows | filtered | Extra |
+----+-------------+--------+------------+------+---------------+---------------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | orders | NULL       | ref  | idx_customer  | idx_customer  | 4       | const |    1 |   100.00 | NULL  |
+----+-------------+--------+------------+------+---------------+---------------+---------+-------+------+----------+-------+
```

The `type` column tells you what you need to know:
- `const` or `ref` → good, using an index
- `range` → okay, using an index for a range scan
- `ALL` → bad, full table scan
- `index_merge` → MySQL is merging multiple indexes (sometimes good, sometimes a sign you need a better composite index)

For actual timings (not just planner estimates), use:

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
```

This runs the query and shows real execution time. I've learned more from five minutes with `EXPLAIN ANALYZE` than from hours of reading optimization guides.

## Covering Indexes: The "Using Index" You Want to See

When MySQL uses an index to find rows, it usually has to make a second trip to the actual table data to fetch the other columns you selected. Two lookups per row.

But if your index already contains every column the query needs, MySQL can answer from the index alone. In `EXPLAIN` output, you'll see `Using index` in the `Extra` column. This is a **covering index**, and it's one of the biggest free performance wins available.

Example:

```sql
SELECT customer_id, status FROM orders WHERE customer_id = 42;
```

With this index:

```sql
CREATE INDEX idx_customer_status ON orders (customer_id, status);
```

MySQL can satisfy the entire query from the index. No table lookups needed.

**Important:** MySQL doesn't support PostgreSQL's `INCLUDE` syntax. You can't write:

```sql
-- This is PostgreSQL, NOT MySQL
CREATE INDEX idx_covering ON orders (customer_id) INCLUDE (status);
```

In MySQL, every column you want covered must be part of the index key itself. That means they participate in sorting and the leftmost prefix rule still applies.

**InnoDB bonus:** In InnoDB, every secondary index automatically includes the primary key. So if your query needs the indexed columns plus the primary key, you get covering behavior without extra work.

## Partial Indexes Don't Exist in MySQL (Here's the Workaround)

PostgreSQL lets you create indexes that only cover certain rows:

```sql
-- PostgreSQL ONLY
CREATE INDEX idx_pending ON orders (customer_id) WHERE status = 'pending';
```

This is amazing for sparse queries—like finding the 2% of orders that are pending. The index is tiny and fast.

MySQL doesn't support this. At all. Your options:

1. **Composite index:** `CREATE INDEX idx_status_customer ON orders (status, customer_id);` — works, but includes all rows
2. **Generated column + index:**
   ```sql
   ALTER TABLE orders ADD COLUMN pending_customer_id INT 
     GENERATED ALWAYS AS (CASE WHEN status = 'pending' THEN customer_id ELSE NULL END) VIRTUAL;
   CREATE INDEX idx_pending_customer ON orders (pending_customer_id);
   ```
3. **Accept the trade-off** and use a regular index if the write overhead is tolerable

I've used option 2 for high-volume tables where we only queried a small subset. It's more complex, but the performance gain was worth it.

## InnoDB's Clustered Index: Why Your Primary Key Choice Matters

In InnoDB, the primary key isn't just an index—it's how the data is physically stored. The primary key B-tree **contains the actual row data**. This is called a **clustered index**.

Secondary indexes contain the indexed columns plus the primary key value. When you query via a secondary index, MySQL finds the primary key in the secondary index, then looks up the full row in the clustered index.

**Why this matters:**

1. **Primary key length affects every secondary index.** If your primary key is a 36-character UUID string, every secondary index carries that 36-byte overhead. An auto-increment INT is 4 bytes. That difference multiplies across every index on the table.

2. **Insertion order affects fragmentation.** Rows are stored in primary key order. Inserting in order (auto-increment IDs) minimizes page splits. Inserting random UUIDs causes constant page reorganization.

3. **Covering queries are more common.** Since secondary indexes include the primary key, queries that need indexed columns + primary key can be satisfied from the secondary index alone.

If you're using UUIDs as primary keys on high-write tables, consider:
- Using `UUID_TO_BIN(uuid, 1)` for time-ordered storage (MySQL 8.0+)
- Using an auto-increment ID as the primary key and putting the UUID in a separate unique index
- Switching to ULIDs or KSUIDs that sort chronologically

## Invisible Indexes: Test Before You Drop

MySQL 8.0 introduced invisible indexes—indexes that exist but the optimizer ignores them unless you explicitly enable them:

```sql
ALTER TABLE orders ALTER INDEX idx_customer INVISIBLE;
```

The index is still there. It's still maintained on writes. But queries won't use it.

**Use case:** You think an index is useless. Instead of dropping it, make it invisible. Monitor performance for a week. If nothing breaks, drop it. If performance tanks, make it visible again instantly.

I've used this to safely clean up legacy indexes on tables where we couldn't afford downtime for experimentation.

## Index Merge: When MySQL Uses Multiple Indexes at Once

If you have separate indexes on `status` and `shipping_region`, MySQL can sometimes merge them for queries like:

```sql
SELECT * FROM orders WHERE status = 'pending' OR shipping_region = 'CA';
```

Instead of choosing one index or doing a full scan, MySQL scans both and merges the results. In `EXPLAIN`, you'll see `type: index_merge` with `Using union(...)` or `Using intersect(...)` in the `Extra` column.

**When it helps:**
- You have multiple single-column indexes
- Query uses `OR` between indexed columns
- No composite index covers the query

**When it doesn't:**
- Deep `AND`/`OR` nesting confuses the optimizer
- A well-designed composite index is usually faster
- Not available for full-text indexes

Index Merge is clever, but it's often a sign you should reconsider your index strategy.

## The Practical Checklist

Before creating an index:

1. **Write the actual query first.** Optimize for the queries you run, not the ones you might run.
2. **Run `EXPLAIN` on production-like data.** Planner estimates can be wildly wrong.
3. **Check the leftmost prefix.** Will your query patterns match the index column order?
4. **Watch for functions on indexed columns.** Use functional key parts if necessary (MySQL 8.0+).
5. **Keep primary keys short.** Every secondary index pays that tax.
6. **Consider write impact.** Each index slows down `INSERT`, `UPDATE`, and `DELETE`.
7. **Test with `EXPLAIN ANALYZE`.** Real timings beat guesses.
8. **Make indexes invisible before dropping.** Give yourself an escape hatch.

## The Takeaway

Indexes are tools, not magic spells. MySQL has specific rules—leftmost prefix, no partial indexes, no `INCLUDE`, functional key part syntax—and it will cheerfully ignore your index if you break them.

The common thread: **measure, don't assume**. `EXPLAIN` and `EXPLAIN ANALYZE` are your best friends. Run them on your actual queries with realistic data, and let MySQL tell you what's actually happening.

Your queries will be faster for it.

---

**Sources:**
- MySQL 8.4 Reference Manual: [Optimization and Indexes](https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html)
- MySQL 8.4 Reference Manual: [CREATE INDEX Statement](https://dev.mysql.com/doc/refman/8.4/en/create-index.html)
- MySQL 8.4 Reference Manual: [EXPLAIN Statement](https://dev.mysql.com/doc/refman/8.4/en/explain.html)
- MySQL 8.4 Reference Manual: [Multiple-Column Indexes](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html)
- MySQL 8.4 Reference Manual: [InnoDB Index Types](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)
- MySQL 8.4 Reference Manual: [Index Merge Optimization](https://dev.mysql.com/doc/refman/8.4/en/index-merge-optimization.html)
