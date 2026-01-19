import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Table,
  FileSpreadsheet,
  Image,
  Search,
  Star,
  Clock,
  Globe,
  Lock,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';
import reportService from '@/services/reportService';
import { DEFAULT_EXPORT_TEMPLATES } from '@/config/defaultExportTemplates';

const FORMAT_ICONS = {
  pdf: FileText,
  excel: Table,
  csv: FileSpreadsheet,
  png: Image,
};

const FORMAT_COLORS = {
  pdf: 'bg-red-50 text-red-700 border-red-200',
  excel: 'bg-green-50 text-green-700 border-green-200',
  csv: 'bg-blue-50 text-blue-700 border-blue-200',
  png: 'bg-purple-50 text-purple-700 border-purple-200',
};

interface ExportTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: any) => void;
  format?: 'pdf' | 'excel' | 'csv' | 'png';
  showDefault?: boolean;
}

export const ExportTemplateSelector: React.FC<ExportTemplateSelectorProps> = ({
  open,
  onClose,
  onSelect,
  format,
  showDefault = true,
}) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>(format || 'all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, format]);

  useEffect(() => {
    if (format) {
      setSelectedFormat(format);
    }
  }, [format]);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      // Load all templates
      const allTemplates = await reportService.getExportTemplates(
        format ? { template_type: format } : undefined
      );

      // Load recent templates
      const recent = await reportService.getRecentTemplates(5);

      // Combine with defaults if no user templates
      const combinedTemplates = allTemplates.length > 0 ? allTemplates : DEFAULT_EXPORT_TEMPLATES;

      setTemplates(combinedTemplates);
      setRecentTemplates(recent);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(DEFAULT_EXPORT_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    // Filter by format
    if (selectedFormat !== 'all' && template.template_type !== selectedFormat) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate) {
      // Increment usage count
      if (selectedTemplate.id) {
        try {
          await reportService.incrementTemplateUsage(selectedTemplate.id);
        } catch (error) {
          console.error('Failed to increment usage count:', error);
        }
      }

      onSelect(selectedTemplate);
      onClose();
    }
  };

  const handleUseDefault = () => {
    onSelect(null);
    onClose();
  };

  const TemplateCard = ({ template, isRecent = false }: { template: any; isRecent?: boolean }) => {
    const FormatIcon = FORMAT_ICONS[template.template_type as keyof typeof FORMAT_ICONS];
    const formatColor = FORMAT_COLORS[template.template_type as keyof typeof FORMAT_COLORS];
    const isSelected = selectedTemplate?.id === template.id || selectedTemplate?.name === template.name;

    return (
      <button
        onClick={() => handleSelectTemplate(template)}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg border ${formatColor} flex-shrink-0`}>
            <FormatIcon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm truncate">{template.name}</h4>
              {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </div>

            {template.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {template.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs uppercase px-1.5 py-0">
                  {template.template_type}
                </Badge>
              </div>

              {template.is_public ? (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>Public</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{template.usage_count || 0}</span>
              </div>

              {isRecent && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Recent</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Export Template</DialogTitle>
          <DialogDescription>
            Choose a template to apply export settings, or use default settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {!format && (
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="png">Image</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Templates List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Recent Templates */}
              {recentTemplates.length > 0 && !searchQuery && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Recent Templates</h3>
                  </div>
                  <div className="space-y-2">
                    {recentTemplates
                      .filter((t) => selectedFormat === 'all' || t.template_type === selectedFormat)
                      .slice(0, 3)
                      .map((template) => (
                        <TemplateCard
                          key={template.id || template.name}
                          template={template}
                          isRecent
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All Templates */}
              <div>
                {!searchQuery && recentTemplates.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">All Templates</h3>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading templates...</p>
                    </div>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-2">No templates found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? 'Try adjusting your search'
                        : 'Create a template to save your export settings'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTemplates.map((template) => (
                      <TemplateCard key={template.id || template.name} template={template} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedTemplate ? (
                <span>
                  Selected: <span className="font-medium">{selectedTemplate.name}</span>
                </span>
              ) : (
                <span>No template selected</span>
              )}
            </div>

            <div className="flex gap-2">
              {showDefault && (
                <Button variant="outline" onClick={handleUseDefault}>
                  Use Default
                </Button>
              )}

              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button onClick={handleApplyTemplate} disabled={!selectedTemplate}>
                <Check className="h-4 w-4 mr-2" />
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
