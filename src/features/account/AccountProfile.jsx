import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/common/context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Camera, Edit3 } from 'lucide-react';

const AccountProfile = () => {
  const { currentUser, showNotification } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    photoURL: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // Set data from auth immediately (no loading state)
    const name = currentUser.displayName || 'User';
    const nameParts = name.split(' ');
    
    const initialData = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      photoURL: currentUser.photoURL || `https://placehold.co/80x80/eef2ff/4f46e5?text=${name.charAt(0).toUpperCase()}`
    };

    setUserData(initialData);
    setProfilePicPreview(initialData.photoURL);
    setIsLoading(false);

    // Fetch from Firestore in background (optional enhancement)
    let isMounted = true;
    const fetchFirestoreData = async () => {
      if (!db || !currentUser.uid) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && isMounted) {
          const dbData = userDoc.data();
          const updatedData = { ...initialData };
          
          if (dbData?.name) {
            const dbNameParts = dbData.name.split(' ');
            updatedData.firstName = dbNameParts[0] || '';
            updatedData.lastName = dbNameParts.slice(1).join(' ') || '';
          }
          if (dbData?.photoURL) {
            updatedData.photoURL = dbData.photoURL;
          }
          
          setUserData(updatedData);
          setProfilePicPreview(updatedData.photoURL);
        }
      } catch (dbError) {
        console.warn("Error fetching from Firestore:", dbError);
      }
    };

    fetchFirestoreData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showNotification('User not authenticated.', 'error');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let newPhotoURL = userData.photoURL;
      
      // Upload photo if changed
      if (profilePicFile) {
        try {
          const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
          const snapshot = await uploadBytes(storageRef, profilePicFile);
          newPhotoURL = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          showNotification('Failed to upload photo. Please try again.', 'error');
          setIsSaving(false);
          return;
        }
      }
      
      const newFullName = `${userData.firstName.trim()} ${userData.lastName.trim()}`.trim();
      
      if (!newFullName) {
        showNotification('Please enter a valid name.', 'error');
        setIsSaving(false);
        return;
      }
      
      // Update Firebase Auth profile
      try {
        await updateProfile(currentUser, {
          displayName: newFullName,
          photoURL: newPhotoURL
        });
      } catch (authError) {
        console.error("Auth update error:", authError);
        showNotification('Failed to update auth profile.', 'error');
        setIsSaving(false);
        return;
      }
      
      // Update Firestore
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, {
          name: newFullName,
          photoURL: newPhotoURL,
          email: currentUser.email
        }, { merge: true });
      } catch (firestoreError) {
        console.error("Firestore update error:", firestoreError);
        showNotification('Profile updated in auth but failed to save to database.', 'error');
        setIsSaving(false);
        return;
      }
      
      // Update local state
      setUserData(prev => ({...prev, photoURL: newPhotoURL}));
      setProfilePicFile(null);
      
      showNotification('Profile updated successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error("Unexpected error updating profile: ", error);
      showNotification('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setProfilePicPreview(userData.photoURL);
    setProfilePicFile(null);
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-slate-200"></div>
            <div className="flex-1">
              <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="sm:col-span-2 h-10 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        Please log in to view your profile.
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
      <form onSubmit={handleSave}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img id="profile-pic-preview" className="w-20 h-20 rounded-full object-cover" src={profilePicPreview} alt="Profile" />
              {isEditMode && (
                <label htmlFor="profile-pic" className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 border border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <input type="file" id="profile-pic" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{`${userData.firstName} ${userData.lastName}`.trim() || currentUser.displayName || 'User'}</h1>
              <p className="text-sm text-slate-500">{currentUser.email}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2 w-full sm:w-auto">
            {!isEditMode ? (
              <button type="button" onClick={() => setIsEditMode(true)} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2 w-full sm:w-auto">
                <button type="button" onClick={handleCancel} className="w-1/2 sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="w-1/2 sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" id="firstName" value={userData.firstName} onChange={e => setUserData({...userData, firstName: e.target.value})} className="form-input w-full p-2 border border-gray-300 rounded-md" disabled={!isEditMode} />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" id="lastName" value={userData.lastName} onChange={e => setUserData({...userData, lastName: e.target.value})} className="form-input w-full p-2 border border-gray-300 rounded-md" disabled={!isEditMode} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" id="email" value={currentUser.email} className="form-input w-full bg-slate-100 cursor-not-allowed p-2 border border-gray-300 rounded-md" readOnly disabled />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccountProfile;