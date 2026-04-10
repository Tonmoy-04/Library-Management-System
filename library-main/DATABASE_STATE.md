# Database State (Single Source of Truth)

## Mandatory Update Instruction
Whenever any database change is made (new table, column update, foreign key change, index change, migration change, seed/data structure change), this file must be updated in the same commit.

If this file is not updated, the database change is considered incomplete.

Purpose:
- After push/pull on GitHub, all developers can see the latest database structure and relation state.
- Avoid schema drift between local environments.

---

## Last Verified
- Date: 2026-04-11 (updated after PDF workflow implementation)
- Environment: SQL Server (Laravel project)
- Verification source: check_tables.php output + sys.foreign_keys query (live DB connection)

---

## Current Core Tables
1. users (authentication/system users)
2. readers (reader authentication & profile)
3. publishers (publisher authentication & profile)
4. books (published book catalog with pdf_url)
5. bookshelf (publisher book collections)
6. book_issues (book issue/return transactions)
7. feedback (reader feedback & publisher replies)
8. admin_actions_log (admin review audit trail for submissions)
9. profiles (extended user profiles)
10. password_resets (password reset tokens)
11. password_reset_tokens (Laravel password reset tokens)
12. migrations (Laravel migration history)
13. failed_jobs (failed job queue entries)
14. personal_access_tokens (API authentication tokens)

Additional operational tables:
1. publisher_book_submissions (publisher book submission queue for admin review)
2. bookshelf_book (junction table for books in collections)
3. reader_activities (reader activity tracking)
4. reader_book_purchases (reader purchase history)
5. reader_bookmarks (reader bookmarks)
6. reader_reading_progress (reader reading progress tracking)
7. transactions (transaction history)
8. user_library (user library/reading list)

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
7. bookshelf_book.book_id -> books.id *(NEW)*
8. bookshelf_book.bookshelf_id -> bookshelf.id *(NEW)*
9. feedback.book_id -> books.id
10. feedback.publisher_id -> publishers.id
11. feedback.reader_id -> readers.id
12. profiles.user_id -> users.id *(NEW)*
13. publisher_book_submissions.publisher_id -> publishers.id *(NEW)*

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
4. books: final visible library catalog (includes pdf_url for published PDFs).
5. bookshelf: publisher book collections for organizing/curating published books.
6. bookshelf_book: junction table linking books to bookshelf collections (many-to-many).
7. book_issues: issuing and return transaction history.
8. feedback: reader feedback and publisher reply tracking.
9. admin_actions_log: admin decision audit trail (submission acceptance/rejection).
10. publisher_book_submissions: queue/staging table for publisher book submissions awaiting admin review.
11. profiles: extra profile metadata.
12. password_resets: password reset support.
13. password_reset_tokens: Laravel password reset token storage.
14. migrations: migration execution history.
15. failed_jobs: queued job failure tracking.
16. personal_access_tokens: token storage for personal access token features.
17. reader_activities: reader activity event tracking.
18. reader_book_purchases: reader purchase transaction history.
19. reader_bookmarks: reader bookmarks/saved positions.
20. reader_reading_progress: reader reading progress per book.
21. transactions: general transaction history.
22. user_library: reader personal library/reading list.

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

- 2026-04-11 (LATEST)
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
