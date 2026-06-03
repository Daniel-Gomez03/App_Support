// ============================================
// CONTEXTO: NOTIFICACIONES (NotificationContext)
// Persiste hasta 50 notificaciones en un archivo
// JSON local (expo-file-system). Escucha eventos
// Socket.IO del canal mobile_notification_{id}
// mientras el usuario tenga sesión activa.
// Expone: notifications, unreadCount,
// notificationsEnabled, markAllRead, clearAll.
// ============================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import socket from "@/Services/socket";
import { useAuth } from "@/hooks/useAuth";

export interface AppNotification {
  id: string;
  type:
    | "status_change"
    | "message"
    | "ticket_cancelled"
    | "ticket_finalizado"
    | "cancellation_rejected"
    | "chat_paused";
  ticketId: number;
  ticketSubject: string;
  oldStatusId?: number;
  newStatusId?: number;
  senderName?: string;
  messagePreview?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  markAllRead: () => {},
  clearAll: () => {},
});

const NOTIF_FILE = `${FileSystem.documentDirectory}notifications.json`;
const NOTIF_ENABLED_KEY = "notificationsEnabled";

const readFile = async (): Promise<AppNotification[]> => {
  try {
    const info = await FileSystem.getInfoAsync(NOTIF_FILE);
    if (!info.exists) return [];
    const content = await FileSystem.readAsStringAsync(NOTIF_FILE);
    return JSON.parse(content);
  } catch {
    return [];
  }
};

const writeFile = (notifs: AppNotification[]) => {
  FileSystem.writeAsStringAsync(NOTIF_FILE, JSON.stringify(notifs)).catch(
    () => {},
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth();
  const customerId = state.user?.customer_id;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  // Sincronizado en cada render para que el handler del socket
  // lea el valor actual sin necesidad de re-suscribirse.
  const enabledRef = useRef(true);
  enabledRef.current = notificationsEnabled;

  useEffect(() => {
    SecureStore.getItemAsync(NOTIF_ENABLED_KEY).then((v) => {
      if (v === "false") {
        setNotificationsEnabledState(false);
        enabledRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (!customerId) {
      setNotifications([]);
      return;
    }
    readFile().then(setNotifications);
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    const event = `mobile_notification_${customerId}`;

    const handle = (data: Omit<AppNotification, "id" | "read">) => {
      if (!enabledRef.current) return;
      const notif: AppNotification = {
        ...data,
        id: `${Date.now()}-${Math.random()}`,
        read: false,
      };
      setNotifications((prev) => {
        const updated = [notif, ...prev].slice(0, 50);
        writeFile(updated);
        return updated;
      });
    };

    socket.on(event, handle);
    return () => {
      socket.off(event, handle);
    };
  }, [customerId]);

  const setNotificationsEnabled = useCallback((v: boolean) => {
    setNotificationsEnabledState(v);
    enabledRef.current = v;
    SecureStore.setItemAsync(NOTIF_ENABLED_KEY, v ? "true" : "false");
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      writeFile(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    FileSystem.deleteAsync(NOTIF_FILE, { idempotent: true }).catch(() => {});
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationsEnabled,
        setNotificationsEnabled,
        markAllRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
