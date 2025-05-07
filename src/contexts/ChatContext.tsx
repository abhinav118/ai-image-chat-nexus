
import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatMessage, ChatSettings, defaultSettings, ImageData, FileAttachment } from "@/types/chat";
import { openAIService } from "@/lib/openai-service";
import { toast } from "@/components/ui/use-toast";

// Define the context type
interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  settings: ChatSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  sendMessage: (content: string, file?: File | null, preGeneratedImageUrl?: string | null) => Promise<void>;
  isProcessing: boolean;
  clearChat: () => void;
  downloadImage: (image: ImageData) => void;
}

// Maximum number of messages to keep in localStorage
const MAX_STORED_MESSAGES = 50;

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
    try {
      // Only keep non-loading messages
      const messagesToSave = messages
        .filter(msg => !msg.isLoading)
        // Limit to most recent messages
        .slice(-MAX_STORED_MESSAGES);
      
      localStorage.setItem("chatHistory", JSON.stringify(messagesToSave));
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn("localStorage quota exceeded, clearing older messages");
        
        // Clear localStorage and keep only the most recent messages
        localStorage.clear();
        
        // Try saving only the latest few messages
        const reducedMessages = messages
          .filter(msg => !msg.isLoading)
          .slice(-20);
        
        try {
          localStorage.setItem("chatHistory", JSON.stringify(reducedMessages));
        } catch (innerError) {
          // If still failing, just clear chat history storage
          console.error("Still cannot save to localStorage, disabling chat history storage");
          localStorage.removeItem("chatHistory");
        }
        
        toast({
          title: "Chat history partially cleared",
          description: "Your chat history was getting too large and has been trimmed.",
        });
      } else {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  const downloadImage = (image: ImageData) => {
    if (!image.url) return;
    
    const anchor = document.createElement("a");
    anchor.href = image.url;
    anchor.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const prepareFileAttachment = async (file: File): Promise<FileAttachment> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: file.type,
          dataUrl: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async (content: string, file: File | null = null, preGeneratedImageUrl: string | null = null) => {
    if (!content.trim() && !file && !preGeneratedImageUrl) return;

    let fileAttachment: FileAttachment | undefined;
    
    if (file) {
      fileAttachment = await prepareFileAttachment(file);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      attachment: fileAttachment,
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsProcessing(true);

    try {
      const isImageRequest = content.startsWith("/image") || preGeneratedImageUrl;
      
      if (isImageRequest) {
        const imagePrompt = content.replace("/image", "").trim();
        let imageUrl = preGeneratedImageUrl;
        
        if (!imageUrl) {
          // Only generate if we don't already have a pre-generated URL
          imageUrl = await openAIService.generateImage({
            prompt: imagePrompt,
            size: settings.imageSize,
            style: settings.imageStyle,
            quality: settings.imageQuality,
          });
        }

        if (imageUrl) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? {
                    ...msg,
                    content: "Here's the image you requested:",
                    isLoading: false,
                    image: {
                      url: imageUrl!,
                      prompt: imagePrompt,
                      size: settings.imageSize,
                      style: settings.imageStyle,
                    },
                  }
                : msg
            )
          );
        } else {
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
        const apiMessages = messages
          .filter(msg => !msg.isLoading)
          .map(msg => ({ role: msg.role, content: msg.content }));
          
        apiMessages.push({ role: "user", content });
        
        const response = await openAIService.generateChatResponse(apiMessages, file);
        
        if (response) {
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
