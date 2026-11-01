import Link from "next/link";
import { FileText, Scale, AlertCircle, CheckCircle } from "lucide-react";

export const metadata = {
  alternates: { canonical: "/terms-of-service" },
  title: "Terms of Service",
  description: "Terms of Service for TechUpdatesZone - Read our terms and conditions for using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container-page max-w-4xl py-12 sm:py-16">

      <div>
        <div className="card p-6 sm:p-10">
          <div className="flex items-center gap-3 ">
            <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <Scale className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white">Terms of Service</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Last updated: November 1, 2026</p>
            </div>
          </div>

          <div className="space-y-10">
            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-brand-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                By accessing and using TechUpdatesZone, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-brand-600" />
                2. Use License
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on TechUpdatesZone for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-brand-600" />
                3. User Conduct
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                When using our platform, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>Provide accurate and truthful information when submitting comments or reports</li>
                <li>Respect other users and maintain a civil discourse</li>
                <li>Not post any content that is illegal, harmful, threatening, abusive, or violates any rights</li>
                <li>Not engage in any activity that disrupts or interferes with the website&apos;s operation</li>
                <li>Not use automated systems to access the website without permission</li>
                <li>Not attempt to gain unauthorized access to any part of the website</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">4. Content and Intellectual Property</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                All content on TechUpdatesZone, including but not limited to text, graphics, logos, images, and software, is the property of TechUpdatesZone or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                You retain ownership of any content you submit, but by submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">5. Comments and User-Generated Content</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 ml-4">
                <li>Moderate, edit, or remove any comments or user-generated content</li>
                <li>Block users who violate these terms</li>
                <li>Use automated moderation tools to filter inappropriate content</li>
              </ul>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">6. Disclaimer</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                The materials on TechUpdatesZone are provided on an &apos;as is&apos; basis. TechUpdatesZone makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">7. Limitations</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                In no event shall TechUpdatesZone or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TechUpdatesZone, even if TechUpdatesZone or a TechUpdatesZone authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">8. Revisions and Errata</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                The materials appearing on TechUpdatesZone could include technical, typographical, or photographic errors. TechUpdatesZone does not warrant that any of the materials on its website are accurate, complete, or current. TechUpdatesZone may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">9. Links</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                TechUpdatesZone has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TechUpdatesZone of the site. Use of any such linked website is at the user&apos;s own risk.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">10. Modifications</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                TechUpdatesZone may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">11. Governing Law</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
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

