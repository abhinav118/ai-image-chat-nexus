
import React from "react";
import AppLayout from "@/components/AppLayout";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";

const GenerateCreatives = () => {
  return (
    <AppLayout>
      <div className="h-full p-6 max-w-screen-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Generate Ad Creatives</h1>
          <p className="text-gray-400">Use AI to create custom ad creatives</p>
        </div>
        
        <div className="h-[calc(100vh-12rem)] rounded-lg border border-gray-800 shadow-lg overflow-hidden">
          <ChatProvider>
            <ChatInterface />
          </ChatProvider>
        </div>
      </div>
    </AppLayout>
  );
};

export default GenerateCreatives;
