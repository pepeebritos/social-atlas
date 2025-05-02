"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function WelcomePage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setAlreadyJoined(false);
    setSuccess(false);

    try {
      const q = query(
        collection(db, "waitlist"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setAlreadyJoined(true);
        setEmail("");
      } else {
        await addDoc(collection(db, "waitlist"), {
          email: email,
          timestamp: serverTimestamp(),
        });
        setSuccess(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">

        {/* Earthy Logo */}
        <motion.div
          className="relative flex-shrink-0 w-[16rem] md:w-[24rem]"
          initial={{ y: -300, rotate: 0, rotateZ: 0, scale: 1 }}
          animate={{
            y: [-300, 0, -20, 0],
            rotate: [0, 0, 360, 360],
            rotateZ: [0, -10, 10, 0],
            scale: [1, 1, 0.9, 1],
          }}
          transition={{
            duration: 2.5,
            ease: "easeOut",
            times: [0, 0.4, 0.7, 1],
          }}
          whileHover={{
            scale: 1.05,
            rotateZ: [0, 5, -5, 0],
            transition: { duration: 0.6 },
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

        {/* Text + Form */}
        <div className="text-center md:text-left text-[#FDFBF5] max-w-md md:max-w-xl">
          <h1
            className="text-[3.2rem] md:text-[6rem] font-bold leading-tight tracking-tight mb-4"
            style={{
              fontFamily: "var(--font-poppins-rounded), 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Social Atlas
          </h1>

          <p className="text-base md:text-lg font-medium mt-2 mb-6 bg-[#FDFBF5] text-[#1B1B1B] px-6 py-5 rounded-xl leading-[1.7] shadow-sm">
            Social Atlas is your global travel companion — discover trails, meet creators, document your journeys, and explore the world with a creative community of modern explorers.
          </p>

          {/* Waitlist Form */}
          {success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center mt-6 gap-2 text-green-400 font-semibold text-lg"
            >
              <FaCheckCircle className="text-green-400 text-2xl" />
              Successfully joined the waitlist!
            </motion.div>
          ) : alreadyJoined ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center mt-6 gap-2 text-yellow-400 font-semibold text-lg"
            >
              <FaCheckCircle className="text-yellow-400 text-2xl" />
              You have already joined the waitlist!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-auto bg-[#FDFBF5] text-[#1B1B1B] placeholder-gray-500 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-600 text-base shadow-md text-center sm:text-left"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-block bg-[#1D5136] hover:bg-[#2a7d58] transition-all duration-300 ease-in-out text-white text-base md:text-lg font-semibold py-3 px-8 rounded-full shadow-md hover:scale-110 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join the waitlist"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-white/60 space-y-4 px-4 w-full">
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
          <Link href="/terms" className="underline hover:text-white">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
