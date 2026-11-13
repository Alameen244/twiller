import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getLoggedInUser,
  registerUser,
  updateUser,
  confirmPhoneOtpApi,
  sendPhoneOtpApi,
} from "../Apis/authApi";
import { auth } from "./firebase";

const AuthContext = createContext(null);
const fallbackAvatar =
  "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [isLoading, setIsLoading] = useState(true);

  const save = (data) => {
    setUser(data);
    localStorage.setItem("twitter-user", JSON.stringify(data));
  };

  useEffect(() => {
    if (!auth) {
      try {
        setUser(JSON.parse(localStorage.getItem("twitter-user")));
      } catch {
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
      return undefined;
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
            if (firebaseUser?.email) {
          save(await getLoggedInUser(firebaseUser.email));
        } else {
          setUser(null);
          localStorage.removeItem("twitter-user");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const requireAuth = () => {
    if (!auth)
      throw new Error(
        "Firebase is not configured. Add VITE_FIREBASE_* values to .env.",
      );
  };
  const phoneRef = useRef(null);

  const sendPhoneOtp = async (phoneNumber) => {
    requireAuth();
    if (!auth.currentUser) throw new Error("Please log in first.");
    await sendPhoneOtpApi(phoneNumber);
    phoneRef.current = phoneNumber;
  };

  const verifyPhoneOtp = async (code) => {
    if (!phoneRef.current) throw new Error("Request an OTP first.");
    save(await confirmPhoneOtpApi(phoneRef.current, code));
    phoneRef.current = null;
  };

  const cancelPhoneFlow = () => {
    phoneRef.current = null;
  };

  const login = async (email, password) => {
    requireAuth();
    setIsLoading(true);
    try {
      const c = await signInWithEmailAndPassword(auth, email, password);
      save(await getLoggedInUser(c.user.email));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, username, displayName) => {
    requireAuth();
    setIsLoading(true);
    try {
      const c = await createUserWithEmailAndPassword(auth, email, password);
      save(
        await registerUser({
          username,
          displayName,
          avatar: c.user.photoURL || fallbackAvatar,
          email: c.user.email,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const googlesignin = async () => {
    requireAuth();
    setIsLoading(true);
    try {
      const c = await signInWithPopup(auth, new GoogleAuthProvider());
      let profile;
      try {
        profile = await getLoggedInUser(c.user.email);
      } catch {
        profile = await registerUser({
          username: c.user.email.split("@")[0],
          displayName: c.user.displayName || "User",
          avatar: c.user.photoURL || fallbackAvatar,
          email: c.user.email,
        });
      }
      save(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedUser = await updateUser(user.email, profile);
      save(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("twitter-user");
    if (auth) await signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      googlesignin,
      updateProfile,
      logout,
      sendPhoneOtp,
      verifyPhoneOtp,
      cancelPhoneFlow,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
};
