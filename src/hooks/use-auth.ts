import { useState, useEffect } from "react";

interface User {
  id: string;
  accountId: string;
  username: string;
  role: string;
  name: string;
  position: string;
  phone: string;
  organizationId: string;
  organizationName: string;
  onboarded: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } else if (response.status === 401) {
        // ลอง refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // ลอง fetch user อีกครั้ง
          const retryResponse = await fetch('/api/users/me');
          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            setUser(userData);
            setError(null);
          } else {
            setError('Session expired');
            setUser(null);
          }
        } else {
          setError('Session expired');
          setUser(null);
        }
      } else {
        setError('Failed to fetch user data');
        setUser(null);
      }
    } catch {
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Auto refresh token ทุก 1.5 ชั่วโมง (90 นาที)
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          
          if (!response.ok) {
            // ถ้า refresh ไม่สำเร็จ ให้ logout
            setUser(null);
            setError('Session expired');
          }
        } catch (error) {
          console.error('Auto refresh failed:', error);
        }
      }, 50 * 60 * 1000); // 50 นาที

      return () => clearInterval(interval);
    }
  }, [user]);

  // Activity tracking - อัปเดต activity ทุก 5 นาที
  useEffect(() => {
    if (user) {
      const activityInterval = setInterval(async () => {
        try {
          await fetch('/api/users/me', {
            credentials: 'include',
          });
        } catch (error) {
          console.error('Activity tracking failed:', error);
        }
      }, 5 * 60 * 1000); // 5 นาที

      return () => clearInterval(activityInterval);
    }
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';
  const isDeveloper = user?.role === 'DEVELOPER';
  const isAdminOrDeveloper = isAdmin || isDeveloper;
  const isUser = user?.role === 'USER';
  const isUnapproved = user?.role === 'UNAPPROVED';

  return {
    user,
    loading,
    error,
    isAdmin,
    isDeveloper,
    isAdminOrDeveloper,
    isUser,
    isUnapproved,
    refetch: fetchUser,
  };
} 