import React, { useState, useMemo } from 'react';
import {
  Heart,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Search,
  Filter,
  X,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Building,
  Briefcase,
  Star,
  Share2,
  ChevronDown,
  Play,
  Quote,
} from 'lucide-react';
import type { Donation, Volunteer, Client } from '../types';
import { DonorJourneyTracker } from '@/components/DonorJourneyTracker';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CharityTier = 'bronze' | 'silver' | 'gold' | 'platinum';
type ImpactArea = 'Health' | 'Education' | 'Environment' | 'Youth' | 'Hunger' | 'Housing' | 'Arts' | 'Animals' | 'Community';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: 'executive' | 'board' | 'staff';
  bio?: string;
  photoUrl?: string;
  email?: string;
}

interface Testimonial {
  id: string;
  authorName: string;
  authorTitle?: string;
  text: string;
  impactStory?: string;
  videoUrl?: string;
}

interface CharityFinancials {
  programs: number; // percentage
  admin: number;
  fundraising: number;
  annualBudget: number;
  yearOverYearGrowth: number;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  mission: string;
  logoUrl?: string;
  imageUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    zip?: string;
  };
  tier: CharityTier;
  transparencyScore: number; // 0-100
  impactArea: ImpactArea;
  livesImpacted: number;
  projectsActive: number;
  volunteerHours: number;
  totalDonationsReceived: number;
  donorCount: number;
  foundedDate: string;
  taxId?: string;
  teamMembers: TeamMember[];
  testimonials: Testimonial[];
  financials: CharityFinancials;
  partnerIds: string[];
  recentDonations: { amount: number; date: string; anonymous: boolean }[];
}

