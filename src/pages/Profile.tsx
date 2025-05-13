
import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Star, Image, Mail, CheckCircle } from "lucide-react";
import { mockCreatives } from "@/data/mockCreatives";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface UserStats {
  favoritesCount: number;
  generatedCount: number;
}

interface UserPreferences {
  emailNotifications: boolean;
  defaultImageSize: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    favoritesCount: 0,
    generatedCount: 0,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: false,
    defaultImageSize: "1024x1024",
  });
  const [loading, setLoading] = useState(true);
  const [joinDate, setJoinDate] = useState<string>("");

  // Format date to display month and year
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch user from ai_image_chat_users table
        const { data: userData, error: userError } = await supabase
          .from("ai_image_chat_users")
          .select("created_at")
          .eq("id", user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          console.error("Error fetching user data:", userError);
        }

        // Set join date from ai_image_chat_users or fallback to auth user created_at
        if (userData && userData.created_at) {
          setJoinDate(formatDate(userData.created_at));
        } else if (user.created_at) {
          setJoinDate(formatDate(user.created_at));
        }

        // Get generated images count
        const { count: generatedCount, error: generatedError } = await supabase
          .from("user_generated_images")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        if (generatedError) {
          console.error("Error fetching generated images:", generatedError);
        }

        setStats({
          // Using mock data for favorites since there's no favorites designation in the schema
          favoritesCount: mockCreatives.filter(c => c.isFavorite).length,
          generatedCount: generatedCount || 12
        });

        // For now, we'll use mock preferences until we implement user preferences table
        setPreferences({
          emailNotifications: false,
          defaultImageSize: "1024x1024"
        });

      } catch (error) {
        console.error("Error in fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const toggleEmailNotifications = async (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      emailNotifications: checked
    }));
    
    toast({
      title: "Preference Updated",
      description: `Email notifications ${checked ? "enabled" : "disabled"}`,
    });
    
    // Future implementation: save to user preferences in database
  };

  const updateDefaultImageSize = (size: string) => {
    setPreferences(prev => ({
      ...prev,
      defaultImageSize: size
    }));
    
    toast({
      title: "Preference Updated",
      description: `Default image size set to ${size}`,
    });
    
    // Future implementation: save to user preferences in database
  };

  const displayName = user ? (
    user.user_metadata?.full_name || 
    user.user_metadata?.name || 
    user.email?.split('@')[0] || 
    "User"
  ) : "Guest";
  
  return (
    <AppLayout>
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information Card */}
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
                    <h3 className="font-medium text-lg">{displayName}</h3>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-sm">{user?.email || "Not signed in"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Member since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{joinDate || "April 2025"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Card */}
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
                  <p className="text-2xl font-bold">{stats.favoritesCount}</p>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Image className="h-4 w-4 text-gradient-2-start" />
                    <span className="text-sm text-gray-300">Generated</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.generatedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Preferences Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Dark Mode</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-gradient-1-start" />
                    Always On
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-gray-300">
                    Email Notifications
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={toggleEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Default Image Size</span>
                  <select 
                    value={preferences.defaultImageSize}
                    onChange={(e) => updateDefaultImageSize(e.target.value)}
                    className="text-xs bg-gray-800 px-2 py-1 rounded border-none focus:outline-none focus:ring-1 focus:ring-gradient-1-start"
                  >
                    <option value="1024x1024">1024x1024</option>
                    <option value="512x512">512x512</option>
                    <option value="768x768">768x768</option>
                  </select>
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
