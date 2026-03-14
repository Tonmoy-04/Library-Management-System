# Library Frontend

This is a simple React-based frontend for the Library Management project.

## Structure

- **public/** – static assets (index.html).
- **src/** – application source
  - **assets/** – images, icons, styles
  - **components/** – reusable UI and layout components
  - **pages/** – top-level pages for the app
  - **routes/** – React Router configuration
  - **services/** – API helper (axios instance)
  - **context/** – global state (authentication)
  - **hooks/** – custom hooks (useAuth)
  - **utils/** – helper functions (formatDate, etc.)

## Getting started

```bash
cd library-frontend
npm install
npm run dev
```

Frontend features include:

- Tailwind CSS for styling
- React Router for navigation
- Placeholder pages: login, dashboard, books, readers, publishers, transactions
- Basic UI components (button, card, table, etc.)

Customize and extend as needed for your library management workflows.
