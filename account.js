import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const profilePicInput = document.getElementById('profile-pic');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const messageContainer = document.getElementById('message-container');

    let currentUser = null;

    auth.onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;
            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                nameInput.value = userData.name || '';
                phoneInput.value = userData.phone || '';
                if (userData.photoURL) {
                    profilePicPreview.src = userData.photoURL;
                }
            }
        } else {
            window.location.href = 'index.html';
        }
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

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        let photoURL = currentUser.photoURL;
        const file = profilePicInput.files[0];
        if (file) {
            const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            photoURL = await getDownloadURL(storageRef);
        }

        await updateProfile(currentUser, {
            displayName: nameInput.value,
            photoURL: photoURL
        });

        await setDoc(doc(db, "users", currentUser.uid), {
            name: nameInput.value,
            phone: phoneInput.value,
            photoURL: photoURL
        }, { merge: true });

        showMessage('Profile updated successfully!', 'success');
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        try {
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            showMessage('Password updated successfully!', 'success');
            passwordForm.reset();
        } catch (error) {
            showMessage('Error updating password. Please check your current password.', 'error');
        }
    });

    function showMessage(message, type) {
        messageContainer.innerHTML = `<div class="p-4 rounded-md ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${message}</div>`;
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 3000);
    }
});
