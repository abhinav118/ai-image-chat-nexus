
export type MessageRole = "user" | "assistant" | "system";

export interface ImageData {
  url: string;
  prompt: string;
  size: string;
  style: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  image?: ImageData;
}

export interface ChatSettings {
  apiKey: string;
  imageSize: string;
  imageStyle: string;
  imageQuality: string;
}

export const defaultSettings: ChatSettings = {
  apiKey: "",
  imageSize: "1024x1024",
  imageStyle: "vivid",
  imageQuality: "standard",
};
