import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Table,
  FileSpreadsheet,
  Image,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Globe,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { ExportTemplateEditor } from './ExportTemplateEditor';
import reportService from '@/services/reportService';
import { ExportTemplate, DEFAULT_EXPORT_TEMPLATES } from '@/config/defaultExportTemplates';

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

interface ExportTemplateManagerProps {
  onSelectTemplate?: (template: any) => void;
}

export const ExportTemplateManager: React.FC<ExportTemplateManagerProps> = ({
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, searchQuery, filterFormat, filterVisibility]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportService.getExportTemplates();

      // Combine with default templates if no user templates exist
      const combinedTemplates = data.length > 0 ? data : DEFAULT_EXPORT_TEMPLATES;
      setTemplates(combinedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Use default templates on error
      setTemplates(DEFAULT_EXPORT_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query)
      );
    }

    // Format filter
    if (filterFormat !== 'all') {
      filtered = filtered.filter((template) => template.template_type === filterFormat);
    }

    // Visibility filter
    if (filterVisibility === 'public') {
      filtered = filtered.filter((template) => template.is_public);
    } else if (filterVisibility === 'private') {
      filtered = filtered.filter((template) => !template.is_public);
    } else if (filterVisibility === 'mine') {
      filtered = filtered.filter((template) => template.created_by === currentUserId);
    }

    // Sort by usage count descending
    filtered.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      await reportService.duplicateExportTemplate(template.id);
      loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleDeleteTemplate = async (template: any) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      await reportService.deleteExportTemplate(template.id);
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleTogglePublic = async (template: any) => {
    try {
      await reportService.updateExportTemplate(template.id, {
        is_public: !template.is_public,
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to update template visibility:', error);
    }
  };

  const handleSaveTemplate = async (templateData: {
    name: string;
    description: string;
    template_type: 'pdf' | 'excel' | 'csv' | 'png';
    configuration: any;
    is_public: boolean;
  }) => {
    try {
      if (editingTemplate?.id) {
        await reportService.updateExportTemplate(editingTemplate.id, {
          name: templateData.name,
          description: templateData.description,
          configuration: templateData.configuration,
          is_public: templateData.is_public,
        });
      } else {
        await reportService.createExportTemplate(templateData);
      }

      setEditorOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleUseTemplate = (template: any) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const canEdit = (template: any) => {
    return template.created_by === currentUserId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage and reuse export configurations
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterFormat} onValueChange={setFilterFormat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="pdf">PDF Only</SelectItem>
            <SelectItem value="excel">Excel Only</SelectItem>
            <SelectItem value="csv">CSV Only</SelectItem>
            <SelectItem value="png">Image Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterVisibility} onValueChange={setFilterVisibility}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="public">Public Only</SelectItem>
            <SelectItem value="private">Private Only</SelectItem>
            <SelectItem value="mine">My Templates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No templates found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterFormat !== 'all' || filterVisibility !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first export template to get started'}
            </p>
            {!searchQuery && filterFormat === 'all' && filterVisibility === 'all' && (
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const FormatIcon = FORMAT_ICONS[template.template_type as keyof typeof FORMAT_ICONS];
            const formatColor = FORMAT_COLORS[template.template_type as keyof typeof FORMAT_COLORS];

            return (
              <Card key={template.id || template.name} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg border ${formatColor}`}>
                        <FormatIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs uppercase">
                            {template.template_type}
                          </Badge>
                          {template.is_public ? (
                            <Globe className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onSelectTemplate && (
                          <>
                            <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Use Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {canEdit(template) && (
                          <>
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublic(template)}>
                              {template.is_public ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Make Private
                                </>
                              ) : (
                                <>
                                  <Globe className="h-4 w-4 mr-2" />
                                  Make Public
                                </>
                              )}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {canEdit(template) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {template.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {template.thumbnail_url && (
                    <div className="mb-3 rounded-md overflow-hidden border">
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{template.usage_count || 0} uses</span>
                    </div>
                    {template.is_public ? (
                      <span className="text-green-600">Public</span>
                    ) : (
                      <span>Private</span>
                    )}
                  </div>

                  {onSelectTemplate && (
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use This Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Template Editor Dialog */}
      <ExportTemplateEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        initialTemplate={editingTemplate}
      />
    </div>
  );
};
