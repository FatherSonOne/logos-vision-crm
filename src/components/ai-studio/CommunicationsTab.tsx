import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Select, RadioGroup } from '../ui/Select';
import { GeneratedContentCard } from './GeneratedContentCard';
import { DataSourceSelector, type SelectedData } from './DataSourceSelector';
import { 
  generateDonorThankYou, 
  generateAppealLetter, 
  generateFollowUpEmail 
} from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import type { Client, Donation } from '../../types';
import { 
  Heart, 
  Mail, 
  MessageSquare, 
  Sparkles,
  User,
  Gift,
  TrendingUp
} from 'lucide-react';

/**
 * CommunicationsTab
 * =================
 * Generate personalized donor communications including:
 * - Thank-you letters for donations
 * - Appeal letters for fundraising
 * - Follow-up emails for engagement
 */

// Communication type configuration
const communicationTypes = [
  {
    id: 'thank-you',
    label: 'Donor Thank You',
    description: 'Generate a personalized thank-you letter for a donation',
    icon: <Heart className="w-5 h-5" />,
    color: 'var(--aurora-pink)',
  },
  {
    id: 'appeal',
    label: 'Appeal Letter',
    description: 'Create a compelling fundraising appeal letter',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'var(--aurora-teal)',
  },
  {
    id: 'follow-up',
    label: 'Follow-Up Email',
    description: 'Draft a follow-up email to re-engage a contact',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'var(--aurora-cyan)',
  },
];

// Tone options for communications
const toneOptions = [
  { value: 'formal', label: 'Formal', helperText: 'Professional and business-like' },
  { value: 'warm', label: 'Warm', helperText: 'Friendly and personal' },
  { value: 'casual', label: 'Casual', helperText: 'Relaxed and conversational' },
];

export const CommunicationsTab: React.FC = () => {
  // Data state
  const [contacts, setContacts] = useState<Client[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedData, setSelectedData] = useState<SelectedData>({
    contacts: [],
    projects: [],
    donations: [],
    cases: [],
  });

  // Form state
  const [communicationType, setCommunicationType] = useState('thank-you');
  const [tone, setTone] = useState('warm');
  const [customPrompt, setCustomPrompt] = useState('');
  const [senderName, setSenderName] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');

  // Fetch contacts and donations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contacts
        const { data: contactsData } = await supabase
          .from('clients')
          .select('*')
          .order('name')
          .limit(100);
        if (contactsData) setContacts(contactsData);

        // Fetch recent donations
        const { data: donationsData } = await supabase
          .from('donations')
          .select('*')
          .order('date', { ascending: false })
          .limit(100);
        if (donationsData) setDonations(donationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Get selected contact
  const selectedContact = selectedData.contacts[0] as Client | undefined;
  const selectedDonation = selectedData.donations[0] as Donation | undefined;

  // Generate content based on type
  const handleGenerate = async () => {
    if (!selectedContact) return;

    setIsLoading(true);
    setGeneratedContent('');
    setGeneratedSubject('');

    try {
      switch (communicationType) {
        case 'thank-you': {
          if (!selectedDonation) {
            setGeneratedContent('Please select a donation to generate a thank-you letter.');
            break;
          }
          const result = await generateDonorThankYou(
            selectedContact,
            selectedDonation,
            { tone: tone as 'formal' | 'warm' | 'casual' }
          );
          if (typeof result === 'object' && result.subject) {
            setGeneratedSubject(result.subject);
            setGeneratedContent(result.body);
          } else {
            setGeneratedContent(result as string);
          }
          break;
        }
        case 'appeal': {
          const result = await generateAppealLetter(
            selectedContact,
            customPrompt || 'Support our mission',
            { tone: tone as 'formal' | 'warm' | 'casual' }
          );
          if (typeof result === 'object' && result.subject) {
            setGeneratedSubject(result.subject);
            setGeneratedContent(result.body);
          } else {
            setGeneratedContent(result as string);
          }
          break;
        }
        case 'follow-up': {
          const insight = customPrompt || 'It has been a while since we last connected';
          const result = await generateFollowUpEmail(
            selectedContact,
            insight,
            senderName || 'Your Name'
          );
          setGeneratedSubject(result.subject);
          setGeneratedContent(result.body);
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

  const currentType = communicationTypes.find(t => t.id === communicationType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 
          className="text-xl font-semibold"
          style={{ color: 'var(--cmf-text)' }}
        >
          Donor Communications
        </h2>
        <p 
          className="text-sm mt-1"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          Generate personalized letters and emails using your CRM contact data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Communication Type Selection */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Communication Type</CardTitle>
              <CardDescription>Select the type of communication to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {communicationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCommunicationType(type.id)}
                    className={`
                      p-4 rounded-xl text-left transition-all duration-200
                      ${communicationType === type.id ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{
                      backgroundColor: communicationType === type.id 
                        ? 'var(--cmf-accent-subtle)' 
                        : 'var(--cmf-surface-2)',
                      borderColor: communicationType === type.id ? type.color : 'transparent',
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

          {/* Data Source Selection */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Select Recipient</CardTitle>
              <CardDescription>
                Choose a contact {communicationType === 'thank-you' && 'and donation'} from your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataSourceSelector
                sources={communicationType === 'thank-you' ? ['contacts', 'donations'] : ['contacts']}
                contacts={contacts}
                donations={donations}
                onSelect={setSelectedData}
                multiple={false}
              />
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tone Selection */}
              <RadioGroup
                name="tone"
                label="Tone"
                options={toneOptions}
                value={tone}
                onChange={setTone}
                orientation="horizontal"
              />

              {/* Sender Name for follow-ups */}
              {communicationType === 'follow-up' && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--cmf-text-secondary)' }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--cmf-surface)',
                      border: '1px solid var(--cmf-border-strong)',
                      color: 'var(--cmf-text)',
                    }}
                  />
                </div>
              )}

              {/* Custom prompt for appeal and follow-up */}
              {(communicationType === 'appeal' || communicationType === 'follow-up') && (
                <Textarea
                  label={communicationType === 'appeal' ? 'Campaign/Cause' : 'Context/Insight'}
                  placeholder={
                    communicationType === 'appeal' 
                      ? 'Describe the campaign or cause (e.g., "Annual fund drive for youth programs")'
                      : 'Add context about why you\'re reaching out (e.g., "It\'s been 6 months since their last donation")'
                  }
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  fullWidth
                />
              )}

              {/* Generate Button */}
              <Button
                variant="aurora"
                onClick={handleGenerate}
                disabled={!selectedContact || isLoading}
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
                {selectedContact 
                  ? `For: ${selectedContact.name || selectedContact.contactPerson}`
                  : 'Select a contact to generate content'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedSubject && (
                <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--cmf-border)' }}>
                  <p 
                    className="text-xs font-medium uppercase tracking-wide mb-1"
                    style={{ color: 'var(--cmf-text-muted)' }}
                  >
                    Subject Line
                  </p>
                  <p 
                    className="font-medium"
                    style={{ color: 'var(--cmf-text)' }}
                  >
                    {generatedSubject}
                  </p>
                </div>
              )}
              
              <GeneratedContentCard
                title={currentType?.label || 'Content'}
                content={generatedContent}
                isLoading={isLoading}
                onRegenerate={handleGenerate}
                format={communicationType === 'follow-up' ? 'email' : 'letter'}
                showActions={!!generatedContent}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsTab;
