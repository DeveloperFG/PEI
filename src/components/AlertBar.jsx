import { useEffect, useState } from "react";
import "./alertBar.css";

export default function AlertBar({ message, type = "info", duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`alert-bar ${type}`}>
      <span>{message}</span>
      <div className="progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
}