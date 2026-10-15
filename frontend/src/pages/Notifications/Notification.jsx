import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CarFront, CheckCheck, Heart, RefreshCw, Trash2, Wrench } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { deleteNotification, getNotifications, markNotificationsRead } from "../../Services/adminServices";
import "./Notification.css";

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try { setNotifications(await getNotifications()); }
    catch (requestError) { setError(requestError.message); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    setBusyId(id || "all");
    setError("");
    try {
      await markNotificationsRead(id);
      setNotifications((items) => items.map((item) => !id || item.id === id ? { ...item, isRead: true } : item));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  const remove = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await deleteNotification(id);
      setNotifications((items) => items.filter((item) => item.id !== id));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <>
      <Navbar />
      <main className="notifications-page">
        <div className="notifications-container">
          <header className="notifications-header">
            <button className="notifications-back-button" type="button" onClick={() => navigate("/profile")}><ArrowLeft size={17} aria-hidden="true" /> Back to profile</button>
            <div className="notifications-title-row">
              <div><span className="notifications-eyebrow">YOUR ACCOUNT</span><h1>Notifications</h1><p>Updates about your bookings and service requests.</p></div>
              <div className="notifications-title-icon" aria-hidden="true"><Bell size={30} /></div>
            </div>
            <div className="notifications-toolbar">
              <span className="notifications-count"><Bell size={16} aria-hidden="true" /> {unreadCount} unread · {notifications.length} total</span>
              <div className="notifications-toolbar-actions">
                <button className="mark-read-button" type="button" onClick={() => markRead("")} disabled={!unreadCount || Boolean(busyId)}><CheckCheck size={16} /> Mark all read</button>
                <button className="notifications-refresh-button" type="button" onClick={load} disabled={isLoading} aria-label="Refresh notifications"><RefreshCw size={16} /></button>
              </div>
            </div>
          </header>

          {error && <p className="notifications-error" role="alert">{error}</p>}
          {isLoading ? <p className="notifications-loading" role="status">Loading notifications…</p> : notifications.length === 0 ? (
            <section className="notifications-empty">
              <div className="notifications-empty-icon" aria-hidden="true"><CarFront size={36} /></div>
              <h2>No notifications yet</h2>
              <p>Booking and service updates will appear here.</p>
              <button className="notifications-home-button" type="button" onClick={() => navigate("/cars")}>Explore cars</button>
            </section>
          ) : (
            <section className="notifications-list" aria-label="Your notifications">
              {notifications.map((item) => {
                const TypeIcon = item.type === "service" ? Wrench : item.type === "favorite" ? Heart : CarFront;
                return (
                  <article className={`notification-card ${item.isRead ? "" : "unread"}`} key={item.id}>
                    <div className={`notification-icon ${item.type || "booking"}`} aria-hidden="true"><TypeIcon size={21} /></div>
                    <div className="notification-content">
                      <div className="notification-top"><h2>{item.title}</h2>{!item.isRead && <span className="unread-dot" aria-label="Unread" />}</div>
                      <p>{item.message}</p>
                      <span className="notification-time">{formatTime(item.createdAt)}</span>
                      <button type="button" className="notification-open-link" onClick={() => navigate(item.href || "/my-bookings")}>Open update</button>
                    </div>
                    <div className="notification-actions">
                      {!item.isRead && <button className="notification-mark-button" type="button" disabled={busyId === item.id} onClick={() => markRead(item.id)} aria-label={`Mark ${item.title} read`}>Mark read</button>}
                      <button className="notification-delete" type="button" disabled={busyId === item.id} onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`} title="Delete notification"><Trash2 size={17} /></button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default Notification;
