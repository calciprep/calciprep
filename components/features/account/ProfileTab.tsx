"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Firebase Auth (No Storage needed)
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";

import { UserService, UserProfile } from "@/services/userService";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { showNotification } = useAuth() as any; 
  const [user, setUser] = useState<User | null>(null);
  
  const [profileData, setProfileData] = useState<Partial<UserProfile & { photoURL?: string }>>({
    displayName: "",
    bio: "",
    photoURL: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 1. Listen for the logged-in user when the component loads
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch the data from Firestore once we have a user
  useEffect(() => {
    async function loadProfile() {
      if (user?.uid) {
        try {
          const data = await UserService.getUserProfile(user.uid);
          if (data) {
            setProfileData({
              ...data,
              photoURL: user.photoURL || "",
            });
          } else {
            await UserService.createUserProfile(user.uid, {
              email: user.email,
              displayName: user.displayName || "",
            });
            setProfileData({
              displayName: user.displayName || "",
              bio: "",
              photoURL: user.photoURL || "",
            });
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
          setMessage("Could not load your profile data.");
        } finally {
          setLoading(false);
        }
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Prevent Image Upload and show notification
  const handleImageClick = () => {
    if (showNotification) {
      showNotification("Profile pictures are synced with your Google account and cannot be changed manually.", "error");
    } else {
      setMessage("Profile pictures are synced with your Google account and cannot be changed manually.");
    }
  };

  // Save text changes back to Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setMessage("");

    try {
      await UserService.updateUserProfile(user.uid, {
        displayName: profileData.displayName || "",
        bio: profileData.bio || "",
      });
      
      // Also update Firebase Auth display name for consistency
      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profileData.displayName });
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Get initial for avatar fallback
  const getInitial = () => {
    if (profileData.displayName) return profileData.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      
      {/* Header & Avatar Display */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl font-extrabold text-slate-500 shadow-sm">
            {profileData.photoURL ? (
              <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitial()
            )}
          </div>
          <button
            type="button"
            onClick={handleImageClick}
            className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors shadow-md"
            title="Change picture"
          >
            <Camera size={16} />
          </button>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {profileData.displayName || "User Profile"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Update your personal details and how they appear to others.
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100"></div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-semibold text-gray-700">
            Display Name
          </label>
          <Input
            id="displayName"
            name="displayName"
            value={profileData.displayName || ""}
            onChange={handleChange}
            placeholder="John Doe"
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
            Bio
          </label>
          <Input
            id="bio"
            name="bio"
            value={profileData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us a little about yourself"
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <Input
            value={user.email || ""}
            disabled
            className="bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400">Email address cannot be changed directly.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${message.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2.5 shadow-sm">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}