# Tutor Support System - Frontend

Next.js 15 frontend for the HCMUT Tutor Support System.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom components with Lucide icons
- **HTTP Client**: Axios
- **Notifications**: SweetAlert2
- **Date Handling**: date-fns & date-fns-tz

## 📋 Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Backend API running on `http://localhost:8000`

## 🛠️ Installation & Setup

### 1. Install Dependencies

```powershell
npm install
```

### 2. Environment Configuration

Create `.env` file in the `fe` directory:

```env
NEXT_PUBLIC_BASE_API_URL="http://localhost:8000"
```

### 3. Run Development Server

```powershell
npm run dev
```

Application will be available at `http://localhost:3000`

### 4. Build for Production

```powershell
npm run build
npm start
```

## 👥 User Roles & Access

### Student
- Book tutoring sessions (one-on-one or group)
- Join public group sessions
- View and manage sessions
- Submit feedback after sessions
- Find tutors by subject/expertise

### Tutor
- Manage availability schedule
- Accept/reject/negotiate session requests
- View and respond to student feedback
- Track teaching statistics
- Update profile and expertise

### Department Chair
- View department reports
- Manage tutors and students
- Export session data
- Monitor feedback issues

### Coordinator
- Match students with tutors
- Resolve conflicts
- View pending assignments
- Track session progress

### System Admin
- Manage all users
- Configure system settings
- View audit logs
- Export system data

### Super Admin
- Full system access
- Advanced configurations
- System maintenance tasks

## 📁 Project Structure

```
fe/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── auth/
│   │   └── login/           # Login page with quick dev login
│   ├── student/
│   │   ├── layout.tsx       # Student layout with navigation
│   │   ├── dashboard/       # Student dashboard
│   │   ├── book-session/    # Book new session
│   │   ├── my-sessions/     # Session management with filters
│   │   ├── find-tutor/      # Tutor search
│   │   ├── feedback-summary/# Feedback overview
│   │   └── profile/         # Student profile
│   ├── tutor/
│   │   ├── layout.tsx       # Tutor layout with navigation
│   │   ├── dashboard/       # Tutor dashboard with analytics
│   │   ├── availability/    # Manage availability slots
│   │   ├── requests/        # Pending session requests
│   │   ├── sessions/        # Session list
│   │   ├── feedback-from-students/  # Received feedback
│   │   └── profile/         # Tutor profile
│   ├── coord/               # Coordinator pages
│   ├── dept/                # Department chair pages
│   ├── admin/               # Admin pages
│   └── sa/                  # Super admin pages
├── src/
│   ├── components/          # Reusable components
│   │   ├── BackButton.tsx
│   │   ├── FeedbackModal.tsx
│   │   ├── NegotiationModal.tsx
│   │   ├── NotificationDropdown.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SessionDetailModal.tsx
│   │   └── TutorReviewRequest.tsx
│   ├── config/
│   │   └── env.ts           # Environment variables
│   ├── lib/
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── dateUtils.ts     # Date formatting utilities
│   │   └── role.ts          # Role definitions
│   └── types/               # TypeScript type definitions
│       ├── availability.ts
│       ├── feedback.ts
│       ├── location.ts
│       ├── notification.ts
│       ├── session.ts
│       └── user.ts
├── public/                  # Static assets
├── .env                     # Environment variables
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json
```

## 🎨 Key Features

### Session Management
- **Book Sessions**: Request one-on-one or group tutoring
- **Public Sessions**: Join open group sessions
- **Filters**: Search by course, status, type, mode
- **Negotiation**: Accept/reject tutor counter-proposals
- **Leave Rules**: Different behavior for requesters vs participants

### Notification System
- **Real-time Updates**: Bell icon with red dot indicator
- **Types**: Booking requests, negotiations, confirmations
- **Actions**: Click to view related session
- **Mark as Read**: Track notification status

### Authentication
- **Cookie-based Sessions**: Secure authentication
- **Dev Quick Login**: Role-filtered account list (24 accounts)
- **Role-based Access**: Protected routes by user role

### Tutor Discovery
- **Advanced Search**: By subject, department, tags, mode
- **Availability Display**: See tutor's free time slots
- **Profile View**: Detailed tutor information
- **Rating System**: View feedback from other students

### Feedback & Progress
- **Session Feedback**: Rate tutors (1-5 stars) with comments
- **Progress Logs**: Tutor notes on student progress
- **Analytics**: Feedback distribution and statistics
- **Issue Tracking**: Flag problematic feedback for review

## 🔧 Development

### Run Linter

```powershell
npm run lint
```

### Type Checking

TypeScript compilation happens automatically during development and build.

### Custom Scripts

```json
{
  "dev": "next dev --turbopack",      // Fast refresh with Turbopack
  "build": "next build",              // Production build
  "start": "next start",              // Start production server
  "lint": "next lint"                 // Run ESLint
}
```

## 🎯 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_BASE_API_URL | Backend API URL | http://localhost:8000 |

> **Note**: All client-side environment variables must be prefixed with `NEXT_PUBLIC_`

## 🔐 Authentication Flow

1. User enters email/password on login page
2. Frontend sends credentials to `/auth/login`
3. Backend sets HTTPOnly cookie
4. Frontend stores user info in localStorage
5. Subsequent requests include cookie automatically
6. Protected routes check authentication status

### Dev Quick Login

For development, use the "Show Accounts" button on login page:
- Filter by role (Student, Tutor, etc.)
- Click "Use" to instantly login
- Scrollable list shows all 24 test accounts

## 📱 Responsive Design

- **Mobile-first**: Optimized for small screens
- **Tablet Support**: Adapted layouts for medium devices
- **Desktop**: Full-featured experience
- **Navigation**: Collapsible menus on mobile

## 🎨 Color Scheme

Custom Tailwind colors defined in `tailwind.config.ts`:

```typescript
colors: {
  'dark-blue': '#002147',           // Primary dark
  'light-blue': '#1890FF',          // Primary action
  'light-heavy-blue': '#1677FF',    // Emphasis
  'soft-white-blue': '#F0F2F5',     // Background
  'soft-white': '#FAFAFA',          // Light background
}
```

## 🐛 Common Issues

### Port Already in Use

```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Environment Variables Not Loading

- Restart dev server after changing `.env`
- Ensure variables are prefixed with `NEXT_PUBLIC_`
- Check file is named `.env` (not `.env.local`)

### API Connection Failed

- Verify backend is running on port 8000
- Check CORS settings in backend
- Ensure `credentials: "include"` in fetch calls

## 🚀 Deployment

### Vercel (Recommended)

```powershell
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 API Integration

All API calls use the centralized `api.ts` instance:

```typescript
import api from '@/lib/api';

// GET request
const sessions = await api.get('/sessions/');

// POST request
const response = await api.post('/sessions/', {
  tutor_id: tutorId,
  course_id: courseId,
  // ...
});
```

Benefits:
- Automatic error handling
- Consistent credentials handling
- Interceptors for auth errors
- Base URL configuration

## 🧪 Testing Accounts

Use these accounts for testing different roles:

| Email | Password | Roles |
|-------|----------|-------|
| head.cse@hcmut.edu.vn | 123 | DEPT_CHAIR, TUTOR |
| tuan.pham@hcmut.edu.vn | 123 | TUTOR |
| student_gioi@hcmut.edu.vn | 123 | STUDENT, TUTOR |
| lan.tran@hcmut.edu.vn | 123 | STUDENT |
| an.nguyen@hcmut.edu.vn | 123 | STUDENT |

*See backend seed data for full list of 24 accounts*

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
