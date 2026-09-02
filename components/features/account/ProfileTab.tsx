"use client";

import React, { useState, useEffect } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Fixed: Grabbing Firebase Auth directly since the useAuth hook was missing
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

import { UserService, UserProfile } from "@/services/userService";

export default function ProfileTab() {
  // Store the Firebase user directly
  const [user, setUser] = useState<User | null>(null);
  
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    displayName: "",
    bio: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 1. Listen for the logged-in user when the component loads
  useEffect(() => {
    if (!auth) return; // Safety check in case auth isn't initialized

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false); // Stop loading if no user is found
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // 2. Fetch the data from Firestore once we have a user
  useEffect(() => {
    async function loadProfile() {
      if (user?.uid) {
        try {
          const data = await UserService.getUserProfile(user.uid);
          if (data) {
            setProfileData(data);
          } else {
            // If they don't have a profile document yet, create a blank one
            await UserService.createUserProfile(user.uid, {
              email: user.email,
              displayName: user.displayName || "",
            });
            setProfileData({
              displayName: user.displayName || "",
              bio: "",
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

  // Handle form changes when the user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes back to Firestore
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
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Profile</h3>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal details and how they appear on your dashboard.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
            Display Name
          </label>
          <Input
            id="displayName"
            name="displayName"
            value={profileData.displayName || ""}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium text-gray-700">
            Bio
          </label>
          <Input
            id="bio"
            name="bio"
            value={profileData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us a little about yourself"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}