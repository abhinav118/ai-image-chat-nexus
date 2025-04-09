
import { toast } from "@/components/ui/use-toast";
import OpenAI from "openai";

export interface ImageGenerationParams {
  prompt: string;
  size?: string;
  style?: string;
  quality?: string;
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from the backend
    });
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public async generateImage(params: ImageGenerationParams): Promise<string | null> {
    if (!this.openai) {
      toast({
        title: "API Key Missing",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: params.prompt,
        n: 1,
        size: (params.size || "1024x1024") as any,
        style: (params.style || "vivid") as any,
        quality: (params.quality || "standard") as any,
      });

      return response.data[0]?.url || null;
    } catch (error: any) {
      console.error("Error generating image:", error);
      
      toast({
        title: "Image Generation Failed",
        description: error.message || "An error occurred while generating the image.",
        variant: "destructive",
      });
      
      return null;
    }
  }

  public async generateChatResponse(messages: any[]): Promise<any> {
    if (!this.openai) {
      toast({
        title: "API Key Missing",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message;
    } catch (error: any) {
      console.error("Error generating chat response:", error);
      
      toast({
        title: "Chat Response Failed",
        description: error.message || "An error occurred while generating the response.",
        variant: "destructive",
      });
      
      return null;
    }
  }
}

// Create a singleton instance
export const openAIService = new OpenAIService();
