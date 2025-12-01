"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { NotificationResponse, NotificationType } from "@/types/notification";
import { formatTimeAgo } from "@/lib/dateUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Notification icon mapping
const notificationIcons: Record<NotificationType, string> = {
  [NotificationType.BOOKING_REQUEST]: "📬",
  [NotificationType.SESSION_CONFIRMED]: "✅",
  [NotificationType.SESSION_REJECTED]: "❌",
  [NotificationType.SESSION_CANCELLED]: "🚫",
  [NotificationType.REMINDER]: "⏰",
  [NotificationType.FEEDBACK_REQUEST]: "💬",
};

// Notification color mapping
const notificationColors: Record<NotificationType, string> = {
  [NotificationType.BOOKING_REQUEST]: "bg-blue-50 border-blue-200",
  [NotificationType.SESSION_CONFIRMED]: "bg-green-50 border-green-200",
  [NotificationType.SESSION_REJECTED]: "bg-red-50 border-red-200",
  [NotificationType.SESSION_CANCELLED]: "bg-orange-50 border-orange-200",
  [NotificationType.REMINDER]: "bg-yellow-50 border-yellow-200",
  [NotificationType.FEEDBACK_REQUEST]: "bg-purple-50 border-purple-200",
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/`, {
        credentials: "include",
      });

      if (response.ok) {
        const data: NotificationResponse[] = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when dropdown opens
  useEffect(() => {
    loadNotifications();
  }, []);

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark notification as read and navigate
  const handleNotificationClick = async (notification: NotificationResponse) => {
    try {
      // Mark as read if unread
      if (!notification.is_read) {
        await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
          method: "PUT",
          credentials: "include",
        });
        
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      }

      setIsOpen(false);

      // Navigate based on notification type and session_id
      if (notification.session_id) {
        switch (notification.type) {
          case NotificationType.BOOKING_REQUEST:
            // Tutor receives this -> go to requests page
            router.push("/tutor/requests");
            break;
            
          case NotificationType.SESSION_CONFIRMED:
            // Could be student or tutor -> check current path
            if (window.location.pathname.startsWith("/tutor")) {
              router.push("/tutor/schedule");
            } else {
              router.push("/student/my-sessions");
            }
            break;
            
          case NotificationType.SESSION_CANCELLED:
          case NotificationType.SESSION_REJECTED:
            // Navigate to sessions list
            if (window.location.pathname.startsWith("/tutor")) {
              router.push("/tutor/schedule");
            } else {
              router.push("/student/my-sessions");
            }
            break;
            
          case NotificationType.REMINDER:
            // Navigate to today's sessions
            if (window.location.pathname.startsWith("/tutor")) {
              router.push("/tutor/sessions-today");
            } else {
              router.push("/student/my-sessions");
            }
            break;
            
          case NotificationType.FEEDBACK_REQUEST:
            // Navigate to feedback page
            router.push("/student/feedback");
            break;
            
          default:
            // Generic fallback
            if (window.location.pathname.startsWith("/tutor")) {
              router.push("/tutor/dashboard");
            } else {
              router.push("/student/find-tutor");
            }
            break;
        }
      }

    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayNotifications = notifications.slice(0, 10); // Show latest 10

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-black/10 z-50 max-h-[32rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between bg-soft-white-blue">
            <h3 className="text-sm font-semibold text-dark-blue">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-light-heavy-blue hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-light-blue"></div>
                <p className="text-xs text-black/50 mt-2">Loading...</p>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-black/50">No notifications yet</p>
                <p className="text-xs text-black/40 mt-1">
                  You&apos;ll be notified about session updates here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {displayNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left hover:bg-soft-white-blue/50 transition ${
                      !notification.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg border ${
                          notificationColors[notification.type]
                        }`}
                      >
                        {notificationIcons[notification.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              notification.is_read ? "text-black/70" : "text-dark-blue font-semibold"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-black/60 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-black/40 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="px-4 py-2 border-t border-black/5 text-center">
              <p className="text-xs text-black/50">
                Showing {displayNotifications.length} of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
