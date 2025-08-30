import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// --- Toast Notification Function ---
function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    const bgColor = isSuccess ? 'bg-indigo-600' : 'bg-red-500';
    notification.className = `fixed bottom-5 right-5 ${bgColor} text-white py-3 px-5 rounded-lg shadow-lg transform transition-all duration-300 translate-y-16 opacity-0 z-[10001]`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-y-16', 'opacity-0');
    }, 100);

    setTimeout(() => {
        notification.classList.add('translate-y-16', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Profile Elements ---
    const profileForm = document.getElementById('profile-form');
    const profilePicInput = document.getElementById('profile-pic');
    const profilePicLabel = document.getElementById('profile-pic-label');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const emailVerifiedStatus = document.getElementById('email-verified-status');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    
    // Buttons for edit/view state
    const changeProfileBtn = document.getElementById('change-profile-btn');
    const editModeButtons = document.getElementById('edit-mode-buttons');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const allFormInputs = [firstNameInput, lastNameInput, usernameInput, profilePicInput];


    // --- Security Elements ---
    const passwordForm = document.getElementById('password-form');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteConfirmInput = document.getElementById('delete-confirm-input');

    let currentUser = null;
    let originalUserData = {};

    function populateForm(user, userData) {
        originalUserData = { ...userData }; // Store original data for cancellation

        const fullName = userData.name || user.displayName || 'CalciPrep User';
        displayName.textContent = fullName;
        displayEmail.textContent = user.email;
        emailInput.value = user.email;

        const nameParts = fullName.split(' ');
        firstNameInput.value = nameParts[0] || '';
        lastNameInput.value = nameParts.slice(1).join(' ') || '';
        
        usernameInput.value = userData.username || '';

        if (userData.photoURL) {
            profilePicPreview.src = userData.photoURL;
        } else {
             profilePicPreview.src = `https://placehold.co/80x80/eef2ff/4f46e5?text=${fullName.charAt(0).toUpperCase()}`;
        }
        
        if (user.emailVerified) {
            emailVerifiedStatus.classList.remove('hidden');
             const verificationDate = user.metadata.lastSignInTime;
            emailVerifiedStatus.querySelector('span').textContent = `VERIFIED ON ${new Date(verificationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
    }

    function setFormState(isEditable) {
        if (isEditable) {
            allFormInputs.forEach(input => input.disabled = false);
            profilePicLabel.classList.remove('profile-pic-label-disabled');
            changeProfileBtn.classList.add('hidden');
            editModeButtons.classList.remove('hidden');
        } else {
            allFormInputs.forEach(input => input.disabled = true);
            profilePicLabel.classList.add('profile-pic-label-disabled');
            changeProfileBtn.classList.remove('hidden');
            editModeButtons.classList.add('hidden');
        }
    }
    
    auth.onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                populateForm(user, userDoc.data());
            } else {
                populateForm(user, {});
            }
        } else {
            window.location.href = 'index.html';
        }
    });

    changeProfileBtn.addEventListener('click', () => {
        setFormState(true);
    });

    profilePicInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePicPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    cancelEditBtn.addEventListener('click', () => {
        populateForm(currentUser, originalUserData); // Discard changes
        setFormState(false);
        showNotification('Changes discarded');
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        toggleButtonLoading(saveProfileBtn, true);

        try {
            let photoURL = originalUserData.photoURL || currentUser.photoURL;
            const file = profilePicInput.files[0];
            
            if (file) {
                const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
                await uploadBytes(storageRef, file);
                photoURL = await getDownloadURL(storageRef);
            }
            
            const newFullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim();

            await updateProfile(currentUser, {
                displayName: newFullName,
                photoURL: photoURL
            });
            
            const updatedData = {
                ...originalUserData,
                name: newFullName,
                username: usernameInput.value.trim(),
                photoURL: photoURL
            };

            await setDoc(doc(db, "users", currentUser.uid), updatedData, { merge: true });

            originalUserData = { ...updatedData };
            displayName.textContent = newFullName;

            showNotification('Profile updated successfully!');
            setFormState(false);

        } catch (error) {
            console.error("Error updating profile: ", error);
            showNotification('Failed to update profile. Please try again.', false);
        } finally {
            toggleButtonLoading(saveProfileBtn, false);
        }
    });

    // --- Security Logic (remains unchanged) ---
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        if (newPassword.length < 8) {
             showNotification('New password must be at least 8 characters long.', false);
             return;
        }

        toggleButtonLoading(savePasswordBtn, true);
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        try {
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            showNotification('Password updated successfully!');
            passwordForm.reset();
        } catch (error) {
            console.error("Error updating password: ", error);
            let message = 'Error updating password. Please try again.';
            if (error.code === 'auth/wrong-password') {
                message = 'Incorrect current password.';
            }
            showNotification(message, false);
        } finally {
            toggleButtonLoading(savePasswordBtn, false);
        }
    });
    
    deleteAccountBtn.addEventListener('click', () => deleteModal.classList.remove('hidden'));
    cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));

    deleteConfirmInput.addEventListener('input', () => {
        if (deleteConfirmInput.value === 'DELETE') {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    confirmDeleteBtn.addEventListener('click', async (e) => {
        if (deleteConfirmInput.value !== 'DELETE' || !currentUser) return;
        
        toggleButtonLoading(confirmDeleteBtn, true);

        try {
            await deleteDoc(doc(db, "users", currentUser.uid));
            
            if (originalUserData.photoURL) {
                const photoRef = ref(storage, `profile_pictures/${currentUser.uid}`);
                await deleteObject(photoRef).catch(err => console.warn("Could not delete profile pic.", err));
            }
            
            await deleteUser(currentUser);
            
            showNotification('Account deleted successfully.');
            setTimeout(() => window.location.href = 'index.html', 2000);

        } catch (error) {
            console.error("Error deleting account:", error);
            showNotification('Failed to delete account. You may need to sign in again to complete this action.', false);
            toggleButtonLoading(confirmDeleteBtn, false);
        }
    });


    function toggleButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        if (isLoading) {
            button.disabled = true;
            if(btnText) btnText.style.display = 'none';
            if(spinner) spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            if(btnText) btnText.style.display = '';
            if(spinner) spinner.classList.add('hidden');
        }
    }

    lucide.createIcons();
});

