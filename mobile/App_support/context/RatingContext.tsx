import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import * as FileSystem from "expo-file-system/legacy";
import socket from "@/Services/socket";
import { useAuth } from "@/hooks/useAuth";
import nuevoService from "@/Services/nuevoService";

interface PendingRating {
  ticketId: number;
  ticketSubject: string;
  techs: any[];
}

interface RatingContextType {
  pendingRating: PendingRating | null;
  submitRating: (score: number, comment: string) => Promise<void>;
  skipRating: () => void;
}

const RatingContext = createContext<RatingContextType>({
  pendingRating: null,
  submitRating: async () => {},
  skipRating: () => {},
});

const RATING_FILE = `${FileSystem.documentDirectory}pending_rating.json`;

export const RatingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth();
  const customerId = state.user?.customer_id;
  const [pendingRating, setPendingRating] = useState<PendingRating | null>(
    null,
  );

  // Ref para que submitRating sea siempre estable (sin depender de pendingRating en deps)
  const pendingRatingRef = useRef<PendingRating | null>(null);
  pendingRatingRef.current = pendingRating;

  useEffect(() => {
    if (!customerId) {
      setPendingRating(null);
      return;
    }
    FileSystem.getInfoAsync(RATING_FILE).then((info) => {
      if (info.exists) {
        FileSystem.readAsStringAsync(RATING_FILE).then((content) => {
          try {
            setPendingRating(JSON.parse(content));
          } catch {}
        });
      }
    });
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    const event = `rating_request_${customerId}`;

    const handle = (data: PendingRating) => {
      setPendingRating(data);
      FileSystem.writeAsStringAsync(RATING_FILE, JSON.stringify(data)).catch(
        () => {},
      );
    };

    socket.on(event, handle);
    return () => {
      socket.off(event, handle);
    };
  }, [customerId]);

  const submitRating = useCallback(async (score: number, comment: string) => {
    const rating = pendingRatingRef.current;
    if (!rating) return;
    await nuevoService.submitRating(rating.ticketId, score, comment);
    setPendingRating(null);
    FileSystem.deleteAsync(RATING_FILE, { idempotent: true }).catch(() => {});
  }, []);

  const skipRating = useCallback(() => {
    setPendingRating(null);
  }, []);

  const contextValue = useMemo(
    () => ({ pendingRating, submitRating, skipRating }),
    [pendingRating, submitRating, skipRating],
  );

  return (
    <RatingContext.Provider value={contextValue}>
      {children}
    </RatingContext.Provider>
  );
};

export const useRating = () => useContext(RatingContext);
