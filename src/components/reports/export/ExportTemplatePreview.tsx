import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Table as TableIcon,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';
import { ExportTemplateConfiguration } from '@/config/defaultExportTemplates';

interface ExportTemplatePreviewProps {
  templateType: 'pdf' | 'excel' | 'csv' | 'png';
  configuration: ExportTemplateConfiguration;
  sampleData?: any[];
}

export const ExportTemplatePreview: React.FC<ExportTemplatePreviewProps> = ({
  templateType,
  configuration,
  sampleData = [],
}) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const renderPdfPreview = () => {
    const pdfConfig = configuration.pdf;
    if (!pdfConfig) return null;

    const isLandscape = pdfConfig.orientation === 'landscape';
    const aspectRatio = isLandscape ? 'aspect-[297/210]' : 'aspect-[210/297]';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {pdfConfig.pageSize.toUpperCase()} • {pdfConfig.orientation}
          </span>
          <span>Font: {pdfConfig.fontSize}</span>
        </div>

        <div className={`bg-white border-2 shadow-lg mx-auto p-8 ${aspectRatio}`} style={{ maxWidth: `${zoom}%` }}>
          {/* Header */}
          {pdfConfig.headerText && (
            <div className="border-b pb-2 mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">{pdfConfig.headerText}</div>
              {pdfConfig.showDate && (
                <div className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-4">
            <h1 className={`font-bold ${pdfConfig.fontSize === 'large' ? 'text-2xl' : pdfConfig.fontSize === 'small' ? 'text-lg' : 'text-xl'}`}>
              Report Title
            </h1>

            {pdfConfig.includeSummary && (
              <div className="border-l-4 border-primary pl-3 py-2">
                <p className={`${pdfConfig.fontSize === 'large' ? 'text-base' : pdfConfig.fontSize === 'small' ? 'text-xs' : 'text-sm'}`}>
                  Summary section with key insights and overview information.
                </p>
              </div>
            )}

            {pdfConfig.includeFilters && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Filter 1</Badge>
                <Badge variant="secondary">Filter 2</Badge>
              </div>
            )}

            {pdfConfig.includeCharts && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Chart Visualization
                </div>
              </div>
            )}

            <div className="border rounded">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className={`text-left p-2 ${pdfConfig.fontSize === 'large' ? 'text-sm' : pdfConfig.fontSize === 'small' ? 'text-xs' : 'text-xs'}`}>
                      Column 1
                    </th>
                    <th className={`text-left p-2 ${pdfConfig.fontSize === 'large' ? 'text-sm' : pdfConfig.fontSize === 'small' ? 'text-xs' : 'text-xs'}`}>
                      Column 2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-t">
                      <td className={`p-2 ${pdfConfig.fontSize === 'large' ? 'text-sm' : pdfConfig.fontSize === 'small' ? 'text-xs' : 'text-xs'}`}>
                        Data {i}
                      </td>
                      <td className={`p-2 ${pdfConfig.fontSize === 'large' ? 'text-sm' : pdfConfig.fontSize === 'small' ? 'text-xs' : 'text-xs'}`}>
                        Value {i}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pdfConfig.includeMetadata && (
              <div className="text-xs text-muted-foreground border-t pt-2 mt-4">
                Generated on {new Date().toLocaleString()} • Total Records: 3
              </div>
            )}
          </div>

          {/* Footer */}
          {(pdfConfig.footerText || pdfConfig.showPageNumbers) && (
            <div className="border-t pt-2 mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div>{pdfConfig.footerText}</div>
              {pdfConfig.showPageNumbers && <div>Page 1 of 1</div>}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Margins: {pdfConfig.margins.top}mm (top) • {pdfConfig.margins.bottom}mm (bottom)
        </div>
      </div>
    );
  };

  const renderExcelPreview = () => {
    const excelConfig = configuration.excel;
    if (!excelConfig) return null;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {excelConfig.includeMultipleSheets && (
            <>
              <Badge>Summary Sheet</Badge>
              {excelConfig.includeChartsSheet && <Badge>Charts</Badge>}
              {excelConfig.includeRawDataSheet && <Badge>Raw Data</Badge>}
            </>
          )}
        </div>

        <div className="bg-white border shadow-lg overflow-hidden" style={{ maxWidth: `${zoom}%` }}>
          {/* Excel Toolbar */}
          <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2 text-xs">
            <span className="font-medium">Sheet 1</span>
            {excelConfig.autoFilter && <Badge variant="secondary" className="text-xs">Auto Filter</Badge>}
            {excelConfig.freezeHeaders && <Badge variant="secondary" className="text-xs">Frozen Headers</Badge>}
          </div>

          {/* Excel Grid */}
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead className={excelConfig.freezeHeaders ? 'bg-blue-50 sticky top-0' : 'bg-gray-50'}>
                <tr>
                  <th className="border border-gray-300 p-2 text-xs font-semibold text-left min-w-[120px]">
                    Column A
                  </th>
                  <th className="border border-gray-300 p-2 text-xs font-semibold text-left min-w-[120px]">
                    Column B
                  </th>
                  <th className="border border-gray-300 p-2 text-xs font-semibold text-left min-w-[120px]">
                    Column C
                  </th>
                  {excelConfig.includeFormulas && (
                    <th className="border border-gray-300 p-2 text-xs font-semibold text-left min-w-[120px]">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className={i % 2 === 0 && excelConfig.applyFormatting ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 p-2 text-xs">Data {i}</td>
                    <td className="border border-gray-300 p-2 text-xs text-right">
                      {(i * 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {new Date().toLocaleDateString()}
                    </td>
                    {excelConfig.includeFormulas && (
                      <td className="border border-gray-300 p-2 text-xs font-semibold text-right">
                        {(i * 100).toLocaleString()}
                      </td>
                    )}
                  </tr>
                ))}
                {excelConfig.includeFormulas && (
                  <tr className="bg-blue-50 font-semibold">
                    <td className="border border-gray-300 p-2 text-xs">TOTAL</td>
                    <td className="border border-gray-300 p-2 text-xs text-right">1,000.00</td>
                    <td className="border border-gray-300 p-2 text-xs"></td>
                    <td className="border border-gray-300 p-2 text-xs text-right">1,000</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Number Format: {excelConfig.numberFormat}</span>
          <span>•</span>
          <span>Date Format: {excelConfig.dateFormat}</span>
          <span>•</span>
          <span>Column Width: {excelConfig.columnWidthMode}</span>
        </div>
      </div>
    );
  };

  const renderCsvPreview = () => {
    const csvConfig = configuration.csv;
    if (!csvConfig) return null;

    const delimiter = csvConfig.delimiter === '\t' ? 'TAB' : csvConfig.delimiter;
    const sampleRows = [
      csvConfig.includeHeaders ? ['Column A', 'Column B', 'Column C'] : null,
      ['Data 1', '100.00', '2024-01-15'],
      ['Data 2', '200.00', '2024-01-16'],
      ['Data 3', '300.00', '2024-01-17'],
    ].filter(Boolean);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Delimiter: {delimiter}</span>
          <span>•</span>
          <span>Encoding: {csvConfig.encoding.toUpperCase()}</span>
          <span>•</span>
          <span>Line Ending: {csvConfig.lineEnding.toUpperCase()}</span>
        </div>

        <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-lg overflow-auto" style={{ maxWidth: `${zoom}%` }}>
          <pre>
            {sampleRows.map((row, i) => {
              if (!row) return null;
              const line = row
                .map((cell) => (csvConfig.quoteStrings ? `"${cell}"` : cell))
                .join(csvConfig.delimiter);
              return (
                <div key={i} className={i === 0 && csvConfig.includeHeaders ? 'font-bold text-yellow-400' : ''}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>

        <div className="text-xs text-muted-foreground">
          Date Format: {csvConfig.dateFormat} • Number Format: {csvConfig.numberFormat}
        </div>
      </div>
    );
  };

  const renderPngPreview = () => {
    const pngConfig = configuration.png;
    if (!pngConfig) return null;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>
            {pngConfig.width}×{pngConfig.height}px
          </span>
          <span>•</span>
          <span>{pngConfig.resolution} DPI</span>
          <span>•</span>
          <span>{pngConfig.format.toUpperCase()}</span>
          <span>•</span>
          <span>Quality: {pngConfig.quality}%</span>
          <span>•</span>
          <span>Scale: {pngConfig.scale}x</span>
        </div>

        <div
          className="border-2 border-dashed mx-auto overflow-hidden"
          style={{
            maxWidth: `${zoom}%`,
            aspectRatio: `${pngConfig.width}/${pngConfig.height}`,
            backgroundColor: pngConfig.backgroundColor,
          }}
        >
          <div className="h-full p-6 flex flex-col">
            <div className="flex-1 space-y-4">
              <h2 className="text-xl font-bold">Report Visualization</h2>

              {pngConfig.includeFilters && (
                <div className="flex gap-2">
                  <Badge>Filter 1</Badge>
                  <Badge>Filter 2</Badge>
                </div>
              )}

              {pngConfig.includeCharts && (
                <div className="flex-1 border-2 rounded-lg p-4 flex items-center justify-center text-muted-foreground">
                  Chart Content
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {pngConfig.cropToContent ? 'Cropped to content' : 'Full dimensions'}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    switch (templateType) {
      case 'pdf':
        return renderPdfPreview();
      case 'excel':
        return renderExcelPreview();
      case 'csv':
        return renderCsvPreview();
      case 'png':
        return renderPngPreview();
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (templateType) {
      case 'pdf':
        return FileText;
      case 'excel':
        return TableIcon;
      case 'csv':
        return FileSpreadsheet;
      case 'png':
        return ImageIcon;
    }
  };

  const Icon = getIcon();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>Export Preview</CardTitle>
            <Badge variant="secondary" className="uppercase">
              {templateType}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-h-[400px]">{renderPreview()}</div>
      </CardContent>
    </Card>
  );
};
