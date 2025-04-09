
import React, { useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import { motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-effect";

const ChatInterface: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showBackground, setShowBackground] = React.useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setShowBackground(true);
  }, []);

  return (
    <div className="relative h-full flex flex-col">
      {showBackground && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <CanvasRevealEffect
            animationSpeed={0.4}
            containerClassName="bg-transparent opacity-10"
            colors={[
              [155, 135, 245], // Purple
              [249, 115, 22],  // Orange
              [14, 165, 233],  // Blue
            ]}
            opacities={[0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
            dotSize={2}
          />
        </motion.div>
      )}

      <div className="flex flex-col h-full p-4 md:p-6 overflow-hidden">
        <ChatHeader />
        
        <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md">
                <h2 className="text-xl font-bold mb-2">Welcome to AI Image Chat</h2>
                <p className="text-muted-foreground mb-4">
                  Chat with AI and generate images using the "/image" command or by toggling the image mode.
                </p>
                <p className="text-sm text-muted-foreground">
                  Configure your API key and image settings using the gear icon above.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatInterface;
