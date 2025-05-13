
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";

const ChatInterface: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [responseMode, setResponseMode] = useState("auto");
  const [showBackground, setShowBackground] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use a small timeout to ensure layout is complete
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Show background with slight delay for nice fade in
  useEffect(() => {
    setShowBackground(true);
  }, []);

  return (
    <div className="relative h-screen flex flex-col">
      {showBackground && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none opacity-5 bg-gradient-to-br from-purple-50 via-blue-50 to-primary-50"
        >
          {/* Static background gradient instead of canvas effect */}
        </motion.div>
      )}

      <div className="flex flex-col h-full p-4 md:p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-border/30">
          <div>
            <h1 className="text-xl font-semibold">AI Image Chat</h1>
            <p className="text-sm text-muted-foreground">Chat with AI to create stunning ad creatives</p>
          </div>
          <div>
            <Select value={responseMode} onValueChange={setResponseMode}>
              <SelectTrigger className="w-[160px] h-8 text-sm bg-background/80">
                <SelectValue placeholder="Response Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="visual-first">Visual-First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <ScrollArea 
          ref={scrollAreaRef} 
          className="flex-1 mb-4 pr-2 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md bg-background/50 p-6 rounded-xl border border-border/20 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Welcome to AI Image Chat</h2>
                <p className="text-muted-foreground mb-4">
                  Chat with AI and generate images using the "/image" command or by using the Prompt Assistant.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-left">
                    <p className="font-medium mb-1">Tip</p>
                    <p>Try using the Prompt Assistant panel on the right to craft the perfect prompt for your creative.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-border/30 pt-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
