
import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatMessage, ChatSettings, defaultSettings, ImageData } from "@/types/chat";
import { openAIService } from "@/lib/openai-service";
import { toast } from "@/components/ui/use-toast";

// Define the context type
interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  settings: ChatSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  sendMessage: (content: string) => Promise<void>;
  isProcessing: boolean;
  clearChat: () => void;
  downloadImage: (image: ImageData) => void;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Create a provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("chatSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
    }

    // Load chat history
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string dates back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("chatSettings", JSON.stringify(settings));
  }, [settings]);

  // Save messages to localStorage when they change
  useEffect(() => {
    // Only save non-loading messages
    const messagesToSave = messages.filter(msg => !msg.isLoading);
    localStorage.setItem("chatHistory", JSON.stringify(messagesToSave));
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

  const downloadImage = (image: ImageData) => {
    if (!image.url) return;
    
    // Create a temporary anchor element
    const anchor = document.createElement("a");
    anchor.href = image.url;
    anchor.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Create a placeholder for the assistant's response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    // Add messages to the state
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsProcessing(true);

    try {
      // Check if this is an image generation request
      const isImageRequest = content.startsWith("/image");
      
      if (isImageRequest) {
        // Extract the image prompt
        const imagePrompt = content.replace("/image", "").trim();
        
        // Generate the image
        const imageUrl = await openAIService.generateImage({
          prompt: imagePrompt,
          size: settings.imageSize,
          style: settings.imageStyle,
          quality: settings.imageQuality,
        });

        if (imageUrl) {
          // Update the assistant message with the image
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? {
                    ...msg,
                    content: "Here's the image you requested:",
                    isLoading: false,
                    image: {
                      url: imageUrl,
                      prompt: imagePrompt,
                      size: settings.imageSize,
                      style: settings.imageStyle,
                    },
                  }
                : msg
            )
          );
        } else {
          // Handle error
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? {
                    ...msg,
                    content: "I couldn't generate that image. Please try a different prompt.",
                    isLoading: false,
                  }
                : msg
            )
          );
        }
      } else {
        // Prepare messages for the API (excluding system messages and loading ones)
        const apiMessages = messages
          .filter(msg => !msg.isLoading)
          .map(msg => ({ role: msg.role, content: msg.content }));
          
        // Add the new user message
        apiMessages.push({ role: "user", content });
        
        // Get response from OpenAI
        const response = await openAIService.generateChatResponse(apiMessages);
        
        if (response) {
          // Update the assistant message with the response
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? {
                    ...msg,
                    content: response.content,
                    isLoading: false,
                  }
                : msg
            )
          );
        } else {
          // Handle error
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? {
                    ...msg,
                    content: "I couldn't generate a response. Please try again.",
                    isLoading: false,
                  }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Update the assistant message with the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? {
                ...msg,
                content: "An error occurred. Please try again.",
                isLoading: false,
              }
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      setMessages, 
      settings, 
      setSettings, 
      sendMessage, 
      isProcessing,
      clearChat,
      downloadImage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

// Create a hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
