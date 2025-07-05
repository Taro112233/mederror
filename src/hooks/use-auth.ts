import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  position: string;
  organizationId: string;
  organizationName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setError('Unauthorized');
        }
      } catch {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
  };
} 