import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ArrowLeft,
  CheckCircle,
  CalendarCheck,
  Heart,
  Tag,
  CarFront,
  Trash2,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";

import "./Notification.css";

const initialNotifications = [
  {
    id: 1,
    type: "booking",
    title: "Booking Confirmed",
    message: "Your car booking has been successfully confirmed.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    type: "favorite",
    title: "Car Added to Favorites",
    message: "A car has been successfully added to your favorites.",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: 3,
    type: "offer",
    title: "New Car Available",
    message: "A new car matching your interests is now available.",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 4,
    type: "service",
    title: "Service Reminder",
    message: "Your scheduled car service is coming up soon.",
    time: "2 days ago",
    unread: false,
  },
];

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previousNotifications) =>
      previousNotifications.filter(
        (notification) => notification.id !== id
      )
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking":
        return <CalendarCheck size={21} />;

      case "favorite":
        return <Heart size={21} />;

      case "offer":
        return <Tag size={21} />;

      case "service":
        return <CarFront size={21} />;

      default:
        return <Bell size={21} />;
    }
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <>
      <Navbar />

      <main className="notifications-page">
        <div className="notifications-container">

          {/* HEADER */}

          <section className="notifications-header">

            <button
              className="notifications-back-button"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>

            <div className="notifications-title-row">

              <div>
                <span className="notifications-eyebrow">
                  UPDATES
                </span>

                <h1>
                  Your <span>Notifications</span>
                </h1>

                <p>
                  Stay updated with your bookings, favorites,
                  services and car activity.
                </p>
              </div>

              <div className="notifications-title-icon">
                <Bell size={30} />
              </div>

            </div>

            <div className="notifications-toolbar">

              <div className="notifications-count">
                <Bell size={16} />

                <span>
                  {unreadCount} unread
                </span>
              </div>

              {unreadCount > 0 && (
                <button
                  className="mark-read-button"
                  onClick={markAllAsRead}
                >
                  <CheckCircle size={16} />
                  Mark all as read
                </button>
              )}

            </div>

          </section>

          {/* NOTIFICATIONS */}

          {notifications.length === 0 ? (
            <section className="notifications-empty">

              <div className="notifications-empty-icon">
                <Bell size={42} />
              </div>

              <h2>
                No notifications
              </h2>

              <p>
                You're all caught up. New updates will appear here.
              </p>

              <button
                className="notifications-home-button"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>

            </section>
          ) : (
            <section className="notifications-list">

              {notifications.map((notification) => (

                <article
                  className={`notification-card ${
                    notification.unread ? "unread" : ""
                  }`}
                  key={notification.id}
                >

                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div className="notification-content">

                    <div className="notification-top">

                      <h2>
                        {notification.title}
                      </h2>

                      {notification.unread && (
                        <span className="unread-dot"></span>
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="notification-time">
                      {notification.time}
                    </span>

                  </div>

                  <button
                    className="notification-delete"
                    onClick={() =>
                      deleteNotification(notification.id)
                    }
                    aria-label="Delete notification"
                    title="Delete notification"
                  >
                    <Trash2 size={18} />
                  </button>

                </article>

              ))}

            </section>
          )}

        </div>
      </main>
    </>
  );
};

export default Notifications;