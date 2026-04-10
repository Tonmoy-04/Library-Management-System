# Settings Feature - Visual Architecture & Components

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        main.jsx                              │
│  <ThemeProvider>                                             │
│    <AuthProvider>                                            │
│      <App />                                                 │
│    </AuthProvider>                                           │
│  </ThemeProvider>                                            │
└──────────────┬──────────────────────────────────────────────┘
               │
        ┌──────┴────┐
        │           │
   ┌────▼────┐ ┌───▼─────┐
   │Reader   │ │Publisher│
   │Portal   │ │Portal   │
   └────┬────┘ └───┬─────┘
        │          │
   ┌────▼──────┐  ┌┴─────────────┐
   │ReaderPort │  │PublisherPort │
   │alLayout   │  │al            │
   └────┬──────┘  └┬─────────────┘
        │         │
   ┌────▼──────┐  │
   │ Sidebar   │  ├─→ [Dashboard] [Bookshelf] [Reports] [Feedback] [⭐ Settings]
   │ [⭐ ⚙️]   │  │
   └───────────┘  └─→ PublisherPortal renders Settings component in main-content
```

---

## 🗂️ File Hierarchy

```
library-frontend/
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx              (Existing)
│   │   └── ThemeContext.jsx  ⭐ NEW    (Dark mode state)
│   │
│   ├── hooks/
│   │   ├── useAuth.js                   (Existing)
│   │   └── useTheme.js       ⭐ NEW    (Dark mode access)
│   │
│   ├── pages/
│   │   ├── Settings.css      ⭐ NEW    (Shared styles)
│   │   │
│   │   ├── reader/
│   │   │   ├── Home.jsx                 (Existing)
│   │   │   ├── Library.jsx              (Existing)
│   │   │   ├── MyLibrary.jsx            (Existing)
│   │   │   ├── History.jsx              (Existing)
│   │   │   ├── BookDetails.jsx          (Existing)
│   │   │   ├── Settings.jsx   ⭐ NEW   (Reader settings)
│   │   │   ├── Settings.css   ⭐ NEW   (Reader styles)
│   │   │   └── ReaderPortalLayout.jsx   (Updated - adds Settings button)
│   │   │
│   │   └── publishers/
│   │       ├── Dashboard/...            (Existing)
│   │       ├── Bookshelf/...            (Existing)
│   │       ├── Reports/...              (Existing)
│   │       ├── Feedback/...             (Existing)
│   │       ├── Settings.jsx   ⭐ NEW   (Publisher settings)
│   │       └── PublisherPortal.jsx      (Updated - adds Settings)
│   │
│   ├── services/
│   │   └── api.js                       (Updated - new endpoints)
│   │
│   ├── App.jsx                          (Updated - new routes)
│   └── main.jsx                         (Updated - ThemeProvider)
│
└── public/
```

---

## 🔄 Data Flow Diagram

### Dark Mode Flow
```
User toggles switch
        ↓
toggleTheme() called in useTheme
        ↓
isDarkMode state updated
        ↓
useEffect runs
        ↓
html.classList.add/remove('dark-mode')
        ↓
localStorage.setItem('theme', ...)
        ↓
CSS variables update via :root.dark-mode
        ↓
All components re-render with new colors
```

### Profile Update Flow
```
User fills form & clicks Save
        ↓
updateProfile() validates locally
        ↓
readerAuthAPI.updateProfile() called
        ↓
PUT /api/reader/profile (Backend)
        ↓
Backend validates & updates DB
        ↓
Response returned
        ↓
Success message shown
        ↓
setMessage() auto-clears after 3s
```

### Password Change Flow
```
User fills password form & clicks Change
        ↓
Validation checks:
  - All fields filled? ✓
  - Passwords match? ✓
  - Min 8 chars? ✓
        ↓
readerAuthAPI.changePassword() called
        ↓
POST /api/reader/change-password (Backend)
        ↓
Backend verifies current password
        ↓
Backend hashes & updates new password
        ↓
response returned
        ↓
Form cleared, success message shown
```

---

## 🎯 Component Overview

### ThemeContext
```javascript
ThemeContext
├── State
│   ├── isDarkMode: boolean
│   └── toggleTheme: function
├── Effects
│   └── Apply class to html on change
└── Storage
    └── localStorage.theme
