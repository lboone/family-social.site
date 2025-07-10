"use client";
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

  useEffect(() => {
    const clientPersistor = persistStore(store);
    setPersistor(clientPersistor);
  }, []);

  if (!persistor) {
    return null; // or a loading spinner
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
export default ClientProvider;
