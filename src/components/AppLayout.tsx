
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Image, Star, User, LogOut, Plus, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Generate", path: "/generate", icon: Plus },
    { name: "Templates", path: "/templates", icon: BookOpen },
    { name: "Favorites", path: "/favorites", icon: Star },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-16 md:w-60 bg-black border-r border-gray-800 flex flex-col">
        <div className="p-4 flex items-center justify-center md:justify-start gap-2 border-b border-gray-800">
          <Image className="h-8 w-8 text-gradient-1-start" />
          <span className="hidden md:block font-bold text-xl">AdCreative</span>
        </div>
        
        <div className="flex-1 py-8">
          <nav className="space-y-2 px-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 w-full p-2 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-gradient-to-r from-gradient-1-start to-gradient-1-end text-white"
                    : "text-gray-400 hover:bg-gray-800"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="hidden md:block">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* User section */}
        <div className="mt-auto border-t border-gray-800 p-4">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => navigate("/profile")}
              className={cn(
                "flex items-center gap-2 w-full p-2 rounded-lg transition-colors",
                isActive("/profile")
                  ? "bg-gradient-to-r from-gradient-1-start to-gradient-1-end text-white"
                  : "text-gray-400 hover:bg-gray-800"
              )}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              <div className="hidden md:block text-left">
                <p className="font-medium">{user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : "Guest"}</p>
                <p className="text-xs text-gray-400">View profile</p>
              </div>
            </button>
            
            {user && (
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-2 w-full p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="hidden md:block">Sign out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
