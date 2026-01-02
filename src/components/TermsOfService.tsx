import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Terms of Service
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              By accessing or using Logos Vision CRM ("the Service"), you agree to be bound by
              these Terms of Service ("Terms"). If you disagree with any part of these terms,
              you may not access the Service. These Terms apply to all visitors, users, and
              others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              2. Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Logos Vision CRM is a nonprofit relationship management platform that helps
              organizations manage contacts, donors, projects, volunteers, and communications.
              The Service includes web-based applications, mobile applications, and related
              tools and features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              3. User Accounts
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and
              current information. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to other systems or networks</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service for any unauthorized commercial purpose</li>
              <li>Collect or harvest any information from other users without consent</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              5. Your Data
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              You retain all rights to the data you upload to the Service ("Your Data").
              By using the Service, you grant us a limited license to use Your Data solely
              to provide and improve the Service.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You are responsible for ensuring you have the right to upload and use any
              data within the Service, including obtaining necessary consents from individuals
              whose information you store.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              6. Data Privacy and Security
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We take data privacy seriously. Our collection and use of personal information
              is governed by our Privacy Policy. By using the Service, you consent to our
              data practices as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              7. Third-Party Integrations
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The Service may integrate with third-party services (e.g., Google Calendar,
              Microsoft 365). Your use of these integrations is subject to the respective
              third party's terms and policies. We are not responsible for the practices
              of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The Service and its original content, features, and functionality are owned
              by Logos Vision and are protected by international copyright, trademark,
              patent, trade secret, and other intellectual property laws. You may not copy,
              modify, distribute, sell, or lease any part of our Service without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              9. Service Availability
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We strive to maintain high availability of the Service but do not guarantee
              uninterrupted access. The Service may be temporarily unavailable due to
              maintenance, updates, or circumstances beyond our control. We will make
              reasonable efforts to provide advance notice of planned maintenance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              To the maximum extent permitted by law, Logos Vision shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, or any
              loss of profits or revenues, whether incurred directly or indirectly, or any
              loss of data, use, goodwill, or other intangible losses resulting from your
              use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              11. Disclaimer of Warranties
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any
              kind, either express or implied, including but not limited to implied warranties
              of merchantability, fitness for a particular purpose, non-infringement, or
              course of performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              12. Indemnification
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You agree to indemnify and hold harmless Logos Vision and its officers,
              directors, employees, and agents from any claims, damages, losses, liabilities,
              and expenses (including attorneys' fees) arising from your use of the Service
              or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              13. Termination
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason, including if you breach these Terms. Upon termination:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Your right to use the Service will cease immediately</li>
              <li>You may request export of your data within 30 days</li>
              <li>We may delete your data after the retention period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              14. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice
              of significant changes through the Service or by email. Your continued use of
              the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              15. Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of
              the United States, without regard to its conflict of law provisions. Any disputes
              arising from these Terms will be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              16. Severability
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable, the
              remaining provisions will remain in full force and effect. The invalid or
              unenforceable provision will be modified to reflect the parties' original intent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              17. Entire Agreement
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement
              between you and Logos Vision regarding the Service and supersede all prior
              agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              18. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-slate-700 dark:text-slate-200 font-medium">Logos Vision</p>
              <p className="text-slate-600 dark:text-slate-300">Email: legal@logosvision.org</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} Logos Vision. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
