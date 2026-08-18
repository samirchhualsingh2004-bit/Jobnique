import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import axios from "../api/axios"; // Adjust path to your axios instance

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const fetchNotifications = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const { data } = await axios.get("/notifications", {
        withCredentials: true,
      });
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Initial fetch and polling every 30 seconds
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate the panel's position relative to the bell button
  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const panelWidth = isMobile ? 320 : 384; // w-80 / sm:w-96
      let left = rect.right - panelWidth;

      // Keep it on-screen on narrow viewports
      if (left < 8) left = 8;
      const maxLeft = window.innerWidth - panelWidth - 8;
      if (left > maxLeft) left = maxLeft;

      setCoords({
        top: rect.bottom + 10,
        left,
        width: panelWidth,
      });
    }
  }, []);

  const toggleOpen = () => {
    if (!isOpen) updateCoords();
    setIsOpen((prev) => !prev);
  };

  // Keep the panel glued to the bell on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedButton = buttonRef.current && buttonRef.current.contains(event.target);
      const clickedPanel = panelRef.current && panelRef.current.contains(event.target);
      if (!clickedButton && !clickedPanel) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`, {}, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read-all", {}, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete("/notifications", {
        withCredentials: true,
      });
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filtered list based on tab selection
  const displayedNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <div className="relative inline-block text-left">
      {/* Bell Button with interactive ring and badge */}
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        aria-label="Toggle notifications"
        className="relative p-2.5 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95"
      >
        <svg
          className="w-6 h-6 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          ></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel — rendered via portal so no ancestor's
          overflow-hidden or z-index can clip or bury it */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className="max-h-[34rem] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-[9999] flex flex-col border border-transparent dark:border-slate-800"
          >
            {/* Header Section */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 sticky top-0 backdrop-blur-md z-10">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-semibold">
                    {unreadCount} unread
                  </span>
                </div>

                {notifications.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                      >
                        Read all
                      </button>
                    )}
                    <span className="text-gray-300 dark:text-slate-600">|</span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Filter Tabs */}
              {notifications.length > 0 && (
                <div className="flex space-x-1 bg-gray-200/60 dark:bg-slate-900/60 p-1 rounded-lg">
                  <button
                    onClick={() => setFilter("all")}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                      filter === "all"
                        ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                      filter === "unread"
                        ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Notification List */}
            <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 max-h-[24rem]">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Loading notifications...</p>
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="py-14 px-4 text-center">
                  <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 dark:text-slate-500 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">No notifications found</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {filter === "unread" ? "You have read all notifications!" : "You're completely caught up."}
                  </p>
                </div>
              ) : (
                displayedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`p-4 transition-all cursor-pointer flex items-start space-x-3 group hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 ${
                      !notif.isRead ? "bg-indigo-50/60 dark:bg-indigo-950/30" : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    {/* Status Indicator Dot */}
                    <div className="pt-1.5 flex-shrink-0">
                      <span
                        className={`block h-2 w-2 rounded-full transition-all ${
                          !notif.isRead
                            ? "bg-indigo-600 dark:bg-indigo-400 scale-110"
                            : "bg-gray-300 dark:bg-slate-600 group-hover:bg-gray-400 dark:group-hover:bg-slate-500"
                        }`}
                      ></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p
                          className={`text-xs ${
                            !notif.isRead
                              ? "font-bold text-gray-900 dark:text-white"
                              : "font-semibold text-gray-700 dark:text-slate-300"
                          }`}
                        >
                          {notif.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 block font-medium">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NotificationDropdown;