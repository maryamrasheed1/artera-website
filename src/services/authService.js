import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; // Added serverTimestamp
import { auth, db } from "../firebase";

// Register
export const registerUser = async (name, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra info to Firestore using serverTimestamp for accurate system time
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: serverTimestamp(), 
      avatarURL: "",
      bio: "",
    });

    return { uid: user.uid, name, email, role };
  } catch (error) {
    console.error("Registration error:", error);
    throw error; // Propagate to component to show error alert/message
  }
};

// Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get extra info from Firestore
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }

    throw new Error("User profile not found in database.");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Listen to auth state
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);