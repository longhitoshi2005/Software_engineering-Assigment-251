# 🔔 Notification System - Implementation Guide

## ✨ Overview

Đã implement hoàn chỉnh notification system với các tính năng:
- ✅ Real-time notification dropdown
- ✅ Unread badge with count
- ✅ Mark as read on click
- ✅ Mark all as read
- ✅ Smart navigation based on notification type
- ✅ Responsive design
- ✅ Auto-refresh when dropdown opens

## 📁 Files Created/Modified

### Backend (Already existed - only enhanced)
- ✅ `be/app/models/internal/notification.py` - Notification model
- ✅ `be/app/routes/notifications.py` - API endpoints (added mark-all-read)
- ✅ `be/app/services/notification_service.py` - Business logic (added mark_all_as_read)
- ✅ `be/app/models/schemas/notification.py` - Response schemas

### Frontend (New)
- ✅ `fe/src/types/notification.ts` - TypeScript types
- ✅ `fe/src/components/NotificationDropdown.tsx` - Main component
- ✅ `fe/src/components/MainNavbarClean.tsx` - Updated navbar

## 🎯 Features

### 1. **Notification Dropdown Component**
Location: Right side of navbar (bell icon)

**Features:**
- Shows unread count badge (red, animated)
- Click to open dropdown
- Auto-loads notifications on open
- Click outside to close

### 2. **Notification Types & Icons**
Each notification type has unique icon and color:

| Type | Icon | Color | Triggered When |
|------|------|-------|----------------|
| `BOOKING_REQUEST` | 📬 | Blue | Student requests session |
| `SESSION_CONFIRMED` | ✅ | Green | Tutor confirms session |
| `SESSION_REJECTED` | ❌ | Red | Tutor rejects session |
| `SESSION_CANCELLED` | 🚫 | Orange | Session cancelled |
| `REMINDER` | ⏰ | Yellow | Session reminder |
| `FEEDBACK_REQUEST` | 💬 | Purple | Feedback needed |

### 3. **Smart Navigation**
Clicking a notification navigates to relevant page:

**For TUTOR:**
- `BOOKING_REQUEST` → `/tutor/requests`
- `SESSION_CONFIRMED` → `/tutor/schedule`
- `SESSION_CANCELLED` → `/tutor/schedule`
- `REMINDER` → `/tutor/sessions-today`

**For STUDENT:**
- `SESSION_CONFIRMED` → `/student/my-sessions`
- `SESSION_REJECTED` → `/student/my-sessions`
- `SESSION_CANCELLED` → `/student/my-sessions`
- `FEEDBACK_REQUEST` → `/student/feedback`

### 4. **Mark as Read**
- Individual: Click notification → auto mark as read
- Bulk: "Mark all as read" button → marks all unread

## 🔌 API Endpoints

### GET `/notifications/`
Get all notifications for current user (sorted newest first)

