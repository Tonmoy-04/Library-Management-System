# Database State (Single Source of Truth)

## Mandatory Update Instruction
Whenever any database change is made (new table, column update, foreign key change, index change, migration change, seed/data structure change), this file must be updated in the same commit.

If this file is not updated, the database change is considered incomplete.

Purpose:
- After push/pull on GitHub, all developers can see the latest database structure and relation state.
- Avoid schema drift between local environments.

---

## Last Verified
- Date: 2026-04-11 (updated after payment split + admin PDF upload schema updates)
- Environment: SQL Server (Laravel project)
- Verification source: check_tables.php output + sys.foreign_keys query + migrate:status (live DB connection) + targeted migration apply logs

---

## Current Core Tables
1. users (authentication/system users)
2. readers (reader authentication/profile + online registration/suspension state)
3. publishers (publisher authentication/profile + suspension state)
4. books (published book catalog with core metadata)
5. bookshelf (publisher book collections)
6. book_issues (book issue/return transactions)
7. feedback (reader feedback & publisher replies)
8. admin_actions_log (admin review audit trail for submissions)
9. profiles (extended user profiles)
10. password_resets (password reset tokens)
11. migrations (Laravel migration history)

Additional operational tables:
1. publisher_book_submissions (publisher book submission queue for admin review)
2. borrow_requests (reader borrow request queue)
3. borrowed_books (borrowed book records tied to issues and users)
4. reader_activities (reader activity tracking)
5. reader_book_purchases (reader purchase history)
6. reader_bookmarks (reader bookmarks)
7. reader_reading_progress (reader reading progress tracking)
8. transactions (transaction history)
9. user_library (user library/reading list)
10. user_reader_profiles (extended reader profile data)
11. user_roles (user role assignment table)

System tables:
1. sysdiagrams (SQL Server system diagrams)

---

## Foreign Key Map (Confirmed)
1. admin_actions_log.admin_id -> users.id
2. admin_actions_log.submission_id -> publisher_book_submissions.id *(updated: was book_id -> bookshelf.id)*
3. book_issues.book_id -> books.id
4. book_issues.user_id -> users.id
5. books.publisher_id -> publishers.id
6. bookshelf.publisher_id -> publishers.id
7. borrow_requests.book_id -> books.id
8. borrow_requests.user_id -> users.id
9. borrowed_books.book_id -> books.id
10. borrowed_books.book_issue_id -> book_issues.id
11. borrowed_books.user_id -> users.id
12. feedback.book_id -> books.id
13. feedback.publisher_id -> publishers.id
14. feedback.reader_id -> readers.id
15. publisher_book_submissions.publisher_id -> publishers.id
16. user_reader_profiles.user_id -> users.id
17. user_roles.user_id -> users.id
18. transactions.publisher_id -> publishers.id

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
2. readers: reader account/auth profile with online-registration and suspension controls (`is_online_registered`, `is_suspended`, `suspended_at`).
3. publishers: publisher account data with admin suspension controls (`is_suspended`, `suspended_at`).
4. books: final visible library catalog (core metadata + optional `pdf_url` for uploaded book files).
5. bookshelf: publisher book collections for organizing/curating published books.
6. book_issues: issuing and return transaction history.
7. feedback: reader feedback and publisher reply tracking.
8. admin_actions_log: admin decision audit trail (submission acceptance/rejection).
9. publisher_book_submissions: queue/staging table for publisher book submissions awaiting admin review.
10. profiles: extra profile metadata.
11. password_resets: password reset support.
12. migrations: migration execution history.
13. borrow_requests: reader borrow request workflow.
14. borrowed_books: active or historical borrowed book tracking.
15. reader_activities: reader activity event tracking.
16. reader_book_purchases: reader purchase transaction history.
17. reader_bookmarks: reader bookmarks/saved positions.
18. reader_reading_progress: reader reading progress per book.
19. transactions: payment and settlement history (includes admin and publisher revenue splits).
20. user_library: reader personal library/reading list.
21. user_reader_profiles: extended reader profile metadata.
22. user_roles: user role assignment records.

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
    - Added reader status/suspension schema migration: `2026_04_11_120000_add_online_and_suspension_columns_to_readers_table`.
    - Added publisher suspension schema migration: `2026_04_11_130000_add_suspension_columns_to_publishers_table`.
    - Reader table now includes:
       * `is_online_registered` (boolean)
       * `is_suspended` (boolean)
       * `suspended_at` (nullable timestamp)
    - Publisher table now includes:
       * `is_suspended` (boolean)
       * `suspended_at` (nullable timestamp)
    - Admin flow now supports suspend/unsuspend actions for online readers and publishers, and suspended reader/publisher login is blocked at auth layer.

