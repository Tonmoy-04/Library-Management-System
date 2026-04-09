# Publisher Portal - Complete Documentation

## Overview

The Publisher Portal is a comprehensive dashboard system that allows publishers to manage their books, track sales, view analytics, and engage with reader feedback. It's built with React on the frontend and Laravel on the backend.

## Features

### 1. **Dashboard** 📊
Displays an overview of publisher activities with key metrics:

- **Total Books Published**: Count of all books published by the publisher
- **Available Books**: Number of books currently available for readers
- **Total Sales**: Total number of book issues/transactions
- **Recent Activity**: Count of recent transactions

**Additional Features:**
- List of recently published books with publication dates
- Recent transactions showing book issues and their status
- Refresh button to update dashboard data

### 2. **Bookshelf** 📚
Complete book management system for publishers:

**Features:**
- View all published books in a table format
- Add new books with the following fields:
  - Title (required)
  - Author (required)
  - ISBN (optional)
  - Description (optional)
  - Quantity (number of copies)
  - Price (in currency)
- Edit existing book information
- Delete books
- View book status (Available/Out of Stock)
- Track quantity and available copies

**Add/Edit Book Form:**
- Modal dialog for adding or editing books
- Form validation with error messages
- Success notifications after save
- Cancel option to close modal

### 3. **Reports** 📈
Analytics and performance insights with multiple filtering options:

**Dashboard Metrics:**
- Total Revenue: Sum of prices for all sold books
- Books Sold: Count of book issues in the period
- Total Sales: Overall sales transactions
- Average Rating: Average feedback rating from readers

**Reports Available:**
- **Top Performing Books**: Ranked list showing:
  - Book rank
  - Title and author
  - Copies sold
  - Total revenue
  
- **Sales Trend**: Visual line chart showing:
  - Daily sales over time
  - Sales amounts by date
  - Interactive bar chart visualization

- **User Engagement Metrics**:
  - Total views
  - Total downloads
  - Average reading time
  - Repeat readers count

**Filters:**
- Date range selection (start and end dates)
- Filter type (Sales/Performance/Engagement)
- Book selection (All books or specific book)

### 4. **Feedback** 💬
Manage reader feedback and engagement:

**Features:**
- View all feedback from readers
- Filter by status (All/Pending Reply/Resolved)
- Sort feedback (Newest/Oldest/Highest Rating/Lowest Rating)
- See reader ratings (1-5 stars)

**Feedback Details:**
- Reader name
- Book title
- Star rating
- Full comment text
- Date feedback was posted

**Publisher Actions:**
- Reply to feedback from readers
- Mark feedback as resolved
- View previous replies
- Track reply dates and times

**Feedback List:**
- Shows feedback summary
- Color-coded status badges
- Reader name and book title
- Snippet of feedback comment
- Visual indication of rating

## Technical Implementation

### Frontend Structure

```
src/pages/publishers/
├── PublisherPortal.jsx          # Main component with tab navigation
├── PublisherPortal.css          # Main styling
├── components/
│   ├── Dashboard.jsx            # Dashboard component
│   ├── Bookshelf.jsx            # Book management component
│   ├── Reports.jsx              # Reports and analytics component
│   └── Feedback.jsx             # Feedback management component
└── styles/
    ├── Dashboard.css             # Dashboard styles
    ├── Bookshelf.css             # Bookshelf styles
    ├── Reports.css               # Reports styles
    └── Feedback.css              # Feedback styles
```

### Backend Structure

**Models:**
- `Publisher.php` - Publisher model with relationships
- `Book.php` - Book model with publisher relationship
- `Reader.php` - Reader model with feedback relationship
- `Feedback.php` - Feedback model linking readers to books
- `BookIssue.php` - Track book transactions

**Controller:**
- `PublisherPortalController.php` - Handles all portal requests

**Database:**
- `feedback` table - Stores reader feedback with replies

### API Endpoints

All endpoints require authentication (`auth:api` middleware)

#### Dashboard
```
GET /api/publisher-portal/{publisherId}/dashboard
```
Returns dashboard metrics and recent activities

#### Bookshelf
```
GET /api/publishers/{publisherId}/books
POST /api/books
PUT /api/books/{id}
DELETE /api/books/{id}
```

