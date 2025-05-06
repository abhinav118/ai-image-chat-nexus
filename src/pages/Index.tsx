
import React from "react";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Clock, Plus } from "lucide-react";
import ToolPanel from "@/components/ToolPanel";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <ChatProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* History Sidebar */}
          <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">AI Image Chat</h2>
                <SidebarMenuButton asChild size="sm">
                  <button className="bg-primary/10 text-primary hover:bg-primary/20">
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </button>
                </SidebarMenuButton>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>History</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Clock className="h-4 w-4" />
                      <span>Fashion Ad Campaign</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Clock className="h-4 w-4" />
                      <span>Product Showcase</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Clock className="h-4 w-4" />
                      <span>Website Banner Design</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main Chat Area */}
          <main className="flex-1 relative overflow-hidden">
            <div className="h-screen flex flex-col">
              <ChatInterface />
            </div>
          </main>

          {/* Tool Panel */}
          <ToolPanel />
          <Toaster />
        </div>
      </ChatProvider>
    </SidebarProvider>
  );
};

export default Index;
