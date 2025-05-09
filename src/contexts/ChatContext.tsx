import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatMessage, ChatSettings, defaultSettings, ImageData, FileAttachment } from "@/types/chat";
import { openAIService } from "@/lib/openai-service";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper function to safely convert Json to specific types
const safeJsonToType = <T,>(value: Json | undefined, fallback: T): T => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as unknown as T;
  }
  
  return fallback;
};

// Helper function to convert JSON to ChatMessage[]
const convertJsonToChatMessages = (jsonMessages: Json): ChatMessage[] => {
  if (!jsonMessages) return [];
  
  try {
    // If it's already an array, try to convert it
    if (Array.isArray(jsonMessages)) {
      return jsonMessages.map(msg => {
        if (typeof msg === 'object' && msg !== null && 'timestamp' in msg) {
          // Create the base message object
          const chatMessage: ChatMessage = {
            id: String(msg.id || ''),
            role: String(msg.role || 'user') as ChatMessage['role'],
            content: String(msg.content || ''),
            timestamp: new Date(String(msg.timestamp)),
            isLoading: Boolean(msg.isLoading || false),
          };
          
          // Only add image if it exists
          if ('image' in msg && msg.image) {
            const imgData = msg.image as Json;
            if (typeof imgData === 'object' && !Array.isArray(imgData)) {
              chatMessage.image = {
                url: String(imgData.url || ''),
                prompt: String(imgData.prompt || ''),
                size: String(imgData.size || ''),
                style: String(imgData.style || '')
              };
            }
          }
          
          // Only add attachment if it exists
          if ('attachment' in msg && msg.attachment) {
            const attachData = msg.attachment as Json;
            if (typeof attachData === 'object' && !Array.isArray(attachData)) {
              chatMessage.attachment = {
                name: String(attachData.name || ''),
                type: String(attachData.type || ''),
                dataUrl: String(attachData.dataUrl || '')
              };
            }
          }
          
          return chatMessage;
        }
        return null;
      }).filter(Boolean) as ChatMessage[];
    }
    // If it's a string, try to parse it
    else if (typeof jsonMessages === 'string') {
      const parsed = JSON.parse(jsonMessages);
      if (Array.isArray(parsed)) {
        return parsed.map(msg => {
          if (typeof msg === 'object' && msg !== null && 'timestamp' in msg) {
            // Create the base message object
            const chatMessage: ChatMessage = {
              id: String(msg.id || ''),
              role: String(msg.role || 'user') as ChatMessage['role'],
              content: String(msg.content || ''),
              timestamp: new Date(String(msg.timestamp)),
              isLoading: Boolean(msg.isLoading || false),
            };
            
            // Only add image if it exists
            if ('image' in msg && msg.image) {
              const imgData = msg.image as any;
              chatMessage.image = {
                url: String(imgData.url || ''),
                prompt: String(imgData.prompt || ''),
                size: String(imgData.size || ''),
                style: String(imgData.style || '')
              };
            }
            
            // Only add attachment if it exists
            if ('attachment' in msg && msg.attachment) {
              const attachData = msg.attachment as any;
              chatMessage.attachment = {
                name: String(attachData.name || ''),
                type: String(attachData.type || ''),
                dataUrl: String(attachData.dataUrl || '')
              };
            }
            
            return chatMessage;
          }
          return null;
        }).filter(Boolean) as ChatMessage[];
      }
    }
  } catch (error) {
    console.error('Error converting JSON to ChatMessages:', error);
  }
  
  return [];
};

// Helper function to convert ChatMessage[] to JSON compatible format
const convertChatMessagesToJson = (messages: ChatMessage[]): any => {
  return messages.map(msg => {
    // Create a plain object with only the properties we need to store
    const jsonMsg: Record<string, any> = {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    };
    
    // Add optional properties only if they exist
    if (msg.isLoading) {
      jsonMsg.isLoading = msg.isLoading;
    }
    
    if (msg.image) {
      jsonMsg.image = {
        url: msg.image.url,
        prompt: msg.image.prompt,
        size: msg.image.size,
        style: msg.image.style
      };
    }
    
    if (msg.attachment) {
      jsonMsg.attachment = {
        name: msg.attachment.name,
        type: msg.attachment.type,
        dataUrl: msg.attachment.dataUrl
      };
    }
    
    return jsonMsg;
  });
};

// Create a provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [chatHistoryId, setChatHistoryId] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        loadChatHistory(session.user.id);
      }
    };
    
    fetchSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          loadChatHistory(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setMessages([]);
          setChatHistoryId(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("chatSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("chatSettings", JSON.stringify(settings));
  }, [settings]);

  // Load chat history from Supabase
  const loadChatHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_chat_history')
        .select('id, messages')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setChatHistoryId(data[0].id);
        
        // Convert JSON messages to ChatMessage[] using helper function
        const chatMessages = convertJsonToChatMessages(data[0].messages);
        setMessages(chatMessages);
      } else {
        // Create new chat history
        createNewChatHistory(userId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };
  
  const createNewChatHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_chat_history')
        .insert({ user_id: userId })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating chat history:', error);
        return;
      }
      
      setChatHistoryId(data.id);
    } catch (error) {
      console.error('Error creating chat history:', error);
    }
  };
  
  // Save messages to Supabase when they change
  useEffect(() => {
    const saveMessagesToSupabase = async () => {
      if (!user || !chatHistoryId || messages.length === 0) return;
      
      try {
        // Filter out loading messages
        const messagesToSave = messages.filter(msg => !msg.isLoading);
        
        // Convert ChatMessage[] to JSON compatible format
        const jsonMessages = convertChatMessagesToJson(messagesToSave);
        
        const { error } = await supabase
          .from('user_chat_history')
          .update({ messages: jsonMessages })
          .eq('id', chatHistoryId);
        
        if (error) {
          console.error('Error saving chat history:', error);
        }
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    };
    
    saveMessagesToSupabase();
  }, [messages, user, chatHistoryId]);

  const clearChat = async () => {
    setMessages([]);
    
    if (user && chatHistoryId) {
      try {
        const { error } = await supabase
          .from('user_chat_history')
          .update({ messages: [] })
          .eq('id', chatHistoryId);
        
        if (error) {
          console.error('Error clearing chat history:', error);
        }
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
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

  // Save generated image to Supabase
  const saveGeneratedImage = async (imageUrl: string, prompt: string, size: string, style: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_generated_images')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt,
          size,
          style,
        });
      
      if (error) {
        console.error('Error saving generated image:', error);
      }
    } catch (error) {
      console.error('Error saving generated image:', error);
    }
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
          if (file && file.type.startsWith('image/') && 
              (content.includes("reference image") || content.includes("edited with reference"))) {
            // Use the image edit API when a file is provided and it's a reference-based edit
            console.log("Using image edit API with reference image");
            imageUrl = await openAIService.editImage({
              image: file,
              prompt: imagePrompt,
              size: settings.imageSize
            });
          } else {
            // Standard image generation
            console.log("Using standard image generation API");
            imageUrl = await openAIService.generateImage({
              prompt: imagePrompt,
              size: settings.imageSize,
              style: settings.imageStyle,
              quality: settings.imageQuality,
            });
          }
        }

        if (imageUrl) {
          // Save generated image to Supabase
          if (user) {
            saveGeneratedImage(imageUrl, imagePrompt, settings.imageSize, settings.imageStyle);
          }
          
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

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
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
      downloadImage,
      user,
      signIn,
      signUp,
      signOut
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
