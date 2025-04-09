
import React from "react";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container max-w-4xl mx-auto py-6">
          <div className="rounded-lg border border-border shadow-md overflow-hidden h-[calc(100vh-4rem)]">
            <ChatInterface />
          </div>
        </main>
        <Toaster />
      </div>
    </ChatProvider>
  );
};

export default Index;