- 2026-04-11
   - Removed `cover_image_url` and `pdf_url` from the final books schema with a new cleanup migration.
   - Updated the admin add/edit book form to collect title, author, publisher, category, price, and free-to-read instead of ISBN/quantity.
   - Updated the books API to store category and price, and to treat free-to-read books as zero-priced.

- 2026-04-11
   - Added payment split support for reader purchases.
   - Added migration: `2026_04_11_010000_add_payment_split_columns_to_transactions_table`.
   - `transactions` now stores `publisher_id`, `admin_share` (10%), `publisher_share` (90%), `payment_method`, and `payment_reference`.
   - Reader purchase flow now records split amounts and payment metadata.
   - Admin transaction list and publisher dashboard/reports now read publisher earnings from split transaction records.

- 2026-04-11
   - Added migration: `2026_04_11_020000_add_pdf_url_to_books_table`.
   - Re-enabled `books.pdf_url` to support PDF upload in admin add/edit book form.

- 2026-04-11
   - Added migration: `2026_04_11_030000_add_admin_style_fields_to_publisher_book_submissions_table`.
   - Publisher add-book form now follows admin-style fields: title, author, publisher (prefilled), category, price, quantity, free-to-read, and PDF upload.
   - Added `category`, `quantity`, and `free_to_read` columns to `publisher_book_submissions`.
   - Admin acceptance flow now carries these submission values into `books` (category, quantity/available, free-to-read price logic).

- 2026-04-11 (prior sync)
    - Live DB sync after applying pending migrations and reconciling the schema inventory.
    - Added migrations to the live database:
       * 2026_04_10_184017_create_publisher_book_submissions_table
       * 2026_04_10_185511_fix_admin_actions_log_foreign_key
       * 2026_04_10_190018_add_pdf_url_to_books_table
    - Live table inventory now includes: publisher_book_submissions, borrow_requests, borrowed_books, user_reader_profiles, and user_roles.
    - Live FK verification confirmed:
       * admin_actions_log.submission_id -> publisher_book_submissions.id
       * borrowed_books.book_issue_id -> book_issues.id
       * borrow_requests.user_id -> users.id
       * user_reader_profiles.user_id -> users.id
       * user_roles.user_id -> users.id
    - Updated Last Verified source to include sys.foreign_keys and migration status checks.

- 2026-04-11
   - **PDF Publishing Workflow Implementation**
   - Added migration: 2026_04_10_184017_create_publisher_book_submissions_table
   - Added model: PublisherBookSubmission (separate from bookshelf collections)
   - Added migration: 2026_04_10_190018_add_pdf_url_to_books_table
   - Added migration: 2026_04_10_185511_fix_admin_actions_log_foreign_key
   - Schema changes:
     * New table: publisher_book_submissions (publisher submission queue)
     * New column: books.pdf_url (stores published PDF file paths)
     * Fixed FK: admin_actions_log.submission_id -> publisher_book_submissions.id (was book_id -> bookshelf.id)
   - Updated models: Book, AdminActionLog, PublisherBookSubmission
   - Updated controllers: PublisherPortalController, LibraryDataController
   - Frontend: Added PDF viewer modal in BookDetails component
   - Workflow: Publisher submits PDF → Admin reviews → If accepted, PDF copied to books.pdf_url → Readers can view

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
