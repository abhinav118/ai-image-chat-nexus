
export type MessageRole = "user" | "assistant" | "system";

export interface ImageData {
  url: string;
  prompt: string;
  size: string;
  style: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  dataUrl: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  image?: ImageData;
  attachment?: FileAttachment;
}

export interface ChatSettings {
  imageSize: string;
  imageStyle: string;
  imageQuality: string;
}

export const defaultSettings: ChatSettings = {
  imageSize: "1024x1024",
  imageStyle: "vivid",
  imageQuality: "standard",
};
