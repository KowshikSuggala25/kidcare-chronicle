import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const currentTime = new Date();
      const newUserProfile: User = {
        id: user.uid,
        email: user.email!,
        displayName: userData.displayName || "",
        phoneNumber: userData.phoneNumber || "",
        role: userData.role || "parent",
        createdAt: currentTime,
        updatedAt: currentTime,
        passwordChangedAt: currentTime,
        ...userData,
      };

      await setDoc(doc(db, "users", user.uid), newUserProfile);
      setUserProfile(newUserProfile);
    } catch (error: any) {
      // Firebase error code mapping
      switch (error.code) {
        case "auth/email-already-in-use":
          alert("This email is already registered. Please log in.");
          break;
        case "auth/invalid-email":
          alert("Invalid email format.");
          break;
        case "auth/weak-password":
          alert("Password is too weak. Use at least 6 characters.");
          break;
        default:
          alert(error.message || "Something went wrong. Please try again.");
          console.error("Signup Error:", error);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null); // Clear local state
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as User);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};