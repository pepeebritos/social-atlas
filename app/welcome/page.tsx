'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FaInstagram,
  FaTwitter,
  FaImages,
  FaVideo,
  FaMapMarkedAlt,
  FaPenFancy,
  FaGlobe,
  FaUserAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from 'lib/firebase';
import { Map, Rocket, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';

export default function WelcomePage() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [earthyRotation, setEarthyRotation] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const pedroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
      setEarthyRotation(scrollTop % 360);
    };
    window.addEventListener('scroll', handleScroll);

    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 640);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return alert('Please enter a valid email.');
    setLoading(true);
    setSuccess(false);
    setAlreadyJoined(false);

    try {
      const q = query(collection(db, 'waitlist'), where('email', '==', email));
      const exists = await getDocs(q);
      if (!exists.empty) {
        setAlreadyJoined(true);
        setEmail('');
      } else {
        await addDoc(collection(db, 'waitlist'), {
          email,
          timestamp: serverTimestamp(),
        });
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { id: 'photos', icon: <FaImages />, title: 'Photos & Multi-Photos' },
    { id: 'video', icon: <FaVideo />, title: 'Video Posts' },
    { id: 'maps', icon: <FaMapMarkedAlt />, title: 'Custom Maps' },
    { id: 'write', icon: <FaPenFancy />, title: 'Write: Articles / Journals / Guides' },
    { id: 'discovery', icon: <FaGlobe />, title: 'Global Discovery Feed' },
    { id: 'profile', icon: <FaUserAlt />, title: 'Your Map Profile' },
  ];

  return (
    <div className="relative bg-[#FDFBF5] text-[#1B1B1B] scroll-smooth overflow-hidden font-fredoka">
      <div
        className="fixed top-0 left-0 h-1 bg-[#1D5136] z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 flex flex-col items-center justify-center overflow-hidden text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[4rem] sm:text-[6rem] md:text-[8rem] font-fredoka font-bold leading-none"
        >
          Social Atlas
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-[5rem] sm:text-[7rem] md:text-[9rem] font-fredoka font-bold text-[#1D5136] leading-none mb-8"
        >
          Welcome!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
          className="w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] mt-4 sm:-mt-6 overflow-hidden pointer-events-none"
          style={{ rotate: earthyRotation }}
        >
          <Image
            src="/earthy-icon.png"
            alt="Earthy"
            width={420}
            height={420}
            className="object-cover mx-auto"
          />
        </motion.div>
      </section>

{/* Tagline Section */}
<section className="text-center pt-0 pb-2 sm:pt-20 sm:pb-20 px-6 sm:px-8">
  <div className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1B1B1B] leading-snug space-y-3 sm:space-y-4 max-w-4xl mx-auto">
    <p>
      Where journeys become stories.
    </p>
    <motion.p
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      The world’s first exploration feed, built for creators.
    </motion.p>
    <motion.p
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      Turn the planet into your canvas. Social Atlas is your toolkit.
    </motion.p>
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
    >
      Pin it. Share it. Inspire the world.
    </motion.p>
  </div>
</section>


{/* Cinematic Features Section */}
<div className="h-12 bg-[#FDFBF5]" />
<section className="bg-[#1D5136] py-16 sm:py-24 px-4 sm:px-8">
  <div className="text-center mb-10 sm:mb-14">
    <motion.h2
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="text-4xl sm:text-5xl font-bold text-white"
    >
      Elevate your journey with professional tools
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="mt-3 text-sm sm:text-base text-white font-semibold"
    >
      Built for explorers. Designed for creators. Shaped by stories.
    </motion.p>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 max-w-4xl mx-auto text-center">
    {features.map((feature, idx) => (
      <motion.div
        key={feature.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 + idx * 0.1, duration: 0.6 }}
        className="flex flex-col items-center justify-center text-center space-y-2"
      >
        <div className="text-2xl sm:text-3xl text-white">
          {feature.icon}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
          {feature.title}
        </h3>
      </motion.div>
    ))}
  </div>
</section>

      {/* Pedro Bio Section */}
      <div ref={pedroRef} className="h-px w-full" id="pedro-section"></div>
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 px-6">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/pedro-photo.jpg"
              alt="Pedro"
              width={360}
              height={360}
              className="rounded-xl object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1"
          >
            <h3 className="text-3xl font-bold mb-4">Built by one explorer for the entire world.</h3>
            <p className="text-xl leading-relaxed text-gray-800">
              Hey, I’m Pedro, a creator and outdoor enthusiast who’s spent the last few years exploring the world and documenting it. I built Social Atlas for explorers, travelers, or anyone who wants more than likes! A place to map your journey, share real moments, and connect through stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Signup */}
      <section id="waitlist" className="bg-[#1D5136] text-white py-24">
  <div className="max-w-xl mx-auto text-center px-6">
    <div className="flex justify-center mb-3">
      <Rocket className="w-8 h-8 text-white" />
    </div>
    <h2 className="text-3xl font-bold mb-4">Be a Founding Explorer</h2>
    <p className="mb-6 text-white/80">
      Join our waitlist and help shape the future of creative exploration.
    </p>
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-full border border-white/30 bg-white text-[#1B1B1B] shadow-sm focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-white text-[#1D5136] font-semibold px-6 py-3 rounded-full shadow hover:brightness-110 transition-all disabled:opacity-50"
      >
        {loading ? 'Joining...' : 'Join the waitlist'}
      </button>
    </form>

    {success && (
      <div className="mt-4 text-green-400 flex items-center justify-center gap-2">
        <FaCheckCircle />
        Successfully joined the waitlist!
      </div>
    )}
    {alreadyJoined && (
      <div className="mt-4 text-yellow-300 flex items-center justify-center gap-2">
        <FaCheckCircle />
        You’ve already joined the waitlist!
      </div>
    )}
  </div>
</section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 pb-10 bg-[#FDFBF5]">
  <div className="flex justify-center gap-4 text-xl mb-2">
    <a href="https://instagram.com/socialatlasapp" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
    <a href="https://twitter.com/socialatlas_app" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
  </div>
  <p>© 2025 Social Atlas™ — All rights reserved.</p>
  <p className="underline mt-1">
    <button onClick={() => setShowTermsModal(true)} className="hover:opacity-80">Terms</button> · <button onClick={() => setShowPrivacyModal(true)} className="hover:opacity-80">Privacy</button>
  </p>

  {/* Terms Modal */}
  <Dialog open={showTermsModal} onClose={() => setShowTermsModal(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#1D5136]">Terms & Conditions</h2>
          <button onClick={() => setShowTermsModal(false)} className="hover:opacity-80">
            <span className="sr-only">Close</span>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>
        <iframe
          src="/terms"
          className="w-full h-[70vh] border-none"
          title="Terms and Conditions"
        />
      </Dialog.Panel>
    </div>
  </Dialog>

  {/* Privacy Modal */}
  <Dialog open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#1D5136]">Privacy Policy</h2>
          <button onClick={() => setShowPrivacyModal(false)} className="hover:opacity-80">
            <span className="sr-only">Close</span>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>
        <iframe
          src="/privacy"
          className="w-full h-[70vh] border-none"
          title="Privacy Policy"
        />
      </Dialog.Panel>
    </div>
  </Dialog>
</footer>
    </div>
  );
}
