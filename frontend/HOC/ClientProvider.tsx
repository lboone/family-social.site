"use client";
import ServiceWorkerDebugToggle from "@/components/ServiceWorkerDebugToggle";
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";
import store from "@/store/store";
import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Persistor, persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

interface ClientProviderProps {
  children?: ReactNode;
}

const ClientProvider = ({ children }: ClientProviderProps) => {
  const [persistor, setPersistor] = useState<Persistor | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);

    try {
      const clientPersistor = persistStore(store);
      setPersistor(clientPersistor);
    } catch (error) {
      console.error("Error creating persistor:", error);
      // Even if persist fails, we should still render the app
      setPersistor(null);
    }
  }, []);

  // Show nothing during SSR
  if (!isClient) {
    return null;
  }

  // If persistor creation failed, render without persistence
  if (!persistor) {
    return (
      <Provider store={store}>
        <ServiceWorkerProvider />
        {children}
        <ServiceWorkerDebugToggle />
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ServiceWorkerProvider />
        {children}
        <ServiceWorkerDebugToggle />
      </PersistGate>
    </Provider>
  );
};

export default ClientProvider;
