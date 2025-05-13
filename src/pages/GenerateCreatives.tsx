
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";
import PromptAssistant from "@/components/PromptAssistant";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, UtensilsCrossed } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      {user ? (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Button>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

const UserInfo = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <User className="h-4 w-4" />
      <span>{user.email}</span>
    </div>
  );
};

const GenerateCreatives = () => {
  return (
    <AppLayout>
      <ChatProvider>
        <div className="h-full flex flex-col">
          {/* Auth section */}
          <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between">
            <UserInfo />
            <AuthButton />
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Main content area (center pane) */}
            <div className="flex-1 bg-background border-r border-border/30">
              <ChatInterface />
            </div>
            
            {/* Right sidebar - Prompt Assistant */}
            <div className="w-80 flex flex-col h-full">
              <PromptAssistant />
            </div>
          </div>
        </div>
      </ChatProvider>
    </AppLayout>
  );
};

export default GenerateCreatives;
