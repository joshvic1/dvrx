// components/HeaderWithBell.js
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HeaderWithBell({ user }) {
  const [count, setCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // fetch initial unread count
    const loadCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notifications/count`); // implement this route
        setCount(res.data.count);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) loadCount();

    // connect socket and join personal room
    socketRef.current = io(API_URL);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", { userId: user._id, role: user.role });
    });

    socketRef.current.on("notification", (notif) => {
      // increment unread count and optionally add to dropdown list shown on UI
      setCount((c) => c + 1);
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  return (
    <div style={{ position: "relative" }}>
      <button className="bell">
        🔔
        {count > 0 && <span className="badge">{count}</span>}
      </button>
    </div>
  );
}
