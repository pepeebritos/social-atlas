"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const [backLink, setBackLink] = useState("/welcome");

  useEffect(() => {
    if (document.referrer.includes("/landing")) {
      setBackLink("/landing");
    } else {
      setBackLink("/welcome");
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF5] px-4 py-12">
      <div className="relative max-w-3xl w-full bg-white p-6 md:p-10 rounded-xl shadow-xl text-[#1B1B1B]">
        <Link
          href={backLink}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black transition"
          aria-label="Close"
        >
          ×
        </Link>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          At Social Atlas, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide when you create an account, such as your username, email, and profile content. We may also collect usage data to improve the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use your information to operate Social Atlas, personalize your experience, send communications, and improve the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing and Disclosure</h2>
        <p className="mb-4">
          We do not sell your personal data. We may share your information with trusted partners or when required by law.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
        <p className="mb-4">
          We take reasonable steps to protect your data using modern security practices, including encryption and secure hosting.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p className="mb-4">
          You may request to access, update, or delete your personal information by contacting us at{" "}
          <a href="mailto:hello@socialatlas.com" className="underline text-blue-600">
            hello@socialatlas.com
          </a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes</h2>
        <p className="mb-4">
          We may update this policy occasionally. We'll notify you of significant changes by updating this page.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact</h2>
        <p>
          Questions? Email us anytime at{" "}
          <a href="mailto:hello@socialatlas.com" className="underline text-blue-600">
            hello@socialatlas.com
          </a>.
        </p>
      </div>
    </main>
  );
}
