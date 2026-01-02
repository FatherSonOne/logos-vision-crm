import React from 'react';
import {
  Users, Calendar, FileText, BarChart3, Shield, Clock,
  CheckCircle, ArrowRight, Sparkles, Heart, Building2,
  Mail, Phone, MapPin, ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onShowPrivacyPolicy: () => void;
  onShowTermsOfService: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onShowPrivacyPolicy,
  onShowTermsOfService,
}) => {
  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Track clients, households, and relationships with comprehensive profiles and interaction history.',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Integrated calendar with Google Calendar sync, appointment reminders, and team coordination.',
    },
    {
      icon: FileText,
      title: 'Document Library',
      description: 'Secure document storage with Google Drive integration, version control, and access policies.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Real-time dashboards and insights to track engagement, outcomes, and organizational impact.',
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Role-based access control, audit trails, and data protection built for sensitive client data.',
    },
    {
      icon: Clock,
      title: 'Time & Task Tracking',
      description: 'Manage projects, track volunteer hours, and coordinate team tasks efficiently.',
    },
  ];

  const benefits = [
    'Streamline client intake and case management',
    'Reduce administrative overhead by 40%',
    'Improve team collaboration and communication',
    'Generate compliance reports in seconds',
    'Secure cloud-based access from anywhere',
    'Integrate with tools you already use',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Logos Vision CRM
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium">
                Features
              </a>
              <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium">
                About
              </a>
              <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium">
                Contact
              </a>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-rose-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Purpose-Built for Nonprofits & Service Organizations
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Manage Relationships,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
                Maximize Impact
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
              Logos Vision CRM is a comprehensive client relationship management platform
              designed for nonprofits, churches, and service organizations. Streamline
              client management, track engagement, and measure outcomes - all in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* App Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-slate-400">crm.logosvision.org</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 space-y-3">
                    <div className="h-8 bg-slate-700/50 rounded-lg" />
                    <div className="h-6 bg-slate-700/30 rounded w-3/4" />
                    <div className="h-6 bg-slate-700/30 rounded w-1/2" />
                    <div className="h-6 bg-rose-500/30 rounded w-2/3" />
                    <div className="h-6 bg-slate-700/30 rounded w-3/4" />
                  </div>
                  <div className="col-span-3 bg-slate-700/20 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-lg p-4">
                        <div className="h-4 bg-rose-400/30 rounded w-1/2 mb-2" />
                        <div className="h-8 bg-rose-400/50 rounded w-3/4" />
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg p-4">
                        <div className="h-4 bg-blue-400/30 rounded w-1/2 mb-2" />
                        <div className="h-8 bg-blue-400/50 rounded w-3/4" />
                      </div>
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4">
                        <div className="h-4 bg-green-400/30 rounded w-1/2 mb-2" />
                        <div className="h-8 bg-green-400/50 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4 h-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Serve Better
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed specifically for organizations that put people first.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-rose-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Focus on Your Mission, Not Paperwork
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Logos Vision CRM automates the administrative tasks that slow you down,
                so you can spend more time making a difference in your community.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Built for Purpose
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Designed with nonprofits in mind
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Active Clients</span>
                    <span className="font-semibold text-slate-900 dark:text-white">2,847</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Cases Managed</span>
                    <span className="font-semibold text-slate-900 dark:text-white">12,493</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Volunteer Hours</span>
                    <span className="font-semibold text-slate-900 dark:text-white">48,291</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            About Logos Vision CRM
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Logos Vision CRM is a client relationship management platform built specifically
            for nonprofits, churches, and community service organizations. Our mission is to
            empower organizations that serve others by providing powerful, intuitive tools
            that simplify operations and amplify impact.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            We integrate with the tools you already use - including Google Calendar and
            Google Drive - to create a seamless experience for managing clients, documents,
            volunteers, and programs. Your data is secured with enterprise-grade encryption
            and role-based access controls, ensuring compliance and peace of mind.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Have questions? We'd love to hear from you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email</h3>
              <p className="text-slate-600 dark:text-slate-400">support@logosvision.org</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Phone</h3>
              <p className="text-slate-600 dark:text-slate-400">(555) 123-4567</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Location</h3>
              <p className="text-slate-600 dark:text-slate-400">United States</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-rose-100 mb-8">
            Join hundreds of organizations already using Logos Vision CRM to serve their communities better.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-rose-600 rounded-xl text-lg font-semibold hover:bg-rose-50 transition-all shadow-lg inline-flex items-center gap-2"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Logos Vision CRM</span>
              </div>
              <p className="text-sm">
                Empowering organizations that serve others with powerful, intuitive tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-rose-400 transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-rose-400 transition-colors">About</a></li>
                <li><button onClick={onGetStarted} className="hover:text-rose-400 transition-colors">Sign In</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" onClick={(e) => { e.preventDefault(); onShowPrivacyPolicy(); }} className="hover:text-rose-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" onClick={(e) => { e.preventDefault(); onShowTermsOfService(); }} className="hover:text-rose-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@logosvision.org</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Logos Vision CRM. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" onClick={(e) => { e.preventDefault(); onShowPrivacyPolicy(); }} className="hover:text-rose-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); onShowTermsOfService(); }} className="hover:text-rose-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
