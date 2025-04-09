
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Info } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import ImageSettings from "./ImageSettings";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ChatHeader: React.FC = () => {
  const { clearChat } = useChat();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="flex justify-between items-center mb-4">
      <div className="text-2xl font-bold">
        <span className="text-gradient-1-start">AI</span>
        <span className="text-gradient-2-start">Image</span>
        <span className="text-gradient-3-start">Chat</span>
      </div>
      
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Help & Tips</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        <strong>Getting Started:</strong> Make sure the OPEN_AI_KEY is set in Supabase Edge Function Secrets.
                      </p>
                      <p>
                        <strong>Text Chat:</strong> Just type your message and press enter or click the send button.
                      </p>
                      <p>
                        <strong>Image Generation:</strong> 
                      </p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Click the image icon in the input field or use the "/image" command at the start of your message.</li>
                        <li>Be descriptive in your prompt for better results.</li>
                        <li>Customize image size, style, and quality in the settings.</li>
                        <li>Download generated images with the download button.</li>
                      </ul>
                      <p className="text-sm mt-4">
                        Note: This application requires a valid OpenAI API key with access to GPT-4o and DALL-E 3 models.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction>OK</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>
              Help & Tips
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <ImageSettings />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all messages in this chat. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearChat}>
                      Clear Chat
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>
              Clear Chat
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default ChatHeader;
