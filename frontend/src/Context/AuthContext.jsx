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
  startLoginSessionApi,
  verifyLoginSessionApi,
  resendLoginOtpApi,
} from "../Apis/authApi";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { getAuthErrorMessage } from "./authErrors";
import i18n from "../i18n";
import { clearTranslationDelayNotice } from "../helper/useTweetTranslations";

const AuthContext = createContext(null);
const fallbackAvatar =
  "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400";

// A Chrome login waits here for the email OTP. sessionStorage keeps it across a page refresh.
const PENDING_KEY = "twitter-pending-login";
const readPending = () => {
  try {
    const value = JSON.parse(sessionStorage.getItem(PENDING_KEY));
    return value?.sessionId ? value : null;
  } catch {
    return null;
  }
};
const clearPending = () => sessionStorage.removeItem(PENDING_KEY);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [isLoading, setIsLoading] = useState(true),
    [isAuthReady, setIsAuthReady] = useState(false),
    [pendingLogin, setPendingLogin] = useState(null); // { sessionId, maskedEmail } while the OTP is pending

  // True while login()/signup()/googlesignin() run, so onAuthStateChanged doesn't log the user in early.
   const loginInProgress = useRef(false);
  const googleCallId = useRef(0); // lets a newer Google popup ignore a stale, cancelled one

  const save = (data) => {
    setUser(data);
    localStorage.setItem("twitter-user", JSON.stringify(data));
    // The language saved on the backend wins after login.
    if (data?.language && data.language !== i18n.language) {
      i18n.changeLanguage(data.language);
    }
  };

  useEffect(() => {
    if (!auth) {
      try {
        setUser(JSON.parse(localStorage.getItem("twitter-user")));
      } catch {
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
      setIsAuthReady(true);
      return undefined;
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (loginInProgress.current) return; // the login flow below decides what happens next
      try {
        if (firebaseUser?.email) {
          const pending = readPending();
          if (pending) {
            // Refreshed in the middle of the OTP step: stay locked until the code is verified.
            setUser(null);
            setPendingLogin(pending);
          } else {
            save(await getLoggedInUser(firebaseUser.email));
          }
        } else {
          setUser(null);
          setPendingLogin(null);
          clearPending();
          localStorage.removeItem("twitter-user");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setIsLoading(false);
        setIsAuthReady(true);
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

  // Runs after Firebase sign-in succeeds (email/password, signup and Google all use it).
  // 1. loadProfile makes sure the user exists in our database.
  // 2. The backend records the device and decides: blocked (mobile outside the window),
  //    OTP needed (Chrome), or straight in (Edge and other browsers).
  const finishSignIn = async (loadProfile) => {
    try {
      const profile = await loadProfile();
      const session = await startLoginSessionApi();
      if (session.requiresOtp) {
        const pending = {
          sessionId: session.sessionId,
          maskedEmail: session.maskedEmail,
        };
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
        setPendingLogin(pending);
        return; // user stays null, so the app stays locked
      }
      clearPending();
      setPendingLogin(null);
      clearTranslationDelayNotice();
      save(profile);
    } catch (err) {
      const data = err?.response?.data;
      toast.error(
        data?.message ||
          data?.error ||
          "Couldn't complete sign-in. Please try again.",
      );
      clearPending();
      setPendingLogin(null);
      if (auth) await signOut(auth).catch(() => {}); // blocked or failed: don't leave a Firebase session behind
      throw err;
    }
  };

  const login = async (email, password) => {
    requireAuth();
    setIsLoading(true);
    loginInProgress.current = true;
    try {
      const c = await signInWithEmailAndPassword(auth, email, password);
      await finishSignIn(() => getLoggedInUser(c.user.email));
    } catch (err) {
      // finishSignIn already toasted its own errors; only Firebase errors are toasted here.
      if (err?.code?.startsWith("auth/")) {
        toast.error(getAuthErrorMessage(err));
      }
      throw err;
    } finally {
      loginInProgress.current = false;
      setIsLoading(false);
    }
  };

  const signup = async (email, password, username, displayName) => {
    requireAuth();
    setIsLoading(true);
    loginInProgress.current = true;
    try {
      const c = await createUserWithEmailAndPassword(auth, email, password);
      await finishSignIn(() =>
        registerUser({
          username,
          displayName,
          avatar: c.user.photoURL || fallbackAvatar,
          email: c.user.email,
        }),
      );
    } catch (err) {
      if (err?.code?.startsWith("auth/")) {
        toast.error(getAuthErrorMessage(err));
      }
      throw err;
    } finally {
      loginInProgress.current = false;
      setIsLoading(false);
    }
  };

    const googlesignin = async () => {
    requireAuth();
    const myCall = ++googleCallId.current;
    setIsLoading(true);
    loginInProgress.current = true;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" }); // always show the account chooser
      const c = await signInWithPopup(auth, provider);
      await finishSignIn(async () => {
        try {
          return await getLoggedInUser(c.user.email);
        } catch {
          return registerUser({
            username: c.user.email.split("@")[0],
            displayName: c.user.displayName || "User",
            avatar: c.user.photoURL || fallbackAvatar,
            email: c.user.email,
          });
        }
      });
    } catch (err) {
      const quiet = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
      if (err?.code?.startsWith("auth/") && !quiet.includes(err.code)) {
        toast.error(getAuthErrorMessage(err));
      }
      throw err;
    } finally {
      // Only the newest popup may reset these, so a cancelled one can't break the current login.
      if (googleCallId.current === myCall) {
        loginInProgress.current = false;
        setIsLoading(false);
      }
    }
  };
  // Called by the OTP screen. Errors are thrown so the screen can show the backend message.
  const verifyLoginOtp = async (code) => {
    if (!pendingLogin) throw new Error("No login is waiting for verification.");
    await verifyLoginSessionApi(pendingLogin.sessionId, code);
    const profile = await getLoggedInUser(auth.currentUser.email);
    clearPending();
    setPendingLogin(null);
    save(profile);
  };

  const resendLoginOtp = async () => {
    if (!pendingLogin) throw new Error("No login is waiting for verification.");
    await resendLoginOtpApi(pendingLogin.sessionId);
  };

  // "Use a different account" on the OTP screen.
   const cancelLoginVerification = async () => {
    googleCallId.current += 1; // forget any popup that is still pending
    loginInProgress.current = false;
    setIsLoading(false);
    clearPending();
    setPendingLogin(null);
    if (auth) await signOut(auth);
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
    setPendingLogin(null);
    clearPending();
    clearTranslationDelayNotice();
    localStorage.removeItem("twitter-user");
    if (auth) await signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthReady,
      pendingLogin,
      login,
      signup,
      googlesignin,
      updateProfile,
      logout,
      sendPhoneOtp,
      verifyPhoneOtp,
      cancelPhoneFlow,
      verifyLoginOtp,
      resendLoginOtp,
      cancelLoginVerification,
    }),
    [user, isLoading, isAuthReady, pendingLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
};
