import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FileText, Table, FileSpreadsheet, Image, Save, X } from 'lucide-react';
import { ExportTemplateConfiguration } from '@/config/defaultExportTemplates';

interface ExportTemplateEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: {
    name: string;
    description: string;
    template_type: 'pdf' | 'excel' | 'csv' | 'png';
    configuration: ExportTemplateConfiguration;
    is_public: boolean;
  }) => void;
  initialTemplate?: {
    id?: string;
    name: string;
    description?: string;
    template_type: 'pdf' | 'excel' | 'csv' | 'png';
    configuration: ExportTemplateConfiguration;
    is_public?: boolean;
  };
}

const FORMAT_ICONS = {
  pdf: FileText,
  excel: Table,
  csv: FileSpreadsheet,
  png: Image,
};

export const ExportTemplateEditor: React.FC<ExportTemplateEditorProps> = ({
  open,
  onClose,
  onSave,
  initialTemplate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<'pdf' | 'excel' | 'csv' | 'png'>('pdf');
  const [isPublic, setIsPublic] = useState(false);
  const [configuration, setConfiguration] = useState<ExportTemplateConfiguration>({});

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setDescription(initialTemplate.description || '');
      setTemplateType(initialTemplate.template_type);
      setIsPublic(initialTemplate.is_public || false);
      setConfiguration(initialTemplate.configuration);
    } else {
      resetForm();
    }
  }, [initialTemplate, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTemplateType('pdf');
    setIsPublic(false);
    setConfiguration({
      pdf: {
        orientation: 'portrait',
        pageSize: 'letter',
        includeCharts: true,
        includeFilters: true,
        includeSummary: true,
        includeMetadata: true,
        showPageNumbers: true,
        showDate: true,
        showBranding: true,
        fontSize: 'medium',
        colorScheme: 'color',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      template_type: templateType,
      configuration,
      is_public: isPublic,
    });

    resetForm();
  };

  const updatePdfConfig = (key: string, value: any) => {
    setConfiguration({
      ...configuration,
      pdf: { ...configuration.pdf!, [key]: value },
    });
  };

  const updateExcelConfig = (key: string, value: any) => {
    setConfiguration({
      ...configuration,
      excel: { ...configuration.excel!, [key]: value },
    });
  };

  const updateCsvConfig = (key: string, value: any) => {
    setConfiguration({
      ...configuration,
      csv: { ...configuration.csv!, [key]: value },
    });
  };

  const updatePngConfig = (key: string, value: any) => {
    setConfiguration({
      ...configuration,
      png: { ...configuration.png!, [key]: value },
    });
  };

  const updatePdfMargins = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    setConfiguration({
      ...configuration,
      pdf: {
        ...configuration.pdf!,
        margins: { ...configuration.pdf!.margins, [side]: value },
      },
    });
  };

  const renderPdfConfiguration = () => {
    const pdfConfig = configuration.pdf || {};

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Orientation</Label>
            <Select
              value={pdfConfig.orientation || 'portrait'}
              onValueChange={(value) => updatePdfConfig('orientation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Page Size</Label>
            <Select
              value={pdfConfig.pageSize || 'letter'}
              onValueChange={(value) => updatePdfConfig('pageSize', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">Letter (8.5" × 11")</SelectItem>
                <SelectItem value="a4">A4 (210mm × 297mm)</SelectItem>
                <SelectItem value="legal">Legal (8.5" × 14")</SelectItem>
                <SelectItem value="tabloid">Tabloid (11" × 17")</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select
              value={pdfConfig.fontSize || 'medium'}
              onValueChange={(value) => updatePdfConfig('fontSize', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <Select
              value={pdfConfig.colorScheme || 'color'}
              onValueChange={(value) => updatePdfConfig('colorScheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Content Options</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-charts" className="font-normal">
                Include Charts
              </Label>
              <Switch
                id="include-charts"
                checked={pdfConfig.includeCharts !== false}
                onCheckedChange={(checked) => updatePdfConfig('includeCharts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-filters" className="font-normal">
                Include Filters
              </Label>
              <Switch
                id="include-filters"
                checked={pdfConfig.includeFilters !== false}
                onCheckedChange={(checked) => updatePdfConfig('includeFilters', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-summary" className="font-normal">
                Include Summary
              </Label>
              <Switch
                id="include-summary"
                checked={pdfConfig.includeSummary !== false}
                onCheckedChange={(checked) => updatePdfConfig('includeSummary', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-metadata" className="font-normal">
                Include Metadata
              </Label>
              <Switch
                id="include-metadata"
                checked={pdfConfig.includeMetadata !== false}
                onCheckedChange={(checked) => updatePdfConfig('includeMetadata', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Header/Footer Options</Label>
          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="header-text" className="text-sm font-normal">
                Header Text
              </Label>
              <Input
                id="header-text"
                value={pdfConfig.headerText || ''}
                onChange={(e) => updatePdfConfig('headerText', e.target.value)}
                placeholder="e.g., Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-text" className="text-sm font-normal">
                Footer Text
              </Label>
              <Input
                id="footer-text"
                value={pdfConfig.footerText || ''}
                onChange={(e) => updatePdfConfig('footerText', e.target.value)}
                placeholder="e.g., Confidential"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-page-numbers" className="font-normal">
                Show Page Numbers
              </Label>
              <Switch
                id="show-page-numbers"
                checked={pdfConfig.showPageNumbers !== false}
                onCheckedChange={(checked) => updatePdfConfig('showPageNumbers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-date" className="font-normal">
                Show Date
              </Label>
              <Switch
                id="show-date"
                checked={pdfConfig.showDate !== false}
                onCheckedChange={(checked) => updatePdfConfig('showDate', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-branding" className="font-normal">
                Show Branding
              </Label>
              <Switch
                id="show-branding"
                checked={pdfConfig.showBranding !== false}
                onCheckedChange={(checked) => updatePdfConfig('showBranding', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Margins (mm)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="margin-top" className="text-sm font-normal">
                Top
              </Label>
              <Input
                id="margin-top"
                type="number"
                value={pdfConfig.margins?.top || 20}
                onChange={(e) => updatePdfMargins('top', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin-right" className="text-sm font-normal">
                Right
              </Label>
              <Input
                id="margin-right"
                type="number"
                value={pdfConfig.margins?.right || 20}
                onChange={(e) => updatePdfMargins('right', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin-bottom" className="text-sm font-normal">
                Bottom
              </Label>
              <Input
                id="margin-bottom"
                type="number"
                value={pdfConfig.margins?.bottom || 20}
                onChange={(e) => updatePdfMargins('bottom', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin-left" className="text-sm font-normal">
                Left
              </Label>
              <Input
                id="margin-left"
                type="number"
                value={pdfConfig.margins?.left || 20}
                onChange={(e) => updatePdfMargins('left', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExcelConfiguration = () => {
    const excelConfig = configuration.excel || {};

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Sheet Options</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="multiple-sheets" className="font-normal">
                Include Multiple Sheets
              </Label>
              <Switch
                id="multiple-sheets"
                checked={excelConfig.includeMultipleSheets !== false}
                onCheckedChange={(checked) => updateExcelConfig('includeMultipleSheets', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="summary-sheet" className="font-normal">
                Include Summary Sheet
              </Label>
              <Switch
                id="summary-sheet"
                checked={excelConfig.includeSummarySheet !== false}
                onCheckedChange={(checked) => updateExcelConfig('includeSummarySheet', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="charts-sheet" className="font-normal">
                Include Charts Sheet
              </Label>
              <Switch
                id="charts-sheet"
                checked={excelConfig.includeChartsSheet !== false}
                onCheckedChange={(checked) => updateExcelConfig('includeChartsSheet', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="raw-data-sheet" className="font-normal">
                Include Raw Data Sheet
              </Label>
              <Switch
                id="raw-data-sheet"
                checked={excelConfig.includeRawDataSheet !== false}
                onCheckedChange={(checked) => updateExcelConfig('includeRawDataSheet', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Formatting Options</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-formulas" className="font-normal">
                Include Formulas
              </Label>
              <Switch
                id="include-formulas"
                checked={excelConfig.includeFormulas !== false}
                onCheckedChange={(checked) => updateExcelConfig('includeFormulas', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-formatting" className="font-normal">
                Apply Formatting
              </Label>
              <Switch
                id="apply-formatting"
                checked={excelConfig.applyFormatting !== false}
                onCheckedChange={(checked) => updateExcelConfig('applyFormatting', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="freeze-headers" className="font-normal">
                Freeze Headers
              </Label>
              <Switch
                id="freeze-headers"
                checked={excelConfig.freezeHeaders !== false}
                onCheckedChange={(checked) => updateExcelConfig('freezeHeaders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-filter" className="font-normal">
                Auto Filter
              </Label>
              <Switch
                id="auto-filter"
                checked={excelConfig.autoFilter !== false}
                onCheckedChange={(checked) => updateExcelConfig('autoFilter', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="conditional-formatting" className="font-normal">
                Conditional Formatting
              </Label>
              <Switch
                id="conditional-formatting"
                checked={excelConfig.includeConditionalFormatting !== false}
                onCheckedChange={(checked) =>
                  updateExcelConfig('includeConditionalFormatting', checked)
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Column Width Mode</Label>
            <Select
              value={excelConfig.columnWidthMode || 'auto'}
              onValueChange={(value) => updateExcelConfig('columnWidthMode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="content">Fit to Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <Select
              value={excelConfig.colorScheme || 'default'}
              onValueChange={(value) => updateExcelConfig('colorScheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number-format">Number Format</Label>
            <Input
              id="number-format"
              value={excelConfig.numberFormat || '#,##0.00'}
              onChange={(e) => updateExcelConfig('numberFormat', e.target.value)}
              placeholder="#,##0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Input
              id="date-format"
              value={excelConfig.dateFormat || 'yyyy-mm-dd'}
              onChange={(e) => updateExcelConfig('dateFormat', e.target.value)}
              placeholder="yyyy-mm-dd"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCsvConfiguration = () => {
    const csvConfig = configuration.csv || {};

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Delimiter</Label>
            <Select
              value={csvConfig.delimiter || ','}
              onValueChange={(value) => updateCsvConfig('delimiter', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="\t">Tab (\t)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Encoding</Label>
            <Select
              value={csvConfig.encoding || 'utf-8'}
              onValueChange={(value) => updateCsvConfig('encoding', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utf-8">UTF-8</SelectItem>
                <SelectItem value="utf-16">UTF-16</SelectItem>
                <SelectItem value="ascii">ASCII</SelectItem>
                <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Input
              value={csvConfig.dateFormat || 'yyyy-MM-dd'}
              onChange={(e) => updateCsvConfig('dateFormat', e.target.value)}
              placeholder="yyyy-MM-dd"
            />
          </div>

          <div className="space-y-2">
            <Label>Number Format</Label>
            <Select
              value={csvConfig.numberFormat || 'standard'}
              onValueChange={(value) => updateCsvConfig('numberFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="scientific">Scientific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Options</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-headers" className="font-normal">
                Include Headers
              </Label>
              <Switch
                id="include-headers"
                checked={csvConfig.includeHeaders !== false}
                onCheckedChange={(checked) => updateCsvConfig('includeHeaders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quote-strings" className="font-normal">
                Quote Strings
              </Label>
              <Switch
                id="quote-strings"
                checked={csvConfig.quoteStrings !== false}
                onCheckedChange={(checked) => updateCsvConfig('quoteStrings', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-bom" className="font-normal">
                Include BOM
              </Label>
              <Switch
                id="include-bom"
                checked={csvConfig.bom !== false}
                onCheckedChange={(checked) => updateCsvConfig('bom', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Line Ending</Label>
          <Select
            value={csvConfig.lineEnding || 'crlf'}
            onValueChange={(value) => updateCsvConfig('lineEnding', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crlf">CRLF (Windows)</SelectItem>
              <SelectItem value="lf">LF (Unix/Mac)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderPngConfiguration = () => {
    const pngConfig = configuration.png || {};

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="png-width">Width (px)</Label>
            <Input
              id="png-width"
              type="number"
              value={pngConfig.width || 1920}
              onChange={(e) => updatePngConfig('width', parseInt(e.target.value) || 1920)}
              min={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="png-height">Height (px)</Label>
            <Input
              id="png-height"
              type="number"
              value={pngConfig.height || 1080}
              onChange={(e) => updatePngConfig('height', parseInt(e.target.value) || 1080)}
              min={100}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Resolution (DPI)</Label>
            <Select
              value={String(pngConfig.resolution || 72)}
              onValueChange={(value) => updatePngConfig('resolution', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="72">72 DPI (Screen)</SelectItem>
                <SelectItem value="150">150 DPI (Web)</SelectItem>
                <SelectItem value="300">300 DPI (Print)</SelectItem>
                <SelectItem value="600">600 DPI (High Quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={pngConfig.format || 'png'}
              onValueChange={(value) => updatePngConfig('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="png-quality">Quality (1-100)</Label>
            <Input
              id="png-quality"
              type="number"
              value={pngConfig.quality || 90}
              onChange={(e) => updatePngConfig('quality', parseInt(e.target.value) || 90)}
              min={1}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="png-scale">Scale Factor</Label>
            <Input
              id="png-scale"
              type="number"
              value={pngConfig.scale || 1}
              onChange={(e) => updatePngConfig('scale', parseInt(e.target.value) || 1)}
              min={1}
              max={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <Input
            id="bg-color"
            type="color"
            value={pngConfig.backgroundColor || '#ffffff'}
            onChange={(e) => updatePngConfig('backgroundColor', e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Content Options</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="png-include-charts" className="font-normal">
                Include Charts
              </Label>
              <Switch
                id="png-include-charts"
                checked={pngConfig.includeCharts !== false}
                onCheckedChange={(checked) => updatePngConfig('includeCharts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="png-include-filters" className="font-normal">
                Include Filters
              </Label>
              <Switch
                id="png-include-filters"
                checked={pngConfig.includeFilters !== false}
                onCheckedChange={(checked) => updatePngConfig('includeFilters', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="crop-to-content" className="font-normal">
                Crop to Content
              </Label>
              <Switch
                id="crop-to-content"
                checked={pngConfig.cropToContent !== false}
                onCheckedChange={(checked) => updatePngConfig('cropToContent', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FormatIcon = FORMAT_ICONS[templateType];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialTemplate?.id ? 'Edit Export Template' : 'Create Export Template'}
          </DialogTitle>
          <DialogDescription>
            Configure export settings to save as a reusable template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Professional PDF Report"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this template is for..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['pdf', 'excel', 'csv', 'png'] as const).map((format) => {
                  const Icon = FORMAT_ICONS[format];
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setTemplateType(format)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        templateType === format
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase">{format}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is-public" className="font-medium">
                  Public Template
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this template available to all users
                </p>
              </div>
              <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FormatIcon className="h-5 w-5" />
              {templateType.toUpperCase()} Configuration
            </h3>

            {templateType === 'pdf' && renderPdfConfiguration()}
            {templateType === 'excel' && renderExcelConfiguration()}
            {templateType === 'csv' && renderCsvConfiguration()}
            {templateType === 'png' && renderPngConfiguration()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
