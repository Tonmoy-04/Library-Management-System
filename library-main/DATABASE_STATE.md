# Database State (Single Source of Truth)

## Mandatory Update Instruction
Whenever any database change is made (new table, column update, foreign key change, index change, migration change, seed/data structure change), this file must be updated in the same commit.

If this file is not updated, the database change is considered incomplete.

Purpose:
- After push/pull on GitHub, all developers can see the latest database structure and relation state.
- Avoid schema drift between local environments.

---

## Last Verified
- Date: 2026-04-11
- Environment: SQL Server (Laravel project)
- Verification source: check_tables.php output (live DB connection + table listing)

---

## Current Core Tables
1. users
2. readers
3. publishers
4. books
5. bookshelf
6. book_issues
7. feedback
8. admin_actions_log
9. profiles
10. password_resets
11. migrations
12. password_reset_tokens
13. failed_jobs
14. personal_access_tokens

Additional project tables currently present:
- None verified in the current DB snapshot.

System tables currently present:
1. sysdiagrams

---

## Foreign Key Map (Confirmed)
1. admin_actions_log.admin_id -> users.id
2. admin_actions_log.book_id -> bookshelf.id
3. book_issues.book_id -> books.id
4. book_issues.user_id -> users.id
5. books.publisher_id -> publishers.id
6. bookshelf.publisher_id -> publishers.id
7. feedback.book_id -> books.id
8. feedback.publisher_id -> publishers.id
9. feedback.reader_id -> readers.id

---

## Functional Data Flow
1. Publisher submits books to bookshelf.
2. Admin review actions are stored in admin_actions_log.
3. Approved/active catalog stays in books.
4. Issue/return transactions are stored in book_issues.
5. Reader engagement and purchase history are stored in user_library and transactions.
6. Reader feedback and publisher response are linked in feedback.

---

## Table Responsibilities
1. users: system/admin authentication entities.
2. readers: reader account/auth profile.
3. publishers: publisher account data.
4. books: final visible library catalog (ISBN removed from schema).
5. bookshelf: publisher submission queue.
6. book_issues: issuing and return transaction history.
7. feedback: reader feedback and publisher reply tracking.
8. admin_actions_log: admin decision audit trail.
9. profiles: extra profile metadata.
10. password_resets: password reset support.
11. migrations: migration execution history.
12. password_reset_tokens: Laravel password reset token storage.
13. failed_jobs: queued job failure tracking.
14. personal_access_tokens: token storage for personal access token features.

---

## Update Checklist (Use On Every DB Change)
1. Run relevant Laravel migration(s).
2. Re-check table list.
3. Re-check FK relation output.
4. Update this file sections:
   - Last Verified
   - Current Core Tables
   - Foreign Key Map
   - Table Responsibilities (if changed)
5. Commit migration + code + this file together.

---

## Recommended Verification Commands
Run from library-main:

1) Table list check:
php .\check_tables.php

2) FK map check (quick script pattern):
- Use a temporary PHP script with DB::select on sys.foreign_keys and print parent.column -> referenced.column.

3) Targeted migration apply (safe for this project history):
php artisan migrate --path=database/migrations/<migration_file>.php --force

---

## Change Log
Add a new entry on each schema change.

- 2026-04-11
   - Documentation sync only: verified current live table list via `check_tables.php`.
   - Removed stale "Additional project tables currently present" entries that are not in the current DB snapshot.
   - Updated Last Verified date/source and current table inventory.

- 2026-04-10
   - Removed ISBN from books schema and database/API paths.
   - Added migration: 2026_04_10_122000_drop_isbn_from_books_table.
   - Updated legacy/sync migrations and SQL Server setup script to avoid reintroducing isbn.
   - Verified live state: books.isbn column is absent.

- 2026-04-10
  - Added schema sync migration for connected core relation map.
  - Ensured missing tables: feedback, bookshelf, admin_actions_log.
  - Confirmed FK map for core library workflow.
- 2026-04-10
   - Made legacy create-table migrations idempotent for books, publishers, and book_issues.
   - Verified reader purchase flow after migrating user_library and transactions.
