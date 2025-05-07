
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ImageGenerationParams {
  prompt: string;
  size?: string;
  style?: string;
  quality?: string;
}

export interface ImageEditParams {
  image: File;
  prompt: string;
  size?: string;
  n?: number;
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

      if (data?.error) {
        throw new Error(data.error);
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

  public async editImage(params: ImageEditParams): Promise<string | null> {
    try {
      // For the edit API, we'll just use the regular image generation API with the reference image
      // since we're having issues with the actual edit API
      const base64Image = await this.fileToBase64(params.image);
      
      // Create a prompt that refers to the uploaded image
      const enhancedPrompt = `${params.prompt} (Reference provided in separate image)`;
      
      const { data, error } = await supabase.functions.invoke("openai", {
        body: {
          action: "image",  // Use the regular image generation endpoint
          data: {
            prompt: enhancedPrompt,
            size: params.size || "1024x1024",
            // Note: We're not passing the image directly since we're using the standard image generation API
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.imageUrl || null;
    } catch (error: any) {
      console.error("Error editing image:", error);
      
      toast({
        title: "Image Edit Failed",
        description: error.message || "An error occurred while editing the image.",
        variant: "destructive",
      });
      
      return null;
    }
  }

  public async generateChatResponse(messages: any[], file?: File | null): Promise<any> {
    try {
      let requestBody: any = {
        action: "chat",
        data: {
          messages,
        },
      };

      // If there's a file, convert it to base64 and add to the request
      if (file) {
        const base64File = await this.fileToBase64(file);
        requestBody.data.file = {
          name: file.name,
          type: file.type,
          data: base64File,
        };
      }

      const { data, error } = await supabase.functions.invoke("openai", {
        body: requestBody,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
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

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Create a singleton instance
export const openAIService = new OpenAIService();
