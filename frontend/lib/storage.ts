// Custom storage that safely handles SSR
const createPersistStorage = () => {
  // Check if we're on the client side
  const isServer = typeof window === "undefined";

  if (isServer) {
    // Return noop storage for server-side rendering
    return {
      getItem(): Promise<string | null> {
        return Promise.resolve(null);
      },
      setItem(_key: string, value: string): Promise<string> {
        return Promise.resolve(value);
      },
      removeItem(): Promise<void> {
        return Promise.resolve();
      },
    };
  }

  // Return localStorage for client-side
  // Dynamic import to avoid SSR issues
  if (typeof window !== "undefined" && window.localStorage) {
    return {
      getItem(key: string): Promise<string | null> {
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem(key: string, value: string): Promise<string> {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve(value);
        } catch {
          return Promise.resolve(value);
        }
      },
      removeItem(key: string): Promise<void> {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  }

  // Fallback to noop storage if localStorage is not available
  return {
    getItem(): Promise<string | null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string): Promise<string> {
      return Promise.resolve(value);
    },
    removeItem(): Promise<void> {
      return Promise.resolve();
    },
  };
};

const storage = createPersistStorage();

export default storage;
