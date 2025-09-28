"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import io from "socket.io-client";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

import styles from "@/styles/AdminNotifications.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminNotifications() {
  const { user, token } = useAuth(); // ✅ hook inside component
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [targetUser, setTargetUser] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetMethod, setTargetMethod] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return; // wait until token is loaded
    fetchInitial();

    socketRef.current = io(API_URL, {
      transports: ["websocket"],
      auth: { token }, // optional: send token with socket handshake
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", { role: "admin", userId: user?._id });
    });

    socketRef.current.on("notification:admin", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socketRef.current.on("notification:deleted", ({ id }) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);

      const usersRes = await axios.get(`${API_URL}/api/users/admin-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load notifications or users");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Title and message required");
    try {
      const payload = {
        title,
        message,
        userId: targetUser || null,
        email: email || null,
        orderStatus: orderStatus || null,
        type,
        link: link || null,
      };

      await axios.post(`${API_URL}/api/notifications`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle("");
      setMessage("");
      setTargetUser("");
      setType("info");
      setLink("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send notification");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete notification");
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2 className={styles.title}>Admin Notifications</h2>

        <form onSubmit={handleSend} className={styles.form}>
          {/* Title + Message */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={styles.input}
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className={styles.textarea}
            required
          />

          {/* Choose targeting method */}
          <select
            value={targetMethod}
            onChange={(e) => setTargetMethod(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">— Select Target Audience —</option>
            <option value="all">All Users</option>
            <option value="user">Specific User</option>
            <option value="email">By Email</option>
            <option value="orderStatus">By Order Status</option>
          </select>

          {/* Conditionally render inputs */}
          {targetMethod === "user" && (
            <select
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className={styles.select}
            >
              <option value="">— Choose User —</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          )}

          {targetMethod === "email" && (
            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          )}

          {targetMethod === "orderStatus" && (
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className={styles.select}
            >
              <option value="">— Select Order Status —</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          )}

          {/* Type + Link + Send */}
          <div className={styles.row}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={styles.select}
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Optional link"
              className={styles.input}
            />

            <button type="submit" className={styles.sendBtn}>
              Send
            </button>
          </div>
        </form>

        <div className={styles.list}>
          <h3>Recent Notifications</h3>
          {loading ? <p>Loading...</p> : null}
          {notifications.length === 0 && <p>No notifications yet</p>}
          <ul>
            {notifications.map((n) => (
              <li key={n._id} className={styles.item}>
                <div>
                  <div className={styles.meta}>
                    <strong>{n.title}</strong>
                    <span
                      className={`${styles.typeBadge} ${
                        styles[`type-${n.type}`]
                      }`}
                    >
                      {n.type}
                    </span>
                    <small className={styles.time}>
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className={styles.message}>{n.message}</div>
                  {n.link &&
                    (n.link.startsWith("http") ? (
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        Open
                      </a>
                    ) : (
                      <Link href={n.link} className={styles.link}>
                        Open
                      </Link>
                    ))}
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleDelete(n._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