interface CharityHubProps {
  donations: Donation[];
  volunteers: Volunteer[];
  clients: Client[];
  onNavigateToView?: (view: string) => void;
  onSetPage?: (page: string) => void;
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

const tierConfig: Record<CharityTier, { color: string; bgColor: string; borderColor: string; label: string; minDonations: number }> = {
  bronze: { color: '#CD7F32', bgColor: 'bg-amber-100 dark:bg-amber-900/30', borderColor: 'border-amber-400', label: 'Bronze', minDonations: 0 },
  silver: { color: '#C0C0C0', bgColor: 'bg-gray-100 dark:bg-gray-700/30', borderColor: 'border-gray-400', label: 'Silver', minDonations: 50000 },
  gold: { color: '#FFD700', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', borderColor: 'border-yellow-400', label: 'Gold', minDonations: 250000 },
  platinum: { color: '#E5E4E2', bgColor: 'bg-slate-100 dark:bg-slate-600/30', borderColor: 'border-slate-400', label: 'Platinum', minDonations: 1000000 },
};

const impactAreaColors: Record<ImpactArea, string> = {
  Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Environment: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Youth: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Hunger: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Housing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Arts: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Animals: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Community: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

// ============================================================================
// SAMPLE DATA - South Carolina Nonprofits
// ============================================================================

const sampleCharities: Charity[] = [
  {
    id: '1',
    name: 'Harvest Hope Food Bank',
    description: 'Harvest Hope Food Bank is the largest hunger-relief organization in South Carolina, serving 20 counties in the Midlands and Upstate regions.',
    mission: 'To end hunger by engaging, educating and nourishing communities.',
    logoUrl: '',
    imageUrl: '',
    website: 'https://harvesthope.org',
    email: 'info@harvesthope.org',
    phone: '(803) 254-4432',
    address: { street: '2220 Shop Road', city: 'Columbia', state: 'SC', zip: '29201' },
    tier: 'gold',
    transparencyScore: 94,
    impactArea: 'Hunger',
    livesImpacted: 250000,
    projectsActive: 45,
    volunteerHours: 125000,
    totalDonationsReceived: 8500000,
    donorCount: 15000,
    foundedDate: '1981-01-01',
    taxId: '57-0726888',
    teamMembers: [
      { id: '1', name: 'Erinn Rowe', title: 'CEO', role: 'executive', bio: 'Leading Harvest Hope since 2018' },
      { id: '2', name: 'Jim Manning', title: 'COO', role: 'executive' },
      { id: '3', name: 'Sarah Mitchell', title: 'Board Chair', role: 'board' },
    ],
    testimonials: [
      { id: '1', authorName: 'Maria Rodriguez', authorTitle: 'Food Recipient', text: 'Harvest Hope helped my family through the hardest time in our lives. We are forever grateful.', impactStory: 'Fed a family of 5 for 6 months' },
    ],
    financials: { programs: 82, admin: 10, fundraising: 8, annualBudget: 12000000, yearOverYearGrowth: 12 },
    partnerIds: ['2', '3'],
    recentDonations: [
      { amount: 5000, date: '2024-12-10', anonymous: false },
      { amount: 250, date: '2024-12-09', anonymous: true },
      { amount: 1000, date: '2024-12-08', anonymous: false },
    ],
  },
  {
    id: '2',
    name: 'Lowcountry Food Bank',
    description: 'Serving the coastal counties of South Carolina with food distribution and nutrition education programs.',
    mission: 'Leading the effort to end hunger in the Lowcountry.',
    website: 'https://lowcountryfoodbank.org',
    email: 'info@lowcountryfoodbank.org',
    phone: '(843) 747-8146',
    address: { city: 'Charleston', state: 'SC', zip: '29405' },
    tier: 'gold',
    transparencyScore: 92,
    impactArea: 'Hunger',
    livesImpacted: 180000,
    projectsActive: 38,
    volunteerHours: 95000,
    totalDonationsReceived: 6200000,
    donorCount: 11000,
    foundedDate: '1983-01-01',
    teamMembers: [
      { id: '1', name: 'Nick Osborne', title: 'President & CEO', role: 'executive' },
    ],
    testimonials: [],
    financials: { programs: 85, admin: 8, fundraising: 7, annualBudget: 8500000, yearOverYearGrowth: 15 },
    partnerIds: ['1'],
    recentDonations: [],
  },
  {
    id: '3',
    name: 'Palmetto Animal League',
    description: 'A no-kill animal shelter dedicated to finding loving homes for abandoned and surrendered pets.',
    mission: 'To rescue, rehabilitate, and rehome animals in need while promoting responsible pet ownership.',
    website: 'https://palmettoanimaleague.org',
    email: 'info@palmettoanimaleague.org',
    phone: '(843) 645-1725',
    address: { city: 'Okatie', state: 'SC', zip: '29909' },
    tier: 'silver',
    transparencyScore: 88,
    impactArea: 'Animals',
    livesImpacted: 5200,
    projectsActive: 12,
    volunteerHours: 28000,
    totalDonationsReceived: 890000,
    donorCount: 3200,
    foundedDate: '2003-01-01',
    teamMembers: [
      { id: '1', name: 'Jennifer Krese', title: 'Executive Director', role: 'executive' },
    ],
    testimonials: [
      { id: '1', authorName: 'The Thompson Family', text: 'We adopted our best friend from PAL. The staff was wonderful and made the process so easy!' },
    ],
    financials: { programs: 78, admin: 12, fundraising: 10, annualBudget: 1200000, yearOverYearGrowth: 8 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '4',
    name: 'SC Youth Advocate Program',
    description: 'Providing mentoring and support services to at-risk youth across South Carolina.',
    mission: 'Empowering young people to reach their full potential through mentorship and advocacy.',
    website: 'https://scyap.com',
    email: 'info@scyap.com',
    phone: '(803) 744-4381',
    address: { city: 'Columbia', state: 'SC', zip: '29201' },
    tier: 'silver',
    transparencyScore: 85,
    impactArea: 'Youth',
    livesImpacted: 3500,
    projectsActive: 25,
    volunteerHours: 45000,
    totalDonationsReceived: 720000,
    donorCount: 1800,
    foundedDate: '1994-01-01',
    teamMembers: [
      { id: '1', name: 'Lisa Johnson', title: 'Executive Director', role: 'executive' },
    ],
    testimonials: [],
    financials: { programs: 80, admin: 12, fundraising: 8, annualBudget: 950000, yearOverYearGrowth: 5 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '5',
    name: 'Coastal Conservation League',
    description: 'Protecting the Lowcountry\'s natural environment through advocacy, education, and land conservation.',
    mission: 'To protect the Lowcountry\'s natural environment, quality of life, and community character.',
    website: 'https://coastalconservationleague.org',
    email: 'info@scccl.org',
    phone: '(843) 723-8035',
    address: { city: 'Charleston', state: 'SC', zip: '29403' },
    tier: 'gold',
    transparencyScore: 91,
    impactArea: 'Environment',
    livesImpacted: 500000,
    projectsActive: 32,
    volunteerHours: 18000,
    totalDonationsReceived: 3200000,
    donorCount: 8500,
    foundedDate: '1989-01-01',
    teamMembers: [
      { id: '1', name: 'Laura Cantral', title: 'Executive Director', role: 'executive' },
    ],
    testimonials: [],
    financials: { programs: 76, admin: 14, fundraising: 10, annualBudget: 4500000, yearOverYearGrowth: 10 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '6',
    name: 'Habitat for Humanity SC',
    description: 'Building affordable homes and hope for families across South Carolina.',
    mission: 'Seeking to put God\'s love into action by bringing people together to build homes, communities and hope.',
    website: 'https://habitatsc.org',
    email: 'info@habitatsc.org',
    phone: '(803) 252-3570',
    address: { city: 'Columbia', state: 'SC', zip: '29201' },
    tier: 'platinum',
    transparencyScore: 96,
    impactArea: 'Housing',
    livesImpacted: 12000,
    projectsActive: 85,
    volunteerHours: 320000,
    totalDonationsReceived: 15000000,
    donorCount: 25000,
    foundedDate: '1987-01-01',
    teamMembers: [
      { id: '1', name: 'Robert Johnson', title: 'State Director', role: 'executive' },
    ],
    testimonials: [
      { id: '1', authorName: 'The Williams Family', text: 'Thanks to Habitat, we finally have a place to call home. Our children have their own rooms for the first time.', impactStory: 'Family of 4 moved into new home' },
    ],
    financials: { programs: 84, admin: 9, fundraising: 7, annualBudget: 18000000, yearOverYearGrowth: 14 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '7',
    name: 'Free Medical Clinic',
    description: 'Providing free healthcare services to uninsured and underinsured residents of the Midlands.',
    mission: 'To provide quality healthcare to those in need, regardless of their ability to pay.',
    website: 'https://freemedclinic.org',
    email: 'info@freemedclinic.org',
    phone: '(803) 765-1599',
    address: { city: 'Columbia', state: 'SC', zip: '29203' },
    tier: 'silver',
    transparencyScore: 89,
    impactArea: 'Health',
    livesImpacted: 8500,
    projectsActive: 15,
    volunteerHours: 52000,
    totalDonationsReceived: 1800000,
    donorCount: 4200,
    foundedDate: '1992-01-01',
    teamMembers: [
      { id: '1', name: 'Dr. Patricia Smith', title: 'Medical Director', role: 'executive' },
    ],
    testimonials: [],
    financials: { programs: 88, admin: 7, fundraising: 5, annualBudget: 2500000, yearOverYearGrowth: 6 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '8',
    name: 'Carolina Youth Development Center',
    description: 'Transforming the lives of children and families through residential care, education, and community programs.',
    mission: 'To transform and heal young lives through safety, care, and education.',
    website: 'https://cydc.org',
    email: 'info@cydc.org',
    phone: '(843) 266-5100',
    address: { city: 'North Charleston', state: 'SC', zip: '29406' },
    tier: 'silver',
    transparencyScore: 87,
    impactArea: 'Youth',
    livesImpacted: 1200,
    projectsActive: 18,
    volunteerHours: 15000,
    totalDonationsReceived: 950000,
    donorCount: 2100,
    foundedDate: '1983-01-01',
    teamMembers: [],
    testimonials: [],
    financials: { programs: 82, admin: 11, fundraising: 7, annualBudget: 1400000, yearOverYearGrowth: 4 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '9',
    name: 'Charleston Symphony Orchestra',
    description: 'Enriching lives through orchestral music performances and education throughout the Lowcountry.',
    mission: 'To inspire, educate, and connect the community through the power of orchestral music.',
    website: 'https://charlestonsymphony.org',
    email: 'info@charlestonsymphony.org',
    phone: '(843) 723-7528',
    address: { city: 'Charleston', state: 'SC', zip: '29401' },
    tier: 'bronze',
    transparencyScore: 82,
    impactArea: 'Arts',
    livesImpacted: 85000,
    projectsActive: 8,
    volunteerHours: 5000,
    totalDonationsReceived: 420000,
    donorCount: 1500,
    foundedDate: '1936-01-01',
    teamMembers: [],
    testimonials: [],
    financials: { programs: 72, admin: 15, fundraising: 13, annualBudget: 650000, yearOverYearGrowth: 3 },
    partnerIds: [],
    recentDonations: [],
  },
  {
    id: '10',
    name: 'United Way of the Midlands',
    description: 'Uniting people, resources, and organizations to improve lives across the Midlands of South Carolina.',
    mission: 'To unite our community to improve lives and create lasting change.',
    website: 'https://uway.org',
    email: 'info@uway.org',
    phone: '(803) 733-5400',
    address: { city: 'Columbia', state: 'SC', zip: '29201' },
    tier: 'platinum',
    transparencyScore: 95,
    impactArea: 'Community',
    livesImpacted: 350000,
    projectsActive: 120,
    volunteerHours: 180000,
    totalDonationsReceived: 22000000,
    donorCount: 45000,
    foundedDate: '1923-01-01',
    teamMembers: [
      { id: '1', name: 'Sara Fawcett', title: 'President & CEO', role: 'executive' },
    ],
    testimonials: [],
    financials: { programs: 86, admin: 8, fundraising: 6, annualBudget: 28000000, yearOverYearGrowth: 8 },
    partnerIds: ['1', '4', '6'],
    recentDonations: [],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CharityHub: React.FC<CharityHubProps> = ({
  donations,
  volunteers,
  clients,
  onNavigateToView,
  onSetPage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<CharityTier | 'all'>('all');
  const [selectedImpactArea, setSelectedImpactArea] = useState<ImpactArea | 'all'>('all');
  const [sortBy, setSortBy] = useState<'donations' | 'impact' | 'name' | 'transparency'>('donations');
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'charities' | 'donor-journey'>('charities');

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueDonors = new Set(donations.map((d) => d.donorName)).size;
    const activeVolunteers = volunteers.filter((v) => v.availability !== 'unavailable').length;
    const totalCharities = sampleCharities.length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyDonations = donations.filter((d) => new Date(d.donationDate) >= thisMonth);
    const monthlyTotal = monthlyDonations.reduce((sum, d) => sum + d.amount, 0);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDonations = donations.filter((d) => {
      const date = new Date(d.donationDate);
      return date >= lastMonth && date < thisMonth;
    });
    const lastMonthTotal = lastMonthDonations.reduce((sum, d) => sum + d.amount, 0);
    const growth = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return { totalDonations, uniqueDonors, activeVolunteers, totalCharities, monthlyTotal, growth };
  }, [donations, volunteers]);

  // Filter and sort charities
  const filteredCharities = useMemo(() => {
    let result = [...sampleCharities];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.mission.toLowerCase().includes(query) ||
          c.address.city.toLowerCase().includes(query)
      );
    }

    // Tier filter
    if (selectedTier !== 'all') {
      result = result.filter((c) => c.tier === selectedTier);
    }

    // Impact area filter
    if (selectedImpactArea !== 'all') {
      result = result.filter((c) => c.impactArea === selectedImpactArea);
    }

    // Sort
    switch (sortBy) {
      case 'donations':
        result.sort((a, b) => b.totalDonationsReceived - a.totalDonationsReceived);
        break;
      case 'impact':
        result.sort((a, b) => b.livesImpacted - a.livesImpacted);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'transparency':
        result.sort((a, b) => b.transparencyScore - a.transparencyScore);
        break;
    }

    return result;
  }, [searchQuery, selectedTier, selectedImpactArea, sortBy]);

  // AI Insights
  const insights = useMemo(() => {
    const messages: Array<{ type: 'success' | 'warning' | 'info'; message: string }> = [];

    if (metrics.growth > 10) {
      messages.push({ type: 'success', message: `Donations up ${metrics.growth.toFixed(1)}% this month! Great momentum!` });
    }

    const goldCharities = sampleCharities.filter((c) => c.tier === 'gold' || c.tier === 'platinum').length;
    messages.push({ type: 'info', message: `${goldCharities} high-performing charities in the network` });

    const totalImpact = sampleCharities.reduce((sum, c) => sum + c.livesImpacted, 0);
    messages.push({ type: 'success', message: `Combined impact: ${totalImpact.toLocaleString()} lives touched` });

    return messages;
  }, [metrics]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 dark:text-white">
            <Heart className="w-8 h-8 text-rose-500" />
            Charity Hub
          </h1>
          <p className="text-gray-600 mt-1 dark:text-gray-400">
            Discover and support South Carolina nonprofits making a difference
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Charity
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('charities')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'charities'
              ? 'text-rose-600 border-b-2 border-rose-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Partner Charities
          </div>
        </button>
        <button
          onClick={() => setActiveTab('donor-journey')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'donor-journey'
              ? 'text-rose-600 border-b-2 border-rose-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Donor Journey
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'donor-journey' ? (
        <DonorJourneyTracker />
      ) : (
        <>
        {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/30 p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Network Insights</h3>
              {insights.map((insight, idx) => (
                <div key={idx} className={`text-sm ${insight.type === 'success' ? 'text-green-700 dark:text-green-400' : insight.type === 'warning' ? 'text-orange-700 dark:text-orange-400' : 'text-blue-700 dark:text-blue-400'}`}>
                  • {insight.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Building} label="Partner Charities" value={metrics.totalCharities.toString()} gradient="from-rose-500 to-pink-600" />
        <MetricCard icon={DollarSign} label="Total Raised" value={`$${(sampleCharities.reduce((s, c) => s + c.totalDonationsReceived, 0) / 1000000).toFixed(1)}M`} gradient="from-green-500 to-emerald-600" />
        <MetricCard icon={Users} label="Lives Impacted" value={`${(sampleCharities.reduce((s, c) => s + c.livesImpacted, 0) / 1000).toFixed(0)}K+`} gradient="from-blue-500 to-cyan-600" />
        <MetricCard icon={Target} label="Active Projects" value={sampleCharities.reduce((s, c) => s + c.projectsActive, 0).toString()} gradient="from-purple-500 to-indigo-600" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search charities by name, mission, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as CharityTier | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Tiers</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>

          {/* Impact Area Filter */}
          <select
            value={selectedImpactArea}
            onChange={(e) => setSelectedImpactArea(e.target.value as ImpactArea | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Impact Areas</option>
            {Object.keys(impactAreaColors).map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
          >
            <option value="donations">Highest Donations</option>
            <option value="impact">Most Impact</option>
            <option value="transparency">Top Transparency</option>
            <option value="name">A-Z</option>
          </select>
        </div>

        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCharities.length} of {sampleCharities.length} charities
        </div>
      </div>

      {/* Charity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map((charity) => (
          <CharityTile
            key={charity.id}
            charity={charity}
            onClick={() => setSelectedCharity(charity)}
          />
        ))}
      </div>

      {filteredCharities.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg">No charities match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
      </>
      )}

      {/* Detail Modal */}
      {selectedCharity && (
        <CharityDetailModal
          charity={selectedCharity}
          allCharities={sampleCharities}
          onClose={() => setSelectedCharity(null)}
          onDonate={() => onSetPage?.('donations')}
        />
      )}

      {/* Add Charity Dialog */}
      {showAddDialog && (
        <AddCharityDialog onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
};

// ============================================================================
// CHARITY TILE COMPONENT
// ============================================================================

interface CharityTileProps {
  charity: Charity;
  onClick: () => void;
}

const CharityTile: React.FC<CharityTileProps> = ({ charity, onClick }) => {
  const tier = tierConfig[charity.tier];

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 ${tier.borderColor} p-5 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xl font-bold">
            {charity.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{charity.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              {charity.address.city}, {charity.address.state}
            </div>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-bold ${tier.bgColor}`}
          style={{ color: tier.color }}
        >
          {tier.label}
        </div>
      </div>

      {/* Impact Area Badge */}
      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${impactAreaColors[charity.impactArea]}`}>
        {charity.impactArea}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
        {charity.mission}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${(charity.totalDonationsReceived / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Raised</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {charity.donorCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Donors</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {charity.transparencyScore}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Trust</div>
        </div>
      </div>

      {/* Transparency Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Transparency Score</span>
          <span>{charity.transparencyScore}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${charity.transparencyScore}%`,
              backgroundColor: charity.transparencyScore >= 90 ? '#22c55e' : charity.transparencyScore >= 75 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition flex items-center justify-center gap-1">
          <Heart className="w-4 h-4" />
          Donate
        </button>
        <button className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1 text-gray-700 dark:text-gray-300">
          Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// CHARITY DETAIL MODAL
// ============================================================================

interface CharityDetailModalProps {
  charity: Charity;
  allCharities: Charity[];
  onClose: () => void;
  onDonate: () => void;
}

const CharityDetailModal: React.FC<CharityDetailModalProps> = ({ charity, allCharities, onClose, onDonate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'financials' | 'team' | 'donations' | 'network'>('overview');
  const tier = tierConfig[charity.tier];

  const partners = allCharities.filter((c) => charity.partnerIds.includes(c.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-rose-500 to-pink-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
            <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center text-rose-500 text-3xl font-bold">
              {charity.name.charAt(0)}
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{charity.name}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold bg-white/20`}
                  style={{ color: tier.color }}
                >
                  {tier.label}
                </span>
              </div>
              <p className="text-rose-100 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {charity.address.city}, {charity.address.state}
              </p>
            </div>
            <button
              onClick={onDonate}
              className="px-6 py-3 bg-white text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition"
            >
              Donate Now
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {(['overview', 'impact', 'financials', 'team', 'donations', 'network'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mission</h3>
                <p className="text-gray-600 dark:text-gray-400">{charity.mission}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400">{charity.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={Calendar} label="Founded" value={new Date(charity.foundedDate).getFullYear().toString()} />
                <InfoItem icon={Globe} label="Website" value={charity.website ? 'Visit Site' : 'N/A'} link={charity.website} />
                <InfoItem icon={Mail} label="Email" value={charity.email || 'N/A'} />
                <InfoItem icon={Phone} label="Phone" value={charity.phone || 'N/A'} />
              </div>
              <div className={`p-4 rounded-lg ${impactAreaColors[charity.impactArea]}`}>
                <div className="font-bold">Impact Area: {charity.impactArea}</div>
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImpactCard icon={Users} value={charity.livesImpacted.toLocaleString()} label="Lives Impacted" color="text-blue-500" />
                <ImpactCard icon={Briefcase} value={charity.projectsActive.toString()} label="Active Projects" color="text-green-500" />
                <ImpactCard icon={Activity} value={charity.volunteerHours.toLocaleString()} label="Volunteer Hours" color="text-purple-500" />
              </div>

              {charity.testimonials.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Impact Stories</h3>
                  <div className="space-y-4">
                    {charity.testimonials.map((t) => (
                      <div key={t.id} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <Quote className="w-8 h-8 text-rose-300 mb-2" />
                        <p className="text-gray-700 dark:text-gray-300 italic mb-3">&quot;{t.text}&quot;</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{t.authorName}</div>
                            {t.authorTitle && <div className="text-sm text-gray-500 dark:text-gray-400">{t.authorTitle}</div>}
                          </div>
                          {t.impactStory && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                              {t.impactStory}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Annual Budget</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(charity.financials.annualBudget / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Year-over-Year Growth</div>
                  <div className="text-2xl font-bold text-green-600">
                    +{charity.financials.yearOverYearGrowth}%
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Budget Allocation</h3>
                <div className="space-y-3">
                  <BudgetBar label="Programs" percentage={charity.financials.programs} color="bg-green-500" />
                  <BudgetBar label="Administration" percentage={charity.financials.admin} color="bg-blue-500" />
                  <BudgetBar label="Fundraising" percentage={charity.financials.fundraising} color="bg-purple-500" />
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                  <Award className="w-5 h-5" />
                  High Program Efficiency
                </div>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  {charity.financials.programs}% of funds go directly to programs
                </p>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              {charity.teamMembers.length > 0 ? (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Leadership</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {charity.teamMembers.filter((m) => m.role === 'executive').map((member) => (
                        <TeamMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                  {charity.teamMembers.filter((m) => m.role === 'board').length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Board of Directors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {charity.teamMembers.filter((m) => m.role === 'board').map((member) => (
                          <TeamMemberCard key={member.id} member={member} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>Team information coming soon</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Received</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${charity.totalDonationsReceived.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Donors</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {charity.donorCount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Donation Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DonationTierCard amount={25} impact="Feeds a family for a week" />
                  <DonationTierCard amount={100} impact="Provides school supplies for 5 children" featured />
                  <DonationTierCard amount={500} impact="Sponsors a month of programming" />
                </div>
              </div>

              <button
                onClick={onDonate}
                className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold text-lg hover:bg-rose-600 transition flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Make a Donation
              </button>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-6">
              {partners.length > 0 ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Partner Organizations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partners.map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold">
                          {partner.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{partner.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{partner.impactArea}</div>
                        </div>
                        <Share2 className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No partnerships listed yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADD CHARITY DIALOG
// ============================================================================

interface AddCharityDialogProps {
  onClose: () => void;
}

const AddCharityDialog: React.FC<AddCharityDialogProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    mission: '',
    website: '',
    city: '',
    state: 'SC',
    impactArea: 'Community' as ImpactArea,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would save to database here
    alert('Charity added! (Demo mode - data not persisted)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Charity</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            New charities start at Bronze tier
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
              placeholder="Enter charity name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mission Statement *
            </label>
            <textarea
              required
              rows={3}
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
              placeholder="Describe the organization's mission"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Impact Area *
            </label>
            <select
              value={formData.impactArea}
              onChange={(e) => setFormData({ ...formData, impactArea: e.target.value as ImpactArea })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
            >
              {Object.keys(impactAreaColors).map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium"
            >
              Add Charity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const MetricCard: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: string; gradient: string }> = ({
  icon: Icon,
  label,
  value,
  gradient,
}) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg text-white p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white/80 text-sm font-medium">{label}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
      </div>
      <Icon className="w-12 h-12 text-white/30" />
    </div>
  </div>
);

const InfoItem: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: string; link?: string }> = ({
  icon: Icon,
  label,
  value,
  link,
}) => (
  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
      <Icon className="w-4 h-4" />
      <span className="text-xs">{label}</span>
    </div>
    {link ? (
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1">
        {value}
        <ExternalLink className="w-3 h-3" />
      </a>
    ) : (
      <div className="font-medium text-gray-900 dark:text-white text-sm">{value}</div>
    )}
  </div>
);

const ImpactCard: React.FC<{ icon: React.FC<{ className?: string }>; value: string; label: string; color: string }> = ({
  icon: Icon,
  value,
  label,
  color,
}) => (
  <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
    <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
    <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
  </div>
);

const BudgetBar: React.FC<{ label: string; percentage: number; color: string }> = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{percentage}%</span>
    </div>
    <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold">
      {member.name.split(' ').map((n) => n[0]).join('')}
    </div>
    <div>
      <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{member.title}</div>
    </div>
  </div>
);

const DonationTierCard: React.FC<{ amount: number; impact: string; featured?: boolean }> = ({ amount, impact, featured }) => (
  <div className={`p-4 rounded-lg border-2 ${featured ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-200 dark:border-slate-700'}`}>
    {featured && <div className="text-xs text-rose-600 dark:text-rose-400 font-bold mb-2">MOST POPULAR</div>}
    <div className="text-2xl font-bold text-gray-900 dark:text-white">${amount}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{impact}</div>
  </div>
);

export default CharityHub;
