
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ImageGenerationParams {
  prompt: string;
  size?: string;
  style?: string;
  quality?: string;
}

export class OpenAIService {
  public async generateImage(params: ImageGenerationParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke("openai", {
        body: {
          action: "image",
          data: {
            prompt: params.prompt,
            size: params.size || "1024x1024",
            style: params.style || "vivid",
            quality: params.quality || "standard",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.imageUrl || null;
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
    try {
      const { data, error } = await supabase.functions.invoke("openai", {
        body: {
          action: "chat",
          data: {
            messages,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.response || null;
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
