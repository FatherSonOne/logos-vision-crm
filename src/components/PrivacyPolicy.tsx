import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              1. Introduction
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Logos Vision CRM ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our nonprofit relationship management platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
              Information You Provide
            </h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Account information (name, email address, organization name)</li>
              <li>Contact and donor records you create within the platform</li>
              <li>Project and task information</li>
              <li>Communications and notes</li>
              <li>Payment and donation records</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
              Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (features used, pages visited)</li>
              <li>IP address and general location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your requests and transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Protect against fraudulent or illegal activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              4. Information Sharing
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li><strong>Service Providers:</strong> Third parties that help us operate our platform (hosting, analytics, email services)</li>
              <li><strong>Team Members:</strong> Other users within your organization as configured by your administrator</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              5. Data Security
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your
              information, including encryption in transit and at rest, access controls, and
              regular security assessments. However, no method of transmission over the Internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              6. Data Retention
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We retain your information for as long as your account is active or as needed to
              provide you services. You may request deletion of your data at any time. We may
              retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              7. Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal information</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of certain data processing activities</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              8. Third-Party Services
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our platform integrates with third-party services including Google Calendar,
              Microsoft Calendar, and others. Your use of these integrations is subject to
              the respective third party's privacy policies. We encourage you to review their
              privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not
              knowingly collect personal information from children under 13. If you believe
              we have collected information from a child under 13, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              10. Changes to This Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date. Your continued use of the service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              11. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices,
              please contact us at:
            </p>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-slate-700 dark:text-slate-200 font-medium">Logos Vision</p>
              <p className="text-slate-600 dark:text-slate-300">Email: privacy@logosvision.org</p>
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

export default PrivacyPolicy;
