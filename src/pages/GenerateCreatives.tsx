
import React from "react";
import AppLayout from "@/components/AppLayout";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";
import PromptAssistant from "@/components/PromptAssistant";

const GenerateCreatives = () => {
  return (
    <AppLayout>
      <ChatProvider>
        <div className="h-full flex">
          {/* Main content area (center pane) */}
          <div className="flex-1 bg-background border-r border-border/30">
            <ChatInterface />
          </div>
          
          {/* Right sidebar - Prompt Assistant */}
          <div className="w-80 flex flex-col h-screen">
            <PromptAssistant />
          </div>
        </div>
      </ChatProvider>
    </AppLayout>
  );
};

export default GenerateCreatives;
