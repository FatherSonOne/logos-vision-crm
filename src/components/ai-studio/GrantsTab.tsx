import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea, Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { GeneratedContentCard } from './GeneratedContentCard';
import { DataSourceSelector, type SelectedData } from './DataSourceSelector';
import { 
  generateGrantNarrative,
  generateImpactStory
} from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import type { Project, Case, Client, Donation } from '../../types';
import { 
  FileText, 
  BookOpen, 
  Target,
  Sparkles,
  Building,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

/**
 * GrantsTab
 * =========
 * Generate grant proposal content including:
 * - Grant narrative sections
 * - Impact story builder
 * - Proposal sections (org history, needs statement, etc.)
 */

// Grant content type configuration
const grantTypes = [
  {
    id: 'narrative',
    label: 'Grant Narrative',
    description: 'Generate compelling narrative sections for proposals',
    icon: <FileText className="w-5 h-5" />,
    color: 'var(--aurora-teal)',
  },
  {
    id: 'impact-story',
    label: 'Impact Story',
    description: 'Create powerful stories from case data',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'var(--aurora-pink)',
  },
  {
    id: 'proposal-section',
    label: 'Proposal Section',
    description: 'Generate standard proposal sections',
    icon: <Target className="w-5 h-5" />,
    color: 'var(--aurora-cyan)',
  },
];

// Narrative section types
const narrativeSections = [
  { value: 'need', label: 'Statement of Need' },
  { value: 'solution', label: 'Proposed Solution' },
  { value: 'goals', label: 'Goals & Objectives' },
  { value: 'methods', label: 'Methods & Timeline' },
  { value: 'evaluation', label: 'Evaluation Plan' },
  { value: 'sustainability', label: 'Sustainability Plan' },
  { value: 'budget', label: 'Budget Narrative' },
];

// Standard proposal sections
const proposalSections = [
  { value: 'org-history', label: 'Organization History' },
  { value: 'mission', label: 'Mission & Vision' },
  { value: 'capacity', label: 'Organizational Capacity' },
  { value: 'track-record', label: 'Track Record' },
  { value: 'leadership', label: 'Leadership Team' },
  { value: 'partnerships', label: 'Partnerships & Collaborations' },
];

export const GrantsTab: React.FC = () => {
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedData, setSelectedData] = useState<SelectedData>({
    contacts: [],
    projects: [],
    donations: [],
    cases: [],
  });

  // Form state
  const [grantType, setGrantType] = useState('narrative');
  const [narrativeSection, setNarrativeSection] = useState('need');
  const [proposalSection, setProposalSection] = useState('org-history');
  const [grantorName, setGrantorName] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [projectFocus, setProjectFocus] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, casesRes, clientsRes, donationsRes] = await Promise.all([
          supabase.from('projects').select('*').order('name').limit(50),
          supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('clients').select('*').order('name').limit(100),
          supabase.from('donations').select('*').order('date', { ascending: false }).limit(100),
        ]);
        
        if (projectsRes.data) setProjects(projectsRes.data);
        if (casesRes.data) setCases(casesRes.data);
        if (clientsRes.data) setClients(clientsRes.data);
        if (donationsRes.data) setDonations(donationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Build context data from selections
  const buildContextData = (): string => {
    const parts: string[] = [];
    
    if (selectedData.projects.length > 0) {
      parts.push('**Selected Projects:**\n' + 
        selectedData.projects.map((p: Project) => 
          `- ${p.name}: ${p.description || 'No description'} (Status: ${p.status})`
        ).join('\n')
      );
    }
    
    if (selectedData.cases.length > 0) {
      parts.push('**Related Cases:**\n' + 
        selectedData.cases.map((c: Case) => 
          `- ${c.title}: ${c.description || 'No description'}`
        ).join('\n')
      );
    }
    
    if (selectedData.donations.length > 0) {
      const totalDonations = selectedData.donations.reduce(
        (sum: number, d: Donation) => sum + (d.amount || 0), 0
      );
      parts.push(`**Donation Context:**\n- Total from selected donations: $${totalDonations.toLocaleString()}`);
    }
    
    if (grantorName) {
      parts.push(`**Target Grantor:** ${grantorName}`);
    }
    
    if (grantAmount) {
      parts.push(`**Requested Amount:** $${grantAmount}`);
    }
    
    if (projectFocus) {
      parts.push(`**Project Focus:** ${projectFocus}`);
    }
    
    return parts.join('\n\n');
  };

  // Generate content based on type
  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent('');

    try {
      const contextData = buildContextData();

      switch (grantType) {
        case 'narrative': {
          const sectionLabel = narrativeSections.find(s => s.value === narrativeSection)?.label;
          const prompt = `Generate a ${sectionLabel} section for a grant proposal. ${customPrompt}`;
          const result = await generateGrantNarrative(prompt, contextData);
          setGeneratedContent(result);
          break;
        }
        case 'impact-story': {
          const selectedCase = selectedData.cases[0] as Case | undefined;
          const selectedProject = selectedData.projects[0] as Project | undefined;
          
          if (!selectedCase && !selectedProject) {
            setGeneratedContent('Please select a case or project to generate an impact story.');
            break;
          }
          
          const result = await generateImpactStory(
            selectedCase || { title: 'General Impact', description: customPrompt },
            selectedProject,
            customPrompt
          );
          setGeneratedContent(result);
          break;
        }
        case 'proposal-section': {
          const sectionLabel = proposalSections.find(s => s.value === proposalSection)?.label;
          const prompt = `Generate the "${sectionLabel}" section for a grant proposal. Make it compelling and data-driven. ${customPrompt}`;
          const result = await generateGrantNarrative(prompt, contextData);
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

  const currentType = grantTypes.find(t => t.id === grantType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 
          className="text-xl font-semibold"
          style={{ color: 'var(--cmf-text)' }}
        >
          Grant Writing Assistant
        </h2>
        <p 
          className="text-sm mt-1"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          Generate grant narratives, impact stories, and proposal sections using your CRM data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Grant Content Type Selection */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
              <CardDescription>Select what type of grant content to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {grantTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGrantType(type.id)}
                    className={`
                      p-4 rounded-xl text-left transition-all duration-200
                      ${grantType === type.id ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{
                      backgroundColor: grantType === type.id 
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
                {grantType === 'narrative' && 'Narrative Section'}
                {grantType === 'impact-story' && 'Impact Story Options'}
                {grantType === 'proposal-section' && 'Proposal Section'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Narrative Section Selection */}
              {grantType === 'narrative' && (
                <Select
                  label="Section Type"
                  options={narrativeSections}
                  value={narrativeSection}
                  onChange={(e) => setNarrativeSection(e.target.value)}
                  fullWidth
                />
              )}

              {/* Proposal Section Selection */}
              {grantType === 'proposal-section' && (
                <Select
                  label="Section Type"
                  options={proposalSections}
                  value={proposalSection}
                  onChange={(e) => setProposalSection(e.target.value)}
                  fullWidth
                />
              )}

              {/* Grant Details */}
              {(grantType === 'narrative' || grantType === 'proposal-section') && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Grantor Name"
                    placeholder="Foundation name"
                    value={grantorName}
                    onChange={(e) => setGrantorName(e.target.value)}
                    leftIcon={<Building className="w-4 h-4" />}
                    fullWidth
                  />
                  <Input
                    label="Requested Amount"
                    placeholder="50,000"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    leftIcon={<span style={{ color: 'var(--cmf-text-muted)' }}>$</span>}
                    fullWidth
                  />
                </div>
              )}

              {/* Project Focus */}
              {grantType !== 'impact-story' && (
                <Input
                  label="Project Focus"
                  placeholder="Youth education and mentorship programs"
                  value={projectFocus}
                  onChange={(e) => setProjectFocus(e.target.value)}
                  fullWidth
                />
              )}

              {/* Data Source Selection */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--cmf-text-secondary)' }}
                >
                  CRM Data Context
                </label>
                <DataSourceSelector
                  sources={grantType === 'impact-story' 
                    ? ['cases', 'projects'] 
                    : ['projects', 'donations', 'cases']
                  }
                  projects={projects}
                  cases={cases}
                  donations={donations}
                  onSelect={setSelectedData}
                  multiple={grantType !== 'impact-story'}
                />
              </div>

              {/* Custom Prompt */}
              <Textarea
                label="Additional Instructions"
                placeholder={
                  grantType === 'impact-story'
                    ? "Add specific details about the impact, outcomes, or personal story elements to highlight..."
                    : "Add any specific requirements, focus areas, or key points to include..."
                }
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
        <div>
          <Card variant="elevated" className="sticky top-6">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                {grantType === 'narrative' && (
                  narrativeSections.find(s => s.value === narrativeSection)?.label
                )}
                {grantType === 'impact-story' && 'Impact Story'}
                {grantType === 'proposal-section' && (
                  proposalSections.find(s => s.value === proposalSection)?.label
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Context Summary */}
              {(selectedData.projects.length > 0 || selectedData.cases.length > 0) && (
                <div 
                  className="mb-4 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                >
                  <p 
                    className="text-xs font-medium uppercase tracking-wide mb-2"
                    style={{ color: 'var(--cmf-text-muted)' }}
                  >
                    Data Context
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedData.projects.map((p: Project) => (
                      <span 
                        key={p.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: 'var(--aurora-teal)',
                          color: '#0f172a'
                        }}
                      >
                        <Target className="w-3 h-3" />
                        {p.name}
                      </span>
                    ))}
                    {selectedData.cases.map((c: Case) => (
                      <span 
                        key={c.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: 'var(--aurora-pink)',
                          color: '#0f172a'
                        }}
                      >
                        <Users className="w-3 h-3" />
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <GeneratedContentCard
                title={currentType?.label || 'Content'}
                content={generatedContent}
                isLoading={isLoading}
                onRegenerate={handleGenerate}
                format="narrative"
                showActions={!!generatedContent}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrantsTab;