#### Reports
```
GET /api/publisher-portal/{publisherId}/reports?startDate=&endDate=&filterType=
```
Query Parameters:
- `startDate` - Start date for report (YYYY-MM-DD)
- `endDate` - End date for report (YYYY-MM-DD)
- `filterType` - Type of report (sales/performance/engagement)
- `bookId` - Optional book ID filter

#### Feedback
```
GET /api/publisher-portal/{publisherId}/feedback?status=
POST /api/publisher-portal/feedback/{feedbackId}/reply
PUT /api/publisher-portal/feedback/{feedbackId}/status
```
Query Parameters:
- `status` - Filter by status (all/pending/resolved)

Request Body for Reply:
```json
{
  "reply": "Thank you for your feedback..."
}
```

Request Body for Status Update:
```json
{
  "status": "resolved"
}
```

## Database Schema

### Feedback Table
```sql
CREATE TABLE feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  book_id BIGINT NOT NULL,
  reader_id BIGINT NOT NULL,
  publisher_id BIGINT NOT NULL,
  rating INT DEFAULT 5,
  comment TEXT NOT NULL,
  reply TEXT NULL,
  replied_at TIMESTAMP NULL,
  status ENUM('pending', 'resolved') DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (reader_id) REFERENCES readers(id),
  FOREIGN KEY (publisher_id) REFERENCES publishers(id)
);
```

## How to Use

### Accessing the Publisher Portal

1. Add the route to your app routing:
```javascript
import PublisherPortal from './pages/publishers/PublisherPortal';

// In your routes
<Route path="/publisher/portal" element={<PublisherPortal />} />
```

2. The portal retrieves the publisher ID from the logged-in user's profile
3. Navigate to `/publisher/portal` after logging in as a publisher

### Adding a Book

1. Click the "➕ Add New Book" button
2. Fill in the required fields (Title, Author)
3. Optionally add ISBN, Description, Quantity, and Price
4. Click "Save Book"
5. Book appears in the bookshelf immediately

### Managing Feedback

1. Go to the Feedback tab
2. Filter by status if needed
3. Click on a feedback item to view details
4. Type your reply in the text area
5. Click "Send Reply" or "Mark as Resolved"
6. The feedback status updates automatically

### Viewing Reports

1. Go to the Reports tab
2. Set date range using the date pickers
3. Choose filter type (Sales/Performance/Engagement)
4. Reports automatically update with filtered data
5. View top performing books, sales trends, and engagement metrics

## Customization Options

### Styling
All components use CSS variables and gradients. Main colors:
- Primary: `#667eea` to `#764ba2` (gradient)
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`

### Adding More Metrics
Edit the `PublisherPortalController.php` to add custom calculations for reports.

### Extending Feedback
Add custom fields to feedback by:
1. Creating a new migration
2. Updating the Feedback model fillable array
3. Updating the React component form

## Best Practices

1. **Data Validation**: All API endpoints validate input data
2. **Error Handling**: Components include error states and messaging
3. **Performance**: Use pagination for large datasets
4. **Security**: All routes require authentication
5. **Responsive Design**: Components are mobile-friendly

## Troubleshooting

### "Failed to load dashboard data"
- Check if publisher ID is correct
- Verify API endpoint is accessible
- Check browser console for errors

### Books not appearing in Bookshelf
- Ensure books are assigned to the publisher
- Check if publisher_id is correctly set in database
- Run migration to ensure feedback table exists

### Feedback not loading
- Verify feedback records exist in database
- Check if feedback is linked to correct publisher
- Ensure reader and book records exist

## Future Enhancements

1. Export reports to PDF/Excel
2. Email notifications for feedback
3. Advanced analytics with charts
4. Book review ratings display
5. Publisher profile customization
6. Batch operations for books
7. Revenue calculations with currency conversion
8. Reader demographics analysis

## Migration Commands

To run pending migrations:
```bash
php artisan migrate
```

To rollback last migration:
```bash
php artisan migrate:rollback
```

Check migration status:
```bash
php artisan migrate:status
```

## Testing the Portal

Sample API test with curl:
```bash
# Get dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/publisher-portal/1/dashboard

# Get feedback
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/publisher-portal/1/feedback

# Reply to feedback
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reply":"Thank you..."}' \
  http://localhost:8000/api/publisher-portal/feedback/1/reply
```

## Support

For issues or questions, refer to the component code comments or backend controller documentation.
