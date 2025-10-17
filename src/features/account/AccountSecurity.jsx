import React, { useState } from 'react';
import { useAuth } from '../../components/common/context/AuthContext';
import { auth, db, storage } from '../../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { AlertTriangle } from 'lucide-react';

const AccountSecurity = () => {
  const { currentUser, showNotification, logout } = useAuth();
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // State for account deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword.length < 8) {
      showNotification('New password must be at least 8 characters long.', 'error');
      return;
    }

    setIsPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      showNotification('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error("Error updating password:", error);
      const message = error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
        ? 'Incorrect current password.'
        : 'Error updating password. Please try again.';
      showNotification(message, 'error');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmText('');
    setDeletePassword('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !currentUser) return;
    
    setIsDeleting(true);
    try {
      // Re-authenticate before deletion for security
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);

      // 1. Delete Firestore document
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          const userData = userDoc.data();
          // 2. Delete profile picture from Storage if it exists
          if (userData.photoURL && userData.photoURL.includes('firebasestorage')) {
              try {
                  const photoRef = ref(storage, userData.photoURL);
                  await deleteObject(photoRef);
              } catch (storageError) {
                  // Ignore if file doesn't exist, but log other errors
                  if (storageError.code !== 'storage/object-not-found') {
                      console.warn("Could not delete profile picture:", storageError);
                  }
              }
          }
          await deleteDoc(userDocRef);
      }
      
      // 3. Delete the user account
      await deleteUser(currentUser);
      
      showNotification('Account deleted successfully.');
      closeDeleteModal();
      // The logout will be handled by the auth state listener, but we can force it
      setTimeout(() => logout(), 500); 

    } catch (error) {
      console.error("Error deleting account:", error);
      const message = error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
        ? 'Incorrect password. Please verify to delete your account.'
        : 'Failed to delete account. Please sign in again and retry.';
      showNotification(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="account-panel bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-slate-200" style={{ fontFamily: "'Work Sans', sans-serif" }}>Security</h2>
        
        <form onSubmit={handlePasswordChange} className="py-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-1">Change Password</h3>
          <p className="text-sm text-slate-500 mb-4 font-sans">For your security, you will need to enter your current password to make this change.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Current Password</label>
              <input type="password" id="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required autoComplete="current-password" />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1 font-sans">New Password</label>
              <input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required autoComplete="new-password" />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" disabled={isPasswordSaving} className="flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
              {isPasswordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        <div className="pt-6">
          <h3 className="font-semibold text-red-800 mb-1">Delete Account</h3>
          <p className="text-sm text-slate-500 mb-4 font-sans">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button onClick={openDeleteModal} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Delete My Account</button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Work Sans', sans-serif"}}>Delete account</h3>
                  <p className="text-sm text-slate-500 mt-2 font-sans">Are you sure? All data will be permanently removed. This action cannot be undone.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700 font-sans">To confirm, please enter your password and type "DELETE" below:</label>
                <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Enter your password" className="w-full p-2 border border-gray-300 rounded-md" />
                <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" autoComplete="off" />
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 rounded-b-xl">
              <button onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmText !== 'DELETE' || !deletePassword} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
              <button onClick={closeDeleteModal} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSecurity;

