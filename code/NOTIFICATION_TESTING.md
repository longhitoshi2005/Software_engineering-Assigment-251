# Notification System Testing Script

This script demonstrates how to test the notification system.

## Manual Testing Steps

### 1. Test Notification Creation (Student Books Session)

**As Student:**
1. Login as student
2. Go to `/student/find-tutor`
3. Select a tutor
4. Click "Book session"
5. Fill form and submit
6. ✅ **Expected:** Student sees success message

**As Tutor:**
1. Login as tutor (same browser, different tab or incognito)
2. Check navbar bell icon
3. ✅ **Expected:** Red badge appears with "1"
4. Click bell icon
5. ✅ **Expected:** Dropdown shows "New Booking Request" notification with 📬 icon
6. Click notification
7. ✅ **Expected:** Navigate to `/tutor/requests` page
8. ✅ **Expected:** Notification marked as read (blue dot disappears)

### 2. Test Session Confirmation

**As Tutor:**
1. On `/tutor/requests` page
2. Click "Confirm" on a pending request
3. Fill in capacity/location details
4. Submit confirmation
5. ✅ **Expected:** Session confirmed

**As Student:**
1. Check bell icon
2. ✅ **Expected:** Badge shows "1" (new notification)
3. Open dropdown
4. ✅ **Expected:** "Session Confirmed" notification with ✅ icon
5. Click notification
6. ✅ **Expected:** Navigate to `/student/my-sessions`

### 3. Test Session Rejection

**As Tutor:**
1. On `/tutor/requests` page
2. Click "Reject" on a request
3. Enter rejection reason
4. Submit

**As Student:**
1. Check bell icon
2. ✅ **Expected:** "Session Rejected" notification with ❌ icon (red background)
3. Click notification
4. ✅ **Expected:** Navigate to sessions page

### 4. Test Mark All as Read

1. Ensure you have multiple unread notifications
2. Click bell icon
3. ✅ **Expected:** Badge shows count (e.g., "3")
4. Click "Mark all as read" button
5. ✅ **Expected:** All notifications turn to read state (no blue dot)
6. ✅ **Expected:** Badge disappears from bell icon

### 5. Test Navigation Logic

For each notification type, verify navigation:

| User Type | Notification Type | Expected Navigation |
|-----------|-------------------|---------------------|
| Tutor | BOOKING_REQUEST | `/tutor/requests` |
| Tutor | SESSION_CONFIRMED | `/tutor/schedule` |
| Student | SESSION_CONFIRMED | `/student/my-sessions` |
| Student | SESSION_REJECTED | `/student/my-sessions` |
| Student | FEEDBACK_REQUEST | `/student/feedback` |

### 6. Test Dropdown UI

1. Click bell icon
2. ✅ **Expected:** Dropdown appears below bell
3. ✅ **Expected:** Dropdown width: ~320px (mobile) or ~384px (desktop)
4. ✅ **Expected:** Max height with scrollbar if > 10 notifications
5. Click outside dropdown
6. ✅ **Expected:** Dropdown closes
7. Click notification
8. ✅ **Expected:** Dropdown closes after navigation

### 7. Test Responsive Design

**Mobile (< 768px):**
1. Resize browser to mobile width
2. ✅ **Expected:** Bell icon still visible
3. ✅ **Expected:** Dropdown adjusts to 320px width
4. ✅ **Expected:** All functionality works

**Desktop:**
1. Resize to desktop width
2. ✅ **Expected:** Dropdown shows at 384px width
3. ✅ **Expected:** Smooth animations

## API Testing (via curl or Postman)

### Get All Notifications
```bash
curl -X GET http://localhost:8000/notifications/ \
  -H "Cookie: session=<your-session-cookie>" \
  --cookie-jar cookies.txt
```

### Mark Single Notification as Read
```bash
curl -X PUT http://localhost:8000/notifications/<notification-id>/read \
  -H "Cookie: session=<your-session-cookie>"
```

### Mark All as Read
```bash
curl -X PUT http://localhost:8000/notifications/mark-all-read \
  -H "Cookie: session=<your-session-cookie>"
```

## Automated Test Checklist

- [ ] Bell icon renders in navbar
- [ ] Badge shows correct unread count
- [ ] Badge animates (pulse)
- [ ] Dropdown opens/closes on click
- [ ] Dropdown closes on outside click
- [ ] Notifications fetch on dropdown open
- [ ] Notification icons match types
- [ ] Notification colors match types
- [ ] Click notification marks as read
- [ ] Click notification navigates correctly
- [ ] "Mark all as read" works
- [ ] Time ago displays correctly (e.g., "15 min ago")
- [ ] Scrolling works for many notifications
- [ ] Loading state displays
- [ ] Empty state displays when no notifications

## Expected Notification Flow

### Student Session Request Flow
```
1. Student → Books session
   ↓
2. Backend → Creates BOOKING_REQUEST notification for Tutor
   ↓
3. Tutor → Sees notification (badge + dropdown)
   ↓
4. Tutor → Confirms session
   ↓
5. Backend → Creates SESSION_CONFIRMED notification for Student
   ↓
6. Student → Sees notification
   ↓
7. Student → Clicks notification → Goes to my-sessions
```

### Cancellation Flow
```
1. User A → Cancels session
   ↓
2. Backend → Creates SESSION_CANCELLED notification for User B
   ↓
3. User B → Sees notification
   ↓
4. User B → Clicks → Goes to sessions page
```

## Common Issues & Solutions

### Issue: Notifications not appearing
**Solution:**
- Check backend is running (`http://localhost:8000`)
- Verify authentication (cookies present)
- Check `/notifications/` API returns data
- Check browser console for errors

### Issue: Badge count incorrect
**Solution:**
- Refresh page
- Check `is_read` field in API response
- Verify filtering logic: `notifications.filter(n => !n.is_read).length`

### Issue: Navigation not working
**Solution:**
- Check routes exist in app
- Verify `router.push()` paths are correct
- Check user role detection (tutor vs student)

### Issue: Dropdown position wrong
**Solution:**
- Check `relative` positioning on parent div
- Verify `absolute right-0` on dropdown
- Check z-index (should be 50)

## Performance Testing

### Load Test
1. Create 100+ notifications for a user
2. Open dropdown
3. ✅ **Expected:** Loads within 1-2 seconds
4. ✅ **Expected:** Smooth scrolling
5. ✅ **Expected:** Only shows first 10

### Memory Test
1. Open/close dropdown multiple times
2. ✅ **Expected:** No memory leaks
3. ✅ **Expected:** Event listeners cleaned up properly

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Accessibility Testing

- [ ] Bell button has aria-label
- [ ] Keyboard navigation works
- [ ] Screen reader announces unread count
- [ ] High contrast mode works
- [ ] Focus visible on bell button

## Success Criteria

✅ All notifications display correctly
✅ Badge shows accurate unread count
✅ Mark as read functionality works
✅ Navigation works for all notification types
✅ Dropdown UX is smooth and responsive
✅ No console errors
✅ Works on mobile and desktop
✅ API integration works correctly

---

**Test completed on:** [Date]
**Tested by:** [Name]
**Results:** PASS / FAIL
**Notes:** [Any issues or observations]
