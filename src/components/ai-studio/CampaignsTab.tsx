import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea, Input } from '../ui/Input';
import { Select, RadioGroup } from '../ui/Select';
import { GeneratedContentCard } from './GeneratedContentCard';
import { ContentPreview } from './ContentPreview';
import { DataSourceSelector, type SelectedData } from './DataSourceSelector';
import { 
  generateNewsletterSection,
  generateSocialPost,
  generateEventMaterials
} from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import type { Project, Event } from '../../types';
import { 
  Newspaper, 
  Share2, 
  Calendar,
  Sparkles,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Copy,
  RefreshCw
} from 'lucide-react';

/**
 * CampaignsTab
 * ============
 * Generate marketing and outreach content including:
 * - Newsletter sections with impact metrics
 * - Social media posts for multiple platforms
 * - Event materials (invitations, programs, follow-ups)
 */

// Campaign type configuration
const campaignTypes = [
  {
    id: 'newsletter',
    label: 'Newsletter Builder',
    description: 'Create newsletter sections highlighting your work',
    icon: <Newspaper className="w-5 h-5" />,
    color: 'var(--aurora-teal)',
  },
  {
    id: 'social',
    label: 'Social Media Posts',
    description: 'Generate platform-specific social content',
    icon: <Share2 className="w-5 h-5" />,
    color: 'var(--aurora-cyan)',
  },
  {
    id: 'event',
    label: 'Event Materials',
    description: 'Create invitations, programs, and follow-ups',
    icon: <Calendar className="w-5 h-5" />,
    color: 'var(--aurora-pink)',
  },
];

// Social platform configuration
const socialPlatforms = [
  { id: 'twitter', label: 'Twitter/X', icon: <Twitter className="w-4 h-4" />, maxLength: 280 },
  { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" />, maxLength: 500 },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, maxLength: 700 },
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, maxLength: 2200 },
];

// Newsletter section types
const newsletterSections = [
  { value: 'impact', label: 'Impact Highlights' },
  { value: 'stories', label: 'Success Stories' },
  { value: 'updates', label: 'Project Updates' },
  { value: 'upcoming', label: 'Upcoming Events' },
  { value: 'cta', label: 'Call to Action' },
];

// Event material types
const eventMaterialTypes = [
  { value: 'invitation', label: 'Event Invitation' },
  { value: 'program', label: 'Event Program' },
  { value: 'reminder', label: 'Event Reminder' },
  { value: 'followup', label: 'Post-Event Follow-up' },
  { value: 'thankyou', label: 'Thank You Note' },
];

