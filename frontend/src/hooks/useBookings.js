import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getMyBookings } from "../Services/bookingServices";

export function useBookings() {
  const { user, isLoading: authLoading } = useAuth();
  const [result, setResult] = useState({ userId: null, bookings: [], isLoading: false, error: "" });

  useEffect(() => {
    let active = true;
    if (authLoading || !user) return () => { active = false; };
    getMyBookings()
      .then((items) => {
        if (active) {
          setResult({ userId: user.id, bookings: items, isLoading: false, error: "" });
        }
      })
      .catch((requestError) => {
        if (active) setResult({ userId: user.id, bookings: [], isLoading: false, error: requestError.message });
      });

    return () => { active = false; };
  }, [user, authLoading]);

  const belongsToCurrentUser = result.userId === user?.id;
  return {
    bookings: belongsToCurrentUser ? result.bookings : [],
    isLoading: authLoading || Boolean(user && !belongsToCurrentUser),
    error: belongsToCurrentUser ? result.error : "",
  };
}
