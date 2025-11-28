import Link from "next/link";
import { FileText, Scale, AlertCircle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | TechUpdatesZone Blog",
  description: "Terms of Service for TechUpdatesZone Blog - Read our terms and conditions for using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          TechUpdatesZone Blog
        </Link>
        <div className="flex gap-6">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">Blogs</Link>
          <Link href="/" className="text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium transition-colors">Home</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using TechUpdatesZone Blog, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                2. Use License
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on TechUpdatesZone Blog for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                3. User Conduct
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When using our platform, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Provide accurate and truthful information when submitting comments or reports</li>
                <li>Respect other users and maintain a civil discourse</li>
                <li>Not post any content that is illegal, harmful, threatening, abusive, or violates any rights</li>
                <li>Not engage in any activity that disrupts or interferes with the website's operation</li>
                <li>Not use automated systems to access the website without permission</li>
                <li>Not attempt to gain unauthorized access to any part of the website</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Content and Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                All content on TechUpdatesZone Blog, including but not limited to text, graphics, logos, images, and software, is the property of TechUpdatesZone Blog or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You retain ownership of any content you submit, but by submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Comments and User-Generated Content</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Moderate, edit, or remove any comments or user-generated content</li>
                <li>Block users who violate these terms</li>
                <li>Use automated moderation tools to filter inappropriate content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Disclaimer</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The materials on TechUpdatesZone Blog are provided on an 'as is' basis. TechUpdatesZone Blog makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Limitations</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                In no event shall TechUpdatesZone Blog or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TechUpdatesZone Blog, even if TechUpdatesZone Blog or a TechUpdatesZone Blog authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Revisions and Errata</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The materials appearing on TechUpdatesZone Blog could include technical, typographical, or photographic errors. TechUpdatesZone Blog does not warrant that any of the materials on its website are accurate, complete, or current. TechUpdatesZone Blog may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Links</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                TechUpdatesZone Blog has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TechUpdatesZone Blog of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Modifications</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                TechUpdatesZone Blog may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@techupdateszone.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@techupdateszone.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

