// This script now relies on nav.js to provide Firebase instances.

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
    let currentUser = null;
    let originalUserData = {};
    let firebaseInstances = null;

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
    
    const changeProfileBtn = document.getElementById('change-profile-btn');
    const editModeButtons = document.getElementById('edit-mode-buttons');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const allFormInputs = [firstNameInput, lastNameInput, usernameInput, profilePicInput];

    const passwordForm = document.getElementById('password-form');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteConfirmInput = document.getElementById('delete-confirm-input');
    
    // Tab switching logic
    const accountNav = document.getElementById('account-nav');
    const navLinks = accountNav.querySelectorAll('.nav-link');
    const contentPanels = document.querySelectorAll('.account-panel');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            contentPanels.forEach(panel => {
                panel.classList.toggle('hidden', panel.id !== targetId);
            });
        });
    });


    const firebaseCheckInterval = setInterval(() => {
        if (window.firebaseInstances) {
            clearInterval(firebaseCheckInterval);
            firebaseInstances = window.firebaseInstances;
            const { auth, onAuthStateChanged } = firebaseInstances;

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    currentUser = user;
                    loadUserData();
                } else {
                    window.location.href = 'index.html';
                }
            });
        }
    }, 100); 
    
    async function loadUserData() {
        if (!currentUser) return;
        const { db, doc, getDoc } = firebaseInstances;
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            populateForm(currentUser, userDoc.data());
        } else {
            populateForm(currentUser, {});
        }
    }

    function populateForm(user, userData) {
        originalUserData = { ...userData }; 
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

    function toggleButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        if(!button) return;
        button.disabled = isLoading;
        if (isLoading) {
            if(btnText) btnText.style.display = 'none';
            if(spinner) spinner.classList.remove('hidden');
        } else {
            if(btnText) btnText.style.display = '';
            if(spinner) spinner.classList.add('hidden');
        }
    }

    // --- EVENT LISTENERS (Attached Once) ---

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
        populateForm(currentUser, originalUserData);
        setFormState(false);
        showNotification('Changes discarded');
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || !firebaseInstances) return;
        toggleButtonLoading(saveProfileBtn, true);

        const { storage, ref, uploadBytes, getDownloadURL, updateProfile, db, doc, setDoc } = firebaseInstances;

        try {
            let photoURL = originalUserData.photoURL || currentUser.photoURL;
            const file = profilePicInput.files[0];
            
            if (file) {
                const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
                const snapshot = await uploadBytes(storageRef, file);
                photoURL = await getDownloadURL(snapshot.ref);
            }
            
            const newFullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim();

            await updateProfile(currentUser, {
                displayName: newFullName,
                photoURL: photoURL || null
            });
            
            const updatedData = {
                ...originalUserData,
                name: newFullName,
                username: usernameInput.value.trim(),
                photoURL: photoURL || null
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

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || !firebaseInstances) return;
        const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = firebaseInstances;

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        if (newPassword.length < 8) {
             showNotification('New password must be at least 8 characters long.', false);
             return;
        }

        toggleButtonLoading(savePasswordBtn, true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            showNotification('Password updated successfully!');
            passwordForm.reset();
        } catch (error) {
            console.error("Error updating password: ", error);
            let message = 'Error updating password. Please try again.';
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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

    confirmDeleteBtn.addEventListener('click', async () => {
        if (deleteConfirmInput.value !== 'DELETE' || !currentUser || !firebaseInstances) return;
        
        toggleButtonLoading(confirmDeleteBtn, true);
        const { db, doc, deleteDoc, storage, ref, deleteObject, deleteUser } = firebaseInstances;

        try {
            await deleteDoc(doc(db, "users", currentUser.uid));
            
            if (originalUserData.photoURL) {
                try {
                    const photoRef = ref(storage, originalUserData.photoURL);
                    await deleteObject(photoRef);
                } catch (error) {
                    // Ignore errors if file doesn't exist (e.g., already deleted)
                    if (error.code !== 'storage/object-not-found') {
                        console.warn("Could not delete profile pic.", error);
                    }
                }
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

    lucide.createIcons();
});

