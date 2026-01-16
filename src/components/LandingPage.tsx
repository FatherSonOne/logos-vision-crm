import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, FileText, BarChart3, Shield, Clock,
  CheckCircle, ArrowRight, Sparkles, Heart, Building2,
  Mail, Phone, MapPin, ChevronRight, ChevronLeft,
  Download, Monitor, Smartphone, Globe, Zap, MessageSquare,
  Layout, Database, Star
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onShowPrivacyPolicy: () => void;
  onShowTermsOfService: () => void;
}

// Quantum Ripple Logo Component
const QuantumRippleLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" fill="none" className="opacity-30 animate-[spin_10s_linear_infinite]" />
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="0.75" fill="none" className="opacity-50 animate-[spin_15s_linear_infinite_reverse]" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1" fill="none" className="opacity-70 animate-pulse" />
    <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-bounce-subtle" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onShowPrivacyPolicy,
  onShowTermsOfService,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Layout,
      title: 'Project Command Center',
      description: 'Orchestrate complex initiatives with ease. Visual timelines, Kanban boards, and AI-assisted planning tools keep your mission on track.',
      color: 'text-teal-400',
      bg: 'bg-teal-400/10',
      border: 'border-teal-400/20'
    },
    {
      icon: Heart,
      title: 'Charity Hub',
      description: 'A dedicated workspace for tracking donations, managing pledges, and coordinating volunteer efforts. Keep your supporters engaged and appreciated.',
      color: 'text-pink-400',
      bg: 'bg-pink-400/10',
      border: 'border-pink-400/20'
    },
    {
      icon: Zap,
      title: 'AI Forge',
      description: 'Harness the power of generative AI to write grant proposals, craft email campaigns, and generate content. Your 24/7 creative assistant.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20'
    },
    {
      icon: MessageSquare,
      title: 'Pulse Chat',
      description: 'Secure, integrated team messaging. Discuss cases, coordinate events, and share files without leaving the platform.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20'
    },
    {
      icon: Database,
      title: 'Smart CRM',
      description: 'Comprehensive profiles for clients, households, and organizations. Track relationships, history, and impact in one unified view.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20'
    },
    {
      icon: Globe,
      title: 'Client Portals',
      description: 'Empower those you serve with secure, branded portals. Allow clients to view status, upload documents, and communicate directly.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-teal-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-gentle" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-gentle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={onGetStarted}>
              <div className="relative w-10 h-10 flex items-center justify-center text-teal-400 group-hover:text-cyan-400 transition-colors duration-500">
                <QuantumRippleLogo />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-teal-200 transition-all">
                Logos Vision
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">Features</a>
              <a href="#download" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">Download</a>
              <a href="#about" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors">About</a>
              
              <div className="h-4 w-px bg-white/10" />
              
              <button
                onClick={onGetStarted}
                className="text-sm font-medium text-white hover:text-teal-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#020617] rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] hover:scale-105 active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 z-10">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="text-left space-y-8">
              {/* Badge with pulse animation */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-medium animate-fade-in-up">
                <Sparkles className="w-4 h-4 animate-sparkle" />
                <span className="tracking-wide">POWERED BY AI</span>
              </div>

              {/* Headline with stagger animation */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
                <span className="block text-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Nonprofit
                </span>
                <span className="block text-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Management
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 animate-gradient-x animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  Reimagined
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-xl text-slate-300 leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                The operating system for purpose-driven organizations. Beautiful, intelligent, and designed for impact.
              </p>

              {/* CTAs with enhanced hierarchy */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={onGetStarted}
                  className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-[#020617] font-bold text-lg overflow-hidden shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:shadow-[0_0_50px_rgba(45,212,191,0.6)] transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    Launch App
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <a
                  href="#download"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 rounded-xl text-white font-medium text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-8 pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 border-2 border-[#020617]" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-400">500+ organizations</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="ml-1">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Preview */}
            <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              {/* Floating dashboard preview with glassmorphism */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

                {/* Preview container */}
                <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  {/* Mock window chrome */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>

                  {/* Mock dashboard content */}
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-32 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5" />
                        <div className="w-8 h-8 rounded-full bg-white/5" />
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-lg border border-teal-500/20 p-3">
                          <div className="h-3 w-12 bg-teal-400/30 rounded mb-2" />
                          <div className="h-6 w-16 bg-white/20 rounded" />
                        </div>
                      ))}
                    </div>

                    {/* Chart placeholder */}
                    <div className="h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 flex items-end justify-around p-4">
                      {[40, 70, 50, 90, 60].map((height, i) => (
                        <div
                          key={i}
                          className="w-8 bg-gradient-to-t from-teal-400 to-cyan-400 rounded-t animate-pulse"
                          style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>

                    {/* List items */}
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                          <div className="w-6 h-6 rounded bg-teal-400/20" />
                          <div className="flex-1 h-3 bg-white/10 rounded" />
                          <div className="w-16 h-3 bg-white/10 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase - Enhanced */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Features That <span className="text-teal-400">Ripple</span> Outwards
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Every tool in Logos Vision is crafted to minimize friction and maximize the effect of your work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl border ${feature.border} bg-[#0B1121] hover:bg-[#111A30] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] cursor-pointer`}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                <div className="relative z-10">
                  {/* Icon with enhanced animation */}
                  <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color} group-hover:scale-110 transition-transform`} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-200 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors mb-4">
                    {feature.description}
                  </p>

                  {/* Learn More arrow - appears on hover */}
                  <div className="flex items-center gap-2 text-sm font-medium text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - NEW */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="text-teal-400">500+ Organizations</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Join nonprofits worldwide who are amplifying their impact with Logos Vision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Logos Vision transformed how we manage our programs. The AI tools alone save us 10 hours a week on grant writing.",
                name: "Sarah Chen",
                role: "Executive Director",
                org: "Hope Foundation",
                rating: 5
              },
              {
                quote: "The donor management and communication tools are exceptional. We've increased donor retention by 35% in just 6 months.",
                name: "Michael Rodriguez",
                role: "Development Director",
                org: "Community Alliance",
                rating: 5
              },
              {
                quote: "Finally, software that understands nonprofits. Beautiful interface, powerful features, and the support team is incredible.",
                name: "Emily Thompson",
                role: "Programs Manager",
                org: "Global Outreach",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0B1121] border border-white/10 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 to-purple-500/0 group-hover:from-teal-500/10 group-hover:to-purple-500/10 transition-all duration-500" />

                <div className="relative z-10">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role}</div>
                      <div className="text-xs text-teal-400">{testimonial.org}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Showcase - NEW */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10 bg-gradient-to-b from-transparent to-teal-900/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Seamlessly Connects With <span className="text-teal-400">Your Tools</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Integrate with the platforms you already love. More integrations added every month.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Mailchimp', icon: Mail },
              { name: 'Salesforce', icon: Database },
              { name: 'Slack', icon: MessageSquare },
              { name: 'Google Calendar', icon: Calendar },
              { name: 'QuickBooks', icon: BarChart3 },
              { name: 'Stripe', icon: Shield },
              { name: 'Zoom', icon: Users },
              { name: 'Zapier', icon: Zap },
              { name: 'Dropbox', icon: FileText },
              { name: 'HubSpot', icon: Building2 },
              { name: 'Twilio', icon: Phone },
              { name: 'WordPress', icon: Globe }
            ].map((integration, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl bg-[#0F172A] border border-white/5 hover:border-teal-500/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/0 to-purple-500/0 group-hover:from-teal-500/10 group-hover:to-purple-500/10 transition-all duration-500" />

                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:scale-110 transition-all">
                    <integration.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                    {integration.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 rounded-xl text-white font-medium transition-all">
              View All Integrations
              <ArrowRight className="inline-block w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="relative py-20 px-4 sm:px-6 lg:px-8 z-10 bg-gradient-to-b from-teal-900/5 to-teal-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#020617] border border-white/10 rounded-3xl p-12 md:p-20 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Experience Logos Vision <br />
                  <span className="text-teal-400">Everywhere</span>
                </h2>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                  Native apps for every platform. Seamlessly sync across devices. Start in the browser, continue on mobile.
                </p>

                <div className="flex flex-col gap-4">
                  {/* Web App - Highlighted */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition"></div>
                    <div onClick={onGetStarted} className="relative flex items-center justify-between p-4 bg-[#0B1121] border border-teal-500/30 rounded-xl hover:border-teal-500/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/20 rounded-lg text-teal-400">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white flex items-center gap-2">
                            Web App
                            <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full">Recommended</span>
                          </div>
                          <div className="text-xs text-slate-400">Works on any browser • No install required</div>
                        </div>
                      </div>
                      <button type="button" className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#020617] text-sm font-bold rounded-lg transition-all">
                        Launch Now
                      </button>
                    </div>
                  </div>

                  {/* Desktop Download */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Desktop Apps</div>
                        <div className="text-xs text-slate-400">Windows • macOS • Linux</div>
                      </div>
                    </div>
                    <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  {/* Android Download */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-green-500/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Android App</div>
                        <div className="text-xs text-slate-400">APK Direct Download • v2.1.0</div>
                      </div>
                    </div>
                    <button type="button" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Get APK
                    </button>
                  </div>

                   {/* iOS Placeholder */}
                   <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-500/20 rounded-lg text-slate-400">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-300">iOS App</div>
                        <div className="text-xs text-slate-500">Coming to App Store Q2 2026</div>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-white/10 text-slate-400 text-sm font-medium rounded-lg">
                      Coming Soon
                    </span>
                  </div>
                </div>

                {/* Platform Features */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>Offline Mode</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>Auto Updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>Cloud Sync</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>Dark Mode</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Mockup */}
              <div className="relative hidden md:block">
                 {/* Abstract Device Representation */}
                 <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                    <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#020617] relative">
                        {/* Screen Content Mockup */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-purple-900/40" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-teal-400 animate-pulse-gentle">
                            <QuantumRippleLogo className="w-full h-full" />
                        </div>
                        <div className="absolute bottom-10 left-6 right-6 space-y-3">
                            <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse"></div>
                            <div className="h-2 bg-white/10 rounded w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 z-10 bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-6 h-6 text-teal-500">
                 <QuantumRippleLogo className="w-6 h-6" />
              </div>
              <span className="font-semibold text-white">Logos Vision</span>
              <span className="text-sm">© {new Date().getFullYear()}</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#" onClick={(e) => { e.preventDefault(); onShowPrivacyPolicy(); }} className="hover:text-teal-400 transition-colors">Privacy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onShowTermsOfService(); }} className="hover:text-teal-400 transition-colors">Terms</a>
              <a href="mailto:support@logosvision.org" className="hover:text-teal-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