```

### ReaderSettings Component
```javascript
ReaderSettings
├── State
│   ├── activeTab: 'profile' | 'theme' | 'password'
│   ├── profile: { name, email, phone }
│   ├── passwords: { current, new, confirm }
│   ├── showPasswords: { current, new, confirm }
│   ├── loading: boolean
│   ├── message: string
│   └── error: string
├── Effects
│   └── loadProfile() on mount
└── Handlers
    ├── updateProfile()
    ├── updatePassword()
    ├── handleProfileChange()
    ├── handlePasswordChange()
    └── togglePasswordVisibility()
```

### PublisherSettings Component
```javascript
PublisherSettings
├── State (Same as ReaderSettings)
├── Effects
│   └── loadProfile() via publisherAuthAPI
└── Handlers
    └── (Same methods, different API)
```

---

## 🔌 API Integration Points

### Frontend
```
src/services/api.js
├── readerAuthAPI
│   ├── login()
│   ├── register()
│   ├── logout()
│   ├── me()
│   ├── updateProfile()         ⭐ NEW
│   └── changePassword()         ⭐ NEW
└── publisherAuthAPI
    ├── login()
    ├── register()
    ├── logout()
    ├── me()
    ├── updateProfile()         ⭐ NEW
    └── changePassword()         ⭐ NEW
```

### Backend (Required)
```
Backend/Laravel
├── SettingsController
│   ├── updateReaderProfile()
│   ├── changeReaderPassword()
│   ├── updatePublisherProfile()
│   └── changePublisherPassword()
└── Routes
    ├── PUT /api/reader/profile
    ├── POST /api/reader/change-password
    ├── PUT /api/publisher/profile
    └── POST /api/publisher/change-password
```

---

## 🎨 UI Component Hierarchy

### Settings Page Structure
```
SettingsContainer
├── SettingsHeader
│   ├── h1: "⚙️ Settings"
│   └── p: "Manage your account..."
├── Alert (error/success)
│   └── Message display
└── SettingsLayout
    ├── SettingsTabs (Sidebar)
    │   ├── Tab "👤 Profile"
    │   ├── Tab "🌙 Appearance"
    │   └── Tab "🔐 Password"
    └── SettingsContent (Main)
        ├── SettingsSection (Profile)
        │   ├── FormGroup (Name input)
        │   ├── FormGroup (Email input)
        │   ├── FormGroup (Phone input)
        │   └── Button (Save)
        ├── SettingsSection (Theme)
        │   ├── ThemeOption
        │   │   ├── ThemeInfo
        │   │   └── ToggleSwitch (Dark mode)
        │   └── ThemePreview
        │       └── PreviewBox (Light/Dark)
        └── SettingsSection (Password)
            ├── FormGroup (Current password)
            │   ├── PasswordInputGroup
            │   ├── Input
            │   └── ToggleButton
            ├── FormGroup (New password)
            │   ├── PasswordInputGroup
            │   ├── Input
            │   └── ToggleButton
            ├── FormGroup (Confirm password)
            │   ├── PasswordInputGroup
            │   ├── Input
            │   └── ToggleButton
            └── Button (Change password)
```

---

## 📊 CSS Class Hierarchy

```
.settings-container
├── .settings-header
├── .alert
│   ├── .alert-error
│   └── .alert-success
└── .settings-layout
    ├── .settings-tabs
    │   └── .tab-btn
    │       └── .tab-btn.active
    └── .settings-content
        └── .settings-section
            ├── h2
            ├── .settings-form
            │   ├── .form-group
            │   │   ├── label
            │   │   └── input
            │   └── .btn
            │       └── .btn-primary
            ├── .theme-settings
            │   ├── .theme-option
            │   │   ├── .theme-info
            │   │   └── .toggle-switch
            │   └── .theme-preview
            │       └── .preview-box
            └── .password-input-group
                ├── input
                └── .toggle-password-btn
