"use client";

import { ServiceWorkerDebugWrapper } from "@/components/ServiceWorkerDebug";
import { Settings, X } from "lucide-react";
import { useState } from "react";

export default function ServiceWorkerDebugToggle() {
  const [isDebugVisible, setIsDebugVisible] = useState(false);

  const toggleDebug = () => {
    setIsDebugVisible(!isDebugVisible);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleDebug}
        className={`
          fixed bottom-4 right-4 z-50
          w-12 h-12 rounded-full
          bg-blue-600 hover:bg-blue-700
          text-white shadow-lg hover:shadow-xl
          transition-all duration-200 ease-in-out
          flex items-center justify-center
          border-2 border-white
          ${isDebugVisible ? "bg-red-600 hover:bg-red-700" : ""}
        `}
        title={isDebugVisible ? "Hide Debug Panel" : "Show Debug Panel"}
        aria-label={isDebugVisible ? "Hide Debug Panel" : "Show Debug Panel"}
      >
        {isDebugVisible ? (
          <X className="w-5 h-5" />
        ) : (
          <Settings className="w-5 h-5" />
        )}
      </button>

      {/* Debug Panel - Only render when visible */}
      {isDebugVisible && (
        <div className="fixed bottom-20 right-4 z-40">
          <ServiceWorkerDebugWrapper />
        </div>
      )}
    </>
  );
}
