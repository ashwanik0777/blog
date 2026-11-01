import Link from "next/link";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  alternates: { canonical: "/privacy-policy" },
  title: "Privacy Policy",
  description: "Privacy Policy for TechUpdatesZone - Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page max-w-4xl py-12 sm:py-16">

      <div>
        <div className="card p-6 sm:p-10">
          <div className="flex items-center gap-3 ">
            <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <Shield className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white">Privacy Policy</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Last updated: November 1, 2026</p>
            </div>
          </div>

          <div className="space-y-10">
            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-brand-600" />
                1. Information We Collect
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                At TechUpdatesZone, we collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>Name and email address when you submit comments or report issues</li>
                <li>Visitor statistics including IP address, browser type, device information, and pages visited</li>
                <li>Newsletter subscription information if you choose to subscribe</li>
                <li>Any other information you voluntarily provide through our contact forms</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-brand-600" />
                2. How We Use Your Information
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Send you newsletters and updates (if you&apos;ve subscribed)</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-brand-600" />
                3. Information Sharing
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>With service providers who assist us in operating our website and conducting our business</li>
                <li>When required by law or to protect our rights and safety</li>
                <li>In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">4. Data Security</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">5. Cookies and Tracking</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">6. Your Rights</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Unsubscribe from our newsletter at any time</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">7. Children&apos;s Privacy</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">9. Contact Us</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:support@techupdateszone.com" className="text-brand-600 dark:text-brand-400 hover:underline">
                  support@techupdateszone.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
            <Link href="/" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

