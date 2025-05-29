"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/welcome";

  const [showClose, setShowClose] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.self === window.top) {
      setShowClose(true);
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF5] px-4 py-12">
      <div className="relative max-w-3xl w-full bg-white p-6 md:p-10 rounded-xl shadow-xl text-[#1B1B1B]">
        {showClose && (
          <button
            onClick={() => router.push(returnTo)}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <p className="mb-4">
          Welcome to Social Atlas. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Account Responsibility</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. User Conduct</h2>
        <p className="mb-4">
          You agree not to use Social Atlas for any unlawful or abusive purposes. Content that violates our community standards may be removed and your account suspended.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Content Ownership</h2>
        <p className="mb-4">
          You retain ownership of any content you post. By posting on Social Atlas, you grant us a limited license to display, distribute, and promote your content on our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Platform Usage</h2>
        <p className="mb-4">
          We reserve the right to modify or discontinue features of the platform at any time. We are not liable for any losses resulting from downtime or changes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Termination</h2>
        <p className="mb-4">
          We may suspend or terminate your account at any time for violations of these terms or for any behavior deemed harmful to the community.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
        <p>
          If you have questions or concerns about these terms, please contact us at{" "}
          <a href="mailto:hello@socialatlas.com" className="underline text-blue-600">
            hello@socialatlas.com
          </a>.
        </p>
      </div>
    </main>
  );
}
