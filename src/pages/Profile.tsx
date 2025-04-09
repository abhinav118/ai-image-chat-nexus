
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Star, Image } from "lucide-react";
import { mockCreatives } from "@/data/mockCreatives";

const Profile = () => {
  const favoriteCount = mockCreatives.filter(c => c.isFavorite).length;
  
  return (
    <AppLayout>
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gradient-1-start to-gradient-1-end flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">AK</h3>
                    <p className="text-gray-400">user@example.com</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Member since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>April 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Favorites</span>
                  </div>
                  <p className="text-2xl font-bold">{favoriteCount}</p>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Image className="h-4 w-4 text-gradient-2-start" />
                    <span className="text-sm text-gray-300">Generated</span>
                  </div>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Dark Mode</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Always On</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email Notifications</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Off</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Default Image Size</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">1024x1024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
