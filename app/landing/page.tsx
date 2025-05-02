// FULL LANDING PAGE WITH USERNAME VALIDATION AND GREEN CHECK
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaInstagram, FaXTwitter, FaCheck } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showFeatures, setShowFeatures] = useState(false);
  const [earthyIdle, setEarthyIdle] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setEarthyIdle((prev) => !prev), 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const regex = /^[a-z0-9_]{3,20}$/;
    setUsernameValid(regex.test(username));
  }, [username]);

  const features = [
    "Explore trails, cities, and secret places",
    "Meet creators, travelers, and adventurers",
    "Share your journey with the world",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = email.trim();

    if (!input || !password || (activeTab === "signup" && !username)) {
      alert("Please fill in all fields.");
      return;
    }

    if (activeTab === "signup" && !usernameValid) {
      alert("Invalid username. Please follow the format.");
      return;
    }

    try {
      if (activeTab === "signup") {
        if (password !== confirmPassword) {
          alert("Passwords do not match.");
          return;
        }

        const usernameRef = doc(db, "usernames", username);
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
          alert("Username is already taken. Please choose another one.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, input, password);
        if (username) await updateProfile(userCredential.user, { displayName: username });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          username,
          email: input,
          createdAt: new Date(),
        });

        await setDoc(doc(db, "usernames", username), {
          uid: userCredential.user.uid,
          email: input,
        });

        router.push("/feed");
      } else {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        let finalEmail = input;
        if (!input.includes("@")) {
          const usernameDoc = await getDoc(doc(db, "usernames", input));
          if (!usernameDoc.exists()) {
            alert("Username not found.");
            return;
          }
          finalEmail = usernameDoc.data().email;
        }

        const userCredential = await signInWithEmailAndPassword(auth, finalEmail, password);
        router.push("/feed");
      }
    } catch (error: any) {
      console.error("Auth error:", error.message);
      alert(error.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      alert("Password reset email sent!");
      setShowForgotPasswordModal(false);
      setForgotEmail("");
    } catch (error) {
      console.error(error);
      alert("Error sending reset email.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1B1B1B]">
      <main className="flex-1 flex flex-col justify-between px-4 py-4">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 items-start justify-center gap-12 mx-auto">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              className="relative flex-shrink-0 w-[7rem] md:w-[14rem] mb-6 mx-auto"
              initial={{ y: -300, rotate: 0, rotateZ: 0, scale: 1 }}
              animate={{
                y: earthyIdle ? ["4vh", "3vh", "4vh"] : ["-300px", "6vh"],
                rotate: earthyIdle ? 0 : [0, 0, 360, 360],
                rotateZ: earthyIdle ? 0 : [0, -10, 10, 0],
                scale: earthyIdle ? 1 : [1, 1, 0.9, 1],
              }}
              whileHover={{
                scale: 1.05,
                rotateZ: [0, 5, -5, 0],
                transition: { duration: 0.6 },
              }}
              transition={{
                duration: earthyIdle ? 2 : 2.5,
                ease: "easeOut",
                times: earthyIdle ? undefined : [0, 0.4, 0.7, 1],
                onComplete: () => setShowFeatures(true),
              }}
            >
              <Image
                src="/earthy-icon.png"
                alt="Social Atlas Logo"
                width={500}
                height={500}
                priority
                className="w-full h-auto drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              />
            </motion.div>

            {showFeatures && (
              <div className="space-y-3 mt-4 w-full">
                {features.map((text, index) => (
                  <div
                    key={index}
                    className="bg-[#2A2A2A] text-[#FDFBF5] px-4 py-3 rounded-xl text-sm md:text-xl font-bold text-center shadow-md hover:brightness-110 transition-all"
                    style={{
                      animation: `fadeInUp 0.5s ease forwards`,
                      animationDelay: `${index * 0.3}s`,
                      opacity: 0,
                    }}
                  >
                    • {text}
                  </div>
                ))}
              </div>
            )}

            <style jsx>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>

          <div className="text-[#FDFBF5] max-w-md md:max-w-lg w-full mt-4 md:mt-12">
            <h1
              className="text-[2.5rem] md:text-[5rem] font-bold leading-tight tracking-tight mb-2 text-center md:text-left"
              style={{
                fontFamily:
                  "var(--font-poppins-rounded), 'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Social Atlas
            </h1>
            <p className="text-center md:text-left text-sm md:text-lg text-white/80 leading-snug mb-4">
              Create your account or sign in to begin your global adventure.
            </p>

            <div className="flex justify-center md:justify-start mb-4 space-x-4">
              <button
                onClick={() => setActiveTab("signup")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === "signup"
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setActiveTab("login")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === "login"
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Log In
              </button>
            </div>

            <div className="transition-all duration-300 ease-in-out">
              <form
                onSubmit={handleSubmit}
                className="bg-[#FDFBF5] text-[#1B1B1B] p-5 rounded-2xl shadow-md space-y-3 text-sm md:text-base max-h-[440px] overflow-auto"
              >
                {activeTab === "signup" && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 placeholder-gray-500"
                      required
                    />
                    {username.length > 0 && (
                      <p
                        className={`text-xs mt-1 flex items-center space-x-2 ${
                          usernameValid ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {usernameValid ? (
                          <span className="flex items-center gap-1">
                            <FaCheck className="text-green-600" />
                            <span>Username looks good</span>
                          </span>
                        ) : (
                          <span>Must be 3–20 lowercase letters, numbers, or underscores</span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 placeholder-gray-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 placeholder-gray-500"
                  required
                />
                {activeTab === "signup" && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 placeholder-gray-500"
                    required
                  />
                )}
                {activeTab === "login" && (
                  <label className="flex items-center space-x-2 text-sm mt-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-green-600"
                    />
                    <span>Remember me</span>
                  </label>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#1D5136] hover:bg-[#2a7d58] text-white font-semibold py-3 rounded-xl transition-all hover:scale-105"
                >
                  {activeTab === "signup" ? "Create Account" : "Log In"}
                </button>
                {activeTab === "signup" && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    By creating an account, you agree to our {" "}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>{" "}
                    and {" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}
                {activeTab === "login" && (
                  <p
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-green-700 hover:underline text-center mt-2 cursor-pointer"
                  >
                    Forgot your password?
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 text-center text-sm text-white/60 space-y-2 px-4 py-4 w-full bg-[#1B1B1B]">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="w-full sm:w-auto text-center">Follow us:</span>
          <a
            href="https://instagram.com/socialatlas_app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white text-xl transition-transform hover:scale-110"
          >
            <FaInstagram />
          </a>
          <a
            href="https://twitter.com/socialatlas_app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-white text-xl transition-transform hover:scale-110"
          >
            <FaXTwitter />
          </a>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
          <span>© 2025 Social Atlas™. All rights reserved.</span>
          <span>·</span>
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>
          <span>·</span>
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
