import React, { useState, useMemo } from 'react';
import {
  Heart,
  Users,
  Smartphone,
  UserCheck,
  FileText,
  CreditCard,
  UserCircle,
  DollarSign,
  BarChart3,
  Globe,
  TrendingUp,
  Calendar,
  Mail,
  Award,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Megaphone,
} from 'lucide-react';
import type { Donation, Volunteer, Client } from '../App';

interface CharityHubProps {
  donations: Donation[];
  volunteers: Volunteer[];
  clients: Client[];
  onNavigateToView?: (view: string) => void;
  onSetPage?: (page: string) => void;
}

const CharityHub: React.FC<CharityHubProps> = ({
  donations,
  volunteers,
  clients,
  onNavigateToView,
  onSetPage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueDonors = new Set(donations.map((d) => d.donorName)).size;
    const activeVolunteers = volunteers.filter((v) => v.availability !== 'unavailable').length;
    const totalMembers = clients.length;

    // Calculate this month's donations
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyDonations = donations.filter(
      (d) => new Date(d.donationDate) >= thisMonth
    );
    const monthlyTotal = monthlyDonations.reduce((sum, d) => sum + d.amount, 0);

    // Calculate growth
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDonations = donations.filter((d) => {
      const date = new Date(d.donationDate);
      return date >= lastMonth && date < thisMonth;
    });
    const lastMonthTotal = lastMonthDonations.reduce((sum, d) => sum + d.amount, 0);
    const growth = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return {
      totalDonations,
      uniqueDonors,
      activeVolunteers,
      totalMembers,
      monthlyTotal,
      growth,
    };
  }, [donations, volunteers, clients]);

  // AI-powered insights
  const insights = useMemo(() => {
    const messages: Array<{ type: 'success' | 'warning' | 'info'; message: string }> = [];

    if (metrics.growth > 10) {
      messages.push({
        type: 'success',
        message: `Donations up ${metrics.growth.toFixed(1)}% this month! Great momentum! 🎉`,
      });
    } else if (metrics.growth < -10) {
      messages.push({
        type: 'warning',
        message: `Donations down ${Math.abs(metrics.growth).toFixed(1)}% this month. Consider launching a campaign.`,
      });
    }

    if (volunteers.length > 0 && metrics.activeVolunteers < volunteers.length * 0.3) {
      messages.push({
        type: 'info',
        message: `${volunteers.length - metrics.activeVolunteers} volunteers are inactive. Time to re-engage?`,
      });
    }

    if (donations.length > 0 && metrics.uniqueDonors / donations.length < 0.5) {
      messages.push({
        type: 'success',
        message: `Strong donor retention! ${((1 - metrics.uniqueDonors / donations.length) * 100).toFixed(0)}% repeat donors.`,
      });
    }

    return messages;
  }, [metrics, volunteers, donations]);

  // Recent donations
  const recentDonations = useMemo(() => {
    return [...donations]
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())
      .slice(0, 5);
  }, [donations]);

  const handleFeatureClick = (feature: string) => {
    if (onNavigateToView) {
      onNavigateToView(feature);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500" />
            Charity Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Manage donations, volunteers, memberships, and impact
          </p>
        </div>
        <button
          onClick={() => onSetPage?.('donations')}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Donation
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search donations, donors, volunteers, campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-purple-900">AI Insights</h3>
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`text-sm ${
                    insight.type === 'success'
                      ? 'text-green-700'
                      : insight.type === 'warning'
                      ? 'text-orange-700'
                      : 'text-blue-700'
                  }`}
                >
                  • {insight.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Donations"
          value={`$${metrics.totalDonations.toLocaleString()}`}
          gradient="from-green-500 to-emerald-600"
          onClick={() => onSetPage?.('donations')}
        />
        <StatCard
          icon={Users}
          label="Unique Donors"
          value={metrics.uniqueDonors.toString()}
          gradient="from-blue-500 to-cyan-600"
          onClick={() => onSetPage?.('donations')}
        />
        <StatCard
          icon={UserCheck}
          label="Active Volunteers"
          value={`${metrics.activeVolunteers}/${volunteers.length}`}
          gradient="from-purple-500 to-pink-600"
          onClick={() => onSetPage?.('volunteers')}
        />
        <StatCard
          icon={Award}
          label="Total Members"
          value={metrics.totalMembers.toString()}
          gradient="from-orange-500 to-red-600"
          onClick={() => onSetPage?.('organizations')}
        />
      </div>

      {/* Monthly Performance */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-rose-100 text-sm font-medium">This Month</div>
            <div className="text-4xl font-bold mt-1">
              ${metrics.monthlyTotal.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-rose-100">
                {metrics.growth > 0 ? '+' : ''}
                {metrics.growth.toFixed(1)}% from last month
              </span>
            </div>
          </div>
          <Target className="w-20 h-20 text-rose-300 opacity-50" />
        </div>
      </div>

      {/* Feature Cards - The Main Feature Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Charity Management Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1 */}
          <FeatureCard
            icon={Users}
            title="Volunteer Management"
            description="Keeping in contact with your volunteers has never been easier with our all-in-one volunteer management features and portal."
            gradient="from-red-500 to-rose-600"
            onClick={() => onSetPage?.('volunteers')}
          />
          <FeatureCard
            icon={Smartphone}
            title="Mobile Marketing & Text2Give"
            description="Reach your constituents at any time with our mobile marketing and Text2Give features."
            gradient="from-blue-500 to-indigo-600"
            onClick={() => handleFeatureClick('mobile-marketing')}
          />
          <FeatureCard
            icon={Award}
            title="Memberships & Programs"
            description="Does your organization require memberships? Use our membership features and portal to keep track and build your membership base."
            gradient="from-amber-500 to-orange-600"
            onClick={() => handleFeatureClick('memberships')}
          />

          {/* Row 2 */}
          <FeatureCard
            icon={FileText}
            title="Survey & Form Builder"
            description="Looking to create a digital volunteer form or request feedback for your organization? Get the answers you need in just a few clicks."
            gradient="from-red-500 to-pink-600"
            onClick={() => handleFeatureClick('forms')}
          />
          <FeatureCard
            icon={CreditCard}
            title="Online Donations & Payment"
            description="Built-in merchant processing that transfers funds in one business day and allows constituents to pay via credit card, ACH, Paypal and Apple Pay."
            gradient="from-indigo-500 to-blue-600"
            onClick={() => onSetPage?.('donations')}
          />
          <FeatureCard
            icon={UserCircle}
            title="Donor & Member Portal"
            description="Enhance your relationship with constituents by giving them access to their own portal account."
            gradient="from-orange-500 to-amber-600"
            onClick={() => handleFeatureClick('portal')}
          />

          {/* Row 3 */}
          <FeatureCard
            icon={DollarSign}
            title="QuickBooks Integration"
            description="Seamlessly transfer everything you need from DonorView into QuickBooks."
            gradient="from-green-500 to-emerald-600"
            onClick={() => handleFeatureClick('quickbooks')}
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics & Reports"
            description="Utilize our unique analytics to filter and sort through lists and customize reports."
            gradient="from-purple-500 to-indigo-600"
            onClick={() => handleFeatureClick('analytics')}
          />
          <FeatureCard
            icon={Globe}
            title="Website Builder"
            description="Is your website holding your nonprofit back? Improve your constituent experience with a beautiful, secure & mobile friendly website!"
            gradient="from-cyan-500 to-blue-600"
            onClick={() => handleFeatureClick('website')}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <QuickActionCard
            icon={Plus}
            title="New Campaign"
            gradient="from-rose-500 to-pink-600"
            onClick={() => handleFeatureClick('new-campaign')}
          />
          <QuickActionCard
            icon={Mail}
            title="Email Blast"
            gradient="from-blue-500 to-indigo-600"
            onClick={() => handleFeatureClick('email-blast')}
          />
          <QuickActionCard
            icon={Calendar}
            title="Schedule Event"
            gradient="from-purple-500 to-pink-600"
            onClick={() => onSetPage?.('events')}
          />
          <QuickActionCard
            icon={FileText}
            title="Export Reports"
            gradient="from-green-500 to-emerald-600"
            onClick={() => handleFeatureClick('export')}
          />
          <QuickActionCard
            icon={Megaphone}
            title="Create Appeal"
            gradient="from-orange-500 to-red-600"
            onClick={() => handleFeatureClick('appeal')}
          />
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
          <button
            onClick={() => onSetPage?.('donations')}
            className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentDonations.length > 0 ? (
            recentDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{donation.donorName}</div>
                    <div className="text-sm text-gray-500">
                      {donation.campaign || 'General Fund'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${donation.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(donation.donationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No donations yet. Start your first campaign!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  gradient: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, gradient, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/80 text-sm font-medium">{label}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
        </div>
        <Icon className="w-12 h-12 text-white/30" />
      </div>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  gradient,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-xl transition-all group"
    >
      <div
        className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-rose-600 font-medium text-sm group-hover:gap-2 transition-all">
        Learn More
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  gradient: string;
  onClick?: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  title,
  gradient,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 text-white`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <div className="font-semibold">{title}</div>
    </div>
  );
};

export default CharityHub;
