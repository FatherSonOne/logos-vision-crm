import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Table,
  FileSpreadsheet,
  Image,
  Settings,
  Star,
  Clock,
  ChevronRight,
  Save,
} from 'lucide-react';
import { ExportTemplateSelector } from './ExportTemplateSelector';
import { ExportTemplateEditor } from './ExportTemplateEditor';
import reportService from '@/services/reportService';

interface ExportMenuProps {
  onExport: (
    format: 'pdf' | 'excel' | 'csv' | 'png',
    template?: any
  ) => Promise<void>;
  disabled?: boolean;
  currentSettings?: any;
}

const FORMAT_ICONS = {
  pdf: FileText,
  excel: Table,
  csv: FileSpreadsheet,
  png: Image,
};

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  disabled = false,
  currentSettings,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'png'>('pdf');
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [lastUsedTemplate, setLastUsedTemplate] = useState<any>(null);

  useEffect(() => {
    loadRecentTemplates();
  }, []);

  const loadRecentTemplates = async () => {
    try {
      const recent = await reportService.getRecentTemplates(3);
      setRecentTemplates(recent);

      // Load last used template from localStorage
      const lastUsed = localStorage.getItem('lastUsedExportTemplate');
      if (lastUsed) {
        try {
          const template = JSON.parse(lastUsed);
          setLastUsedTemplate(template);
        } catch (error) {
          console.error('Failed to parse last used template:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load recent templates:', error);
    }
  };

  const handleQuickExport = async (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWithTemplate = async (template: any) => {
    setIsExporting(true);
    try {
      // Save as last used
      localStorage.setItem('lastUsedExportTemplate', JSON.stringify(template));
      setLastUsedTemplate(template);

      await onExport(template.template_type, template);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWithLastTemplate = async () => {
    if (lastUsedTemplate) {
      await handleExportWithTemplate(lastUsedTemplate);
    }
  };

  const handleSelectTemplate = (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    setSelectedFormat(format);
    setTemplateSelectorOpen(true);
  };

  const handleSaveAsTemplate = (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    setSelectedFormat(format);
    setSaveTemplateOpen(true);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      await reportService.createExportTemplate(templateData);
      setSaveTemplateOpen(false);
      loadRecentTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled || isExporting} variant="default">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* Quick Export with Last Template */}
          {lastUsedTemplate && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Quick Export
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleExportWithLastTemplate}>
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{lastUsedTemplate.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Last used template
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2 text-xs uppercase">
                  {lastUsedTemplate.template_type}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Recent Templates */}
          {recentTemplates.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Recent Templates
              </DropdownMenuLabel>
              {recentTemplates.map((template) => {
                const Icon = FORMAT_ICONS[template.template_type as keyof typeof FORMAT_ICONS];
                return (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleExportWithTemplate(template)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <div className="flex-1">
                      <div className="text-sm">{template.name}</div>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs uppercase">
                      {template.template_type}
                    </Badge>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Export by Format */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Export By Format
          </DropdownMenuLabel>

          {/* PDF Export */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="h-4 w-4 mr-2" />
              PDF Document
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleQuickExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Quick Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelectTemplate('pdf')}>
                <Settings className="h-4 w-4 mr-2" />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSaveAsTemplate('pdf')}>
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Excel Export */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Table className="h-4 w-4 mr-2" />
              Excel Workbook
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleQuickExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Quick Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelectTemplate('excel')}>
                <Settings className="h-4 w-4 mr-2" />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSaveAsTemplate('excel')}>
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* CSV Export */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV File
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Quick Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelectTemplate('csv')}>
                <Settings className="h-4 w-4 mr-2" />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSaveAsTemplate('csv')}>
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Image Export */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Image className="h-4 w-4 mr-2" />
              Image (PNG/JPG)
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleQuickExport('png')}>
                <Download className="h-4 w-4 mr-2" />
                Quick Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelectTemplate('png')}>
                <Settings className="h-4 w-4 mr-2" />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSaveAsTemplate('png')}>
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Template Selector Dialog */}
      <ExportTemplateSelector
        open={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onSelect={handleExportWithTemplate}
        format={selectedFormat}
      />

      {/* Save Template Dialog */}
      <ExportTemplateEditor
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        onSave={handleSaveTemplate}
        initialTemplate={{
          name: '',
          description: '',
          template_type: selectedFormat,
          configuration: currentSettings || {},
        }}
      />
    </>
  );
};