```

---

## 🌍 Theme Variables System

### Light Mode (Default)
```css
:root {
  --primary-color: #0f67f8;
  --primary-hover: #0a55cf;
  --secondary-color: #eef4ff;
  --accent-color: #0ea886;
  --text-main: #1c2434;
  --text-muted: #647088;
  --bg-main: #f4f7ff;
  --bg-card: #ffffff;
  --border-color: #d9e4f6;
  --shadow: 0 8px 24px rgba(28, 36, 52, 0.08);
  --shadow-hover: 0 14px 40px rgba(15, 103, 248, 0.14);
}
```

### Dark Mode
```css
:root.dark-mode {
  --bg-main: #121212;
  --bg-card: #1e1e1e;
  --text-main: #e0e0e0;
  --text-muted: #b0b0b0;
  --border-color: #333;
  /* Other variables inherit from :root */
}
```

---

## 🔐 State Management Flow

```
┌─────────────────────────────────────────┐
│        Global Theme State               │
│  (ThemeContext)                         │
│  isDarkMode, toggleTheme                │
└──────────┬──────────────────────────────┘
           │
      ┌────┴──────────────────┐
      │                       │
      ▼                       ▼
┌─────────────────┐  ┌──────────────────┐
│ Settings.jsx    │  │ Any Component    │
│ useTheme()      │  │ useTheme()       │
│ ├─ isDarkMode   │  │                  │
│ └─ toggleTheme  │  │ Can access dark  │
└─────────────────┘  │ mode state & fn  │
                     └──────────────────┘

┌─────────────────────────────────────────┐
│     Local Component State               │
│  (ReaderSettings.jsx)                   │
├─ activeTab                             │
├─ profile                               │
├─ passwords                             │
├─ showPasswords                         │
├─ loading                               │
├─ message                               │
└─ error                                 │
```

---

## 🔄 Router Configuration

```
App Router
├── /
├── /login
├── /register
├── /dashboard
├── /books
├── /readers
├── /publishers
├── /transactions
├── /settings (admin)
├── /profile (existing)
│
├── /reader/home       (ReaderLayout wrapper)
├── /reader/library    (ReaderLayout wrapper)
├── /reader/my-library (ReaderLayout wrapper)
├── /reader/history    (ReaderLayout wrapper)
├── /reader/settings   (ReaderLayout wrapper) ⭐ NEW
└── /reader/books/:id  (ReaderLayout wrapper)

└── /publisher/portal (PublisherPortal - has Settings tab) ⭐ NEW
```

---

## 📱 Responsive Breakpoints Implementation

```
Desktop (≥ 768px)
├── Layout: 200px sidebar + 1fr content
├── Tabs: Vertical column
└── Buttons: Inline width-fit-content

Tablet (768px - 480px)
├── Layout: Collapse to 1 column
├── Tabs: Horizontal flex with wrap
└── Buttons: Still inline

Mobile (< 480px)
├── Layout: Single column, no sidebar
├── Tabs: Horizontal with horizontal scroll
└── Buttons: Full width
```

---

## ⚡ Performance Optimization

### Lazy Loading
- Settings components not loaded until accessed
- Theme calculated only on preference change

### Memoization
- Form inputs use controlled components
- useCallback for handlers (future enhancement)

### CSS Performance
- CSS variables for efficient theming
- Single class toggle for dark mode

### API Calls
- Data fetched only when component mounts
- Update only sends changed fields

---

## 🧪 Testing Hierarchy

```
Unit Tests (Future)
├── ThemeContext
├── useTheme hook
├── Form validation
├── API service methods
└── Component logic

Integration Tests (Future)
├── Theme persistence
├── Profile update flow
├── Password change flow
├── Error handling
└── Responsive layout

E2E Tests (Future)
├── User journey
├── Dark mode toggle
├── Profile update
├── Password change
└── Form validation
```

---

## 🚀 Deployment Architecture

```
Development Environment
├── localhost:8000 (Laravel API)
└── localhost:5176 (Vite dev server)

Staging Environment
├── staging-api.example.com (Laravel API)
└── staging-app.example.com (Frontend)

Production Environment
├── api.example.com (Laravel API)
├── app.example.com (Frontend)
└── CDN (Static assets)
```

---

## 📋 Summary

✅ **Completed**:
- Theme context and hook
- Settings pages for Reader and Publisher
- Dark mode CSS variables
- Profile edit forms
- Password change forms
- Routing and navigation
- API service integration
- Form validation
- Error handling
- Responsive design

⏳ **Pending**:
- Backend API implementation
- Database migrations
- Security configurations
- Rate limiting
- Audit logging

---

**Version**: 1.0.0  
**Last Updated**: April 11, 2026
