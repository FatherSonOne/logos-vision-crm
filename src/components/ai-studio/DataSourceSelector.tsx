import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Select';
import { Users, Folder, DollarSign, Briefcase, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { Client, Project, Donation, Case } from '../../types';

export type DataSourceType = 'contacts' | 'projects' | 'donations' | 'cases';

export interface SelectedData {
  contacts: Client[];
  projects: Project[];
  donations: Donation[];
  cases: Case[];
}

export interface DataSourceSelectorProps {
  sources: DataSourceType[];
  onSelect: (data: SelectedData) => void;
  contacts?: Client[];
  projects?: Project[];
  donations?: Donation[];
  cases?: Case[];
  multiple?: boolean;
  className?: string;
}

const sourceConfig: Record<DataSourceType, { label: string; icon: React.ReactNode; color: string }> = {
  contacts: { label: 'Contacts', icon: <Users className="w-4 h-4" />, color: 'var(--aurora-teal)' },
  projects: { label: 'Projects', icon: <Folder className="w-4 h-4" />, color: 'var(--aurora-cyan)' },
  donations: { label: 'Donations', icon: <DollarSign className="w-4 h-4" />, color: 'var(--aurora-green)' },
  cases: { label: 'Cases', icon: <Briefcase className="w-4 h-4" />, color: 'var(--aurora-pink)' },
};

/**
 * DataSourceSelector
 * ==================
 * A component for selecting CRM data to use as context for AI content generation.
 */
export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  sources,
  onSelect,
  contacts = [],
  projects = [],
  donations = [],
  cases = [],
  multiple = true,
  className = '',
}) => {
  const [activeSource, setActiveSource] = useState<DataSourceType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedData, setSelectedData] = useState<SelectedData>({
    contacts: [],
    projects: [],
    donations: [],
    cases: [],
  });

  // Notify parent of selection changes
  useEffect(() => {
    onSelect(selectedData);
  }, [selectedData, onSelect]);

  const getItems = (source: DataSourceType) => {
    switch (source) {
      case 'contacts': return contacts;
      case 'projects': return projects;
      case 'donations': return donations;
      case 'cases': return cases;
      default: return [];
    }
  };

  const getItemLabel = (source: DataSourceType, item: any): string => {
    switch (source) {
      case 'contacts': return item.name || item.contactPerson || 'Unknown Contact';
      case 'projects': return item.name || 'Untitled Project';
      case 'donations': return `${item.donorName || 'Anonymous'} - $${item.amount?.toLocaleString() || '0'}`;
      case 'cases': return item.title || 'Untitled Case';
      default: return 'Unknown';
    }
  };

  const getItemSublabel = (source: DataSourceType, item: any): string => {
    switch (source) {
      case 'contacts': return item.email || item.type || '';
      case 'projects': return item.status || '';
      case 'donations': return item.date ? new Date(item.date).toLocaleDateString() : '';
      case 'cases': return item.status || '';
      default: return '';
    }
  };

  const toggleItem = (source: DataSourceType, item: any) => {
    setSelectedData(prev => {
      const key = source as keyof SelectedData;
      const currentList = prev[key] as any[];
      const isSelected = currentList.some(i => i.id === item.id);

      if (isSelected) {
        return { ...prev, [key]: currentList.filter(i => i.id !== item.id) };
      } else {
        if (multiple) {
          return { ...prev, [key]: [...currentList, item] };
        } else {
          return { ...prev, [key]: [item] };
        }
      }
    });
  };

  const isItemSelected = (source: DataSourceType, item: any): boolean => {
    const key = source as keyof SelectedData;
    return (selectedData[key] as any[]).some(i => i.id === item.id);
  };

  const filteredItems = activeSource
    ? getItems(activeSource).filter(item => {
        const label = getItemLabel(activeSource, item).toLowerCase();
        const sublabel = getItemSublabel(activeSource, item).toLowerCase();
        const query = searchQuery.toLowerCase();
        return label.includes(query) || sublabel.includes(query);
      })
    : [];

  const totalSelected = Object.values(selectedData).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const clearSelection = (source: DataSourceType) => {
    setSelectedData(prev => ({ ...prev, [source]: [] }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Source Tabs */}
      <div className="flex flex-wrap gap-2">
        {sources.map(source => {
          const config = sourceConfig[source];
          const count = (selectedData[source as keyof SelectedData] as any[]).length;
          const isActive = activeSource === source;

          return (
            <Button
              key={source}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveSource(isActive ? null : source)}
              leftIcon={config.icon}
              rightIcon={
                isActive ? (
                  <ChevronUp className="w-3 h-3" />
                ) : count > 0 ? (
                  <span 
                    className="ml-1 px-1.5 py-0.5 text-xs rounded-full"
                    style={{ 
                      backgroundColor: config.color,
                      color: '#0f172a'
                    }}
                  >
                    {count}
                  </span>
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )
              }
            >
              {config.label}
            </Button>
          );
        })}

        {totalSelected > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedData({ contacts: [], projects: [], donations: [], cases: [] })}
            leftIcon={<X className="w-3 h-3" />}
          >
            Clear All ({totalSelected})
          </Button>
        )}
      </div>

      {/* Expanded Source Panel */}
      {activeSource && (
        <Card variant="outlined" padding="sm">
          <div className="space-y-3">
            {/* Search */}
            <Input
              placeholder={`Search ${sourceConfig[activeSource].label.toLowerCase()}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              size="sm"
              fullWidth
            />

            {/* Items List */}
            <div 
              className="max-h-48 overflow-y-auto space-y-1"
              style={{ borderTop: '1px solid var(--cmf-border)' }}
            >
              {filteredItems.length === 0 ? (
                <p 
                  className="py-4 text-center text-sm"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  {searchQuery ? 'No results found' : `No ${sourceConfig[activeSource].label.toLowerCase()} available`}
                </p>
              ) : (
                filteredItems.slice(0, 50).map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(activeSource, item)}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isItemSelected(activeSource, item)
                        ? 'var(--cmf-accent-subtle)'
                        : 'transparent',
                    }}
                  >
                    <Checkbox
                      checked={isItemSelected(activeSource, item)}
                      onChange={() => {}}
                    />
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--cmf-text)' }}
                      >
                        {getItemLabel(activeSource, item)}
                      </p>
                      {getItemSublabel(activeSource, item) && (
                        <p 
                          className="text-xs truncate"
                          style={{ color: 'var(--cmf-text-muted)' }}
                        >
                          {getItemSublabel(activeSource, item)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {(selectedData[activeSource as keyof SelectedData] as any[]).length > 0 && (
              <div 
                className="flex items-center justify-between pt-2"
                style={{ borderTop: '1px solid var(--cmf-border)' }}
              >
                <span 
                  className="text-xs"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  {(selectedData[activeSource as keyof SelectedData] as any[]).length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearSelection(activeSource)}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Selection Summary */}
      {totalSelected > 0 && !activeSource && (
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: 'var(--cmf-surface-2)' }}
        >
          <p 
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--cmf-text)' }}
          >
            Selected Data Context:
          </p>
          <div className="flex flex-wrap gap-2">
            {sources.map(source => {
              const items = selectedData[source as keyof SelectedData] as any[];
              if (items.length === 0) return null;

              return items.map(item => (
                <span
                  key={`${source}-${item.id}`}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: 'var(--cmf-surface)',
                    border: '1px solid var(--cmf-border)',
                    color: 'var(--cmf-text)'
                  }}
                >
                  {sourceConfig[source].icon}
                  {getItemLabel(source, item).slice(0, 20)}
                  {getItemLabel(source, item).length > 20 && '...'}
                  <button
                    onClick={() => toggleItem(source, item)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ));
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceSelector;