export const CampaignsTab: React.FC = () => {
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedData, setSelectedData] = useState<SelectedData>({
    contacts: [],
    projects: [],
    donations: [],
    cases: [],
  });

  // Form state
  const [campaignType, setCampaignType] = useState('newsletter');
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [newsletterSection, setNewsletterSection] = useState('impact');
  const [eventMaterialType, setEventMaterialType] = useState('invitation');
  const [customPrompt, setCustomPrompt] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [socialPosts, setSocialPosts] = useState<Record<string, string>>({});

  // Fetch projects and events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .order('name')
          .limit(50);
        if (projectsData) setProjects(projectsData);

        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: false })
          .limit(50);
        if (eventsData) setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Generate content based on type
  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent('');

    try {
      switch (campaignType) {
        case 'newsletter': {
          const selectedProjects = selectedData.projects as Project[];
          const metrics = {
            totalProjects: selectedProjects.length,
            projectNames: selectedProjects.map(p => p.name).join(', '),
          };
          const result = await generateNewsletterSection(
            selectedProjects,
            metrics,
            newsletterSection,
            customPrompt
          );
          setGeneratedContent(result);
          break;
        }
        case 'social': {
          // Generate for all platforms at once
          const newPosts: Record<string, string> = {};
          for (const platform of socialPlatforms) {
            const result = await generateSocialPost(
              customPrompt || 'Share our latest impact and updates',
              platform.id as 'twitter' | 'facebook' | 'linkedin' | 'instagram',
              selectedData.projects[0] as Project | undefined
            );
            newPosts[platform.id] = result;
          }
          setSocialPosts(newPosts);
          setGeneratedContent(newPosts[selectedPlatform] || '');
          break;
        }
        case 'event': {
          const eventDetails = {
            name: eventName || 'Our Event',
            date: eventDate || 'TBD',
            location: eventLocation || 'TBD',
          };
          const result = await generateEventMaterials(
            eventDetails,
            eventMaterialType,
            customPrompt
          );
          setGeneratedContent(result);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('An error occurred while generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate single platform
  const handleRegeneratePlatform = async (platformId: string) => {
    setIsLoading(true);
    try {
      const result = await generateSocialPost(
        customPrompt || 'Share our latest impact and updates',
        platformId as 'twitter' | 'facebook' | 'linkedin' | 'instagram',
        selectedData.projects[0] as Project | undefined
      );
      setSocialPosts(prev => ({ ...prev, [platformId]: result }));
      if (platformId === selectedPlatform) {
        setGeneratedContent(result);
      }
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentType = campaignTypes.find(t => t.id === campaignType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 
          className="text-xl font-semibold"
          style={{ color: 'var(--cmf-text)' }}
        >
          Campaign Content
        </h2>
        <p 
          className="text-sm mt-1"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          Create newsletters, social media posts, and event materials powered by your CRM data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Campaign Type Selection */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
              <CardDescription>Select what type of content to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {campaignTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCampaignType(type.id)}
                    className={`
                      p-4 rounded-xl text-left transition-all duration-200
                      ${campaignType === type.id ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{
                      backgroundColor: campaignType === type.id 
                        ? 'var(--cmf-accent-subtle)' 
                        : 'var(--cmf-surface-2)',
                      ringColor: type.color,
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: type.color, color: '#0f172a' }}
                    >
                      {type.icon}
                    </div>
                    <p 
                      className="font-medium"
                      style={{ color: 'var(--cmf-text)' }}
                    >
                      {type.label}
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'var(--cmf-text-muted)' }}
                    >
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Type-specific Options */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>
                {campaignType === 'newsletter' && 'Newsletter Options'}
                {campaignType === 'social' && 'Social Media Options'}
                {campaignType === 'event' && 'Event Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Newsletter Options */}
              {campaignType === 'newsletter' && (
                <>
                  <Select
                    label="Section Type"
                    options={newsletterSections}
                    value={newsletterSection}
                    onChange={(e) => setNewsletterSection(e.target.value)}
                    fullWidth
                  />
                  <DataSourceSelector
                    sources={['projects']}
                    projects={projects}
                    onSelect={setSelectedData}
                    multiple={true}
                  />
                </>
              )}

              {/* Social Media Options */}
              {campaignType === 'social' && (
                <>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--cmf-text-secondary)' }}
                    >
                      Platform
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {socialPlatforms.map((platform) => (
                        <Button
                          key={platform.id}
                          variant={selectedPlatform === platform.id ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedPlatform(platform.id);
                            if (socialPosts[platform.id]) {
                              setGeneratedContent(socialPosts[platform.id]);
                            }
                          }}
                          leftIcon={platform.icon}
                        >
                          {platform.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DataSourceSelector
                    sources={['projects']}
                    projects={projects}
                    onSelect={setSelectedData}
                    multiple={false}
                  />
                </>
              )}

              {/* Event Options */}
              {campaignType === 'event' && (
                <>
                  <Select
                    label="Material Type"
                    options={eventMaterialTypes}
                    value={eventMaterialType}
                    onChange={(e) => setEventMaterialType(e.target.value)}
                    fullWidth
                  />
                  <Input
                    label="Event Name"
                    placeholder="Annual Gala 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    fullWidth
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      fullWidth
                    />
                    <Input
                      label="Location"
                      placeholder="City Convention Center"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      fullWidth
                    />
                  </div>
                </>
              )}

              {/* Custom Prompt */}
              <Textarea
                label="Additional Instructions"
                placeholder="Add any specific details, tone preferences, or key messages to include..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                fullWidth
              />

              {/* Generate Button */}
              <Button
                variant="aurora"
                onClick={handleGenerate}
                disabled={isLoading}
                isLoading={isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
                fullWidth
              >
                {isLoading ? 'Generating...' : `Generate ${currentType?.label}`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          {/* Social Media Multi-Platform Preview */}
          {campaignType === 'social' && Object.keys(socialPosts).length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>All Platform Posts</CardTitle>
                <CardDescription>Generated posts for each platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialPlatforms.map((platform) => {
                  const content = socialPosts[platform.id];
                  if (!content) return null;
                  
                  const isOverLimit = content.length > platform.maxLength;
                  
                  return (
                    <div 
                      key={platform.id}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {platform.icon}
                          <span 
                            className="font-medium text-sm"
                            style={{ color: 'var(--cmf-text)' }}
                          >
                            {platform.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`text-xs px-2 py-1 rounded ${
                              isOverLimit 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {content.length}/{platform.maxLength}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegeneratePlatform(platform.id)}
                            disabled={isLoading}
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      <p 
                        className="text-sm whitespace-pre-wrap"
                        style={{ color: 'var(--cmf-text-secondary)' }}
                      >
                        {content}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Standard Content Preview */}
          {(campaignType !== 'social' || Object.keys(socialPosts).length === 0) && (
            <Card variant="elevated" className="sticky top-6">
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  {currentType?.label} preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GeneratedContentCard
                  title={currentType?.label || 'Content'}
                  content={generatedContent}
                  isLoading={isLoading}
                  onRegenerate={handleGenerate}
                  format={campaignType === 'social' ? 'social' : 'plain'}
                  showActions={!!generatedContent}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignsTab;
