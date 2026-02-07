import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    PhoneAuthProvider,
    signInWithPhoneNumber,
    RecaptchaVerifier,
} from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from '../store';

export const authService = {
    /**
     * Sign in with email and password
     */
    signInWithEmail: async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = {
                uid: userCredential.user.uid,
                email: userCredential.user.email || undefined,
                displayName: userCredential.user.displayName || undefined,
                photoURL: userCredential.user.photoURL || undefined,
            };
            useAuthStore.getState().setUser(user);
            return { success: true, user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Sign up with email and password
     */
    signUpWithEmail: async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = {
                uid: userCredential.user.uid,
                email: userCredential.user.email || undefined,
                displayName: userCredential.user.displayName || undefined,
                photoURL: userCredential.user.photoURL || undefined,
            };
            useAuthStore.getState().setUser(user);
            return { success: true, user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Sign in with Google
     * Note: This requires additional setup with @react-native-google-signin/google-signin
     */
    signInWithGoogle: async (idToken: string) => {
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = {
                uid: userCredential.user.uid,
                email: userCredential.user.email || undefined,
                displayName: userCredential.user.displayName || undefined,
                photoURL: userCredential.user.photoURL || undefined,
            };
            useAuthStore.getState().setUser(user);
            return { success: true, user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Sign out
     */
    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            useAuthStore.getState().logout();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get current user
     */
    getCurrentUser: () => {
        return auth.currentUser;
    },
};