**Response:**
```json
[
  {
    "id": "123",
    "type": "BOOKING_REQUEST",
    "title": "New Booking Request",
    "message": "You have a new tutoring session request...",
    "session_id": "456",
    "is_read": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### PUT `/notifications/{id}/read`
Mark single notification as read

**Response:**
```json
{
  "id": "123",
  "type": "BOOKING_REQUEST",
  ...
  "is_read": true
}
```

### PUT `/notifications/mark-all-read`
Mark all unread notifications as read

**Response:**
```json
{
  "message": "Marked 5 notifications as read",
  "count": 5
}
```

## 🎨 UI/UX Details

### Notification Bell
- **Normal state:** White bell icon on dark navbar
- **With unread:** Red pulsing badge with count
- **Hover:** Light background highlight

### Dropdown Menu
- **Max height:** 32rem (scrollable)
- **Max notifications shown:** 10 latest
- **Width:** 320px (mobile) / 384px (desktop)
- **Position:** Right-aligned to bell icon

### Notification Item
- **Unread:** Blue background highlight + blue dot
- **Read:** Normal background
- **Hover:** Soft blue background
- **Content:** Icon + Title + Message (truncated to 2 lines) + Time ago

## 🔄 How Notifications are Created

Notifications are automatically created by `NotificationService` in backend when:

1. **Student creates booking** → Tutor gets `BOOKING_REQUEST`
2. **Tutor confirms session** → Student gets `SESSION_CONFIRMED`
3. **Tutor rejects session** → Student gets `SESSION_REJECTED`
4. **Someone cancels session** → Other party gets `SESSION_CANCELLED`
5. **Session reminder** → Both parties get `REMINDER`
6. **Session completed** → Student gets `FEEDBACK_REQUEST`

Example from backend:
```python
# In schedule_service.py - when confirming session
await NotificationService.create_system_notification(
    receiver_user=student.user,
    n_type=NotificationType.SESSION_CONFIRMED,
    session=session,
    extra_message="Your session has been confirmed by the tutor."
)
```

## 📱 Responsive Design

- **Desktop:** Full dropdown with all features
- **Mobile:** Adjusted width (320px), maintains all functionality
- **Z-index:** 50 (above all content)

## 🚀 Usage Example

### For Students:
1. Request a session
2. Wait for notification (bell badge appears)
3. Click bell → see "Session Confirmed" notification
4. Click notification → go to my-sessions page
5. Notification marked as read automatically

### For Tutors:
1. Receive booking request
2. Bell shows unread count
3. Click bell → see "New Booking Request"
4. Click notification → go to requests page to approve/reject
5. After action → notification marked as read

## ⚙️ Configuration

### Auto-refresh
Notifications refresh when dropdown opens. To change polling interval, modify in component:

```typescript
// Current: manual refresh on open
useEffect(() => {
  if (isOpen) {
    loadNotifications();
  }
}, [isOpen]);

// To add auto-polling:
useEffect(() => {
  const interval = setInterval(loadNotifications, 30000); // 30s
  return () => clearInterval(interval);
}, []);
```

### Display Limit
Currently shows 10 latest notifications. To change:

```typescript
const displayNotifications = notifications.slice(0, 10); // Change 10 to desired number
```

## 🧪 Testing Checklist

- [ ] Bell icon appears in navbar
- [ ] Unread count badge shows correct number
- [ ] Badge animates (pulse effect)
- [ ] Dropdown opens on click
- [ ] Dropdown closes when clicking outside
- [ ] Notifications load and display correctly
- [ ] Icons and colors match notification types
- [ ] Click notification → navigates to correct page
- [ ] Click notification → marks as read
- [ ] "Mark all as read" works
- [ ] Time ago displays correctly
- [ ] Scrolling works for many notifications
- [ ] Responsive on mobile

## 🔧 Troubleshooting

### Notifications not showing
- Check backend is running
- Check authentication (cookies)
- Verify `/notifications/` endpoint returns data
- Check browser console for errors

### Navigation not working
- Verify routes exist in your app
- Check user role detection logic
- Ensure router.push() paths are correct

### Badge not updating
- Check notification `is_read` field
- Verify mark-as-read API call succeeds
- Check state update logic

## 📈 Future Enhancements

Possible improvements:
- [ ] WebSocket for real-time push notifications
- [ ] Sound notification on new notification
- [ ] Desktop push notifications (Web Push API)
- [ ] Notification preferences/settings
- [ ] Delete notifications
- [ ] Filter by notification type
- [ ] Notification history page (separate view)
- [ ] Email notifications for important events

## 🎉 Summary

✅ **Complete notification system** with dropdown UI
✅ **Smart navigation** based on notification type
✅ **Real-time updates** when opening dropdown
✅ **Mark as read** individually or in bulk
✅ **Beautiful UI** with icons, colors, and animations
✅ **Responsive design** for all devices
✅ **Easy to extend** with new notification types

The notification system is ready to use! 🚀
