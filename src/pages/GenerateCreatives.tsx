
import React from "react";
import AppLayout from "@/components/AppLayout";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";
import ToolPanel from "@/components/ToolPanel";

const GenerateCreatives = () => {
  return (
    <AppLayout>
      <ChatProvider>
        <div className="h-full flex">
          <div className="flex-1 p-6 max-w-screen-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Generate Ad Creatives</h1>
              <p className="text-gray-400">Use AI to create custom ad creatives</p>
            </div>
            
            <div className="h-[calc(100vh-12rem)] rounded-lg border border-gray-800 shadow-lg overflow-hidden">
              <ChatInterface />
            </div>
          </div>
          
          {/* Right Tool Panel */}
          <ToolPanel />
        </div>
      </ChatProvider>
    </AppLayout>
  );
};

export default GenerateCreatives;
