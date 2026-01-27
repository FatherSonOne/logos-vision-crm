/**
 * DocumentCard Component
 * Modern grid view card for displaying documents with AI insights
 */

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  Calendar,
  Download,
  Eye,
  MoreVertical,
  Star,
} from 'lucide-react';
import type { EnhancedDocument } from '../../../types/documents';
import { PulseSourceBadge } from './PulseSourceBadge';

interface DocumentCardProps {
  document: EnhancedDocument;
  onView?: (document: EnhancedDocument) => void;
  onDownload?: (document: EnhancedDocument) => void;
  onFavorite?: (document: EnhancedDocument) => void;
  isFavorite?: boolean;
  showPreview?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDownload,
  onFavorite,
  isFavorite = false,
  showPreview = true,
}) => {
  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      contract: 'from-rose-500 to-pink-500',
      invoice: 'from-emerald-500 to-green-500',
      proposal: 'from-blue-500 to-cyan-500',
      report: 'from-purple-500 to-violet-500',
      presentation: 'from-orange-500 to-amber-500',
      memo: 'from-slate-500 to-gray-500',
      default: 'from-slate-400 to-slate-500',
    };
    return colors[category?.toLowerCase() || 'default'] || colors.default;
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-12 h-12" />;

    const type = fileType.toLowerCase();
    if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="w-12 h-12" />;
    }
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return <ImageIcon className="w-12 h-12" />;
    }
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="w-12 h-12" />;
    }
    return <File className="w-12 h-12" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: string): string => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'bg-slate-500';
    if (confidence >= 0.9) return 'bg-emerald-500';
    if (confidence >= 0.7) return 'bg-blue-500';
    if (confidence >= 0.5) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700
                 hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-500/50
                 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={() => onView?.(document)}
    >
      {/* Thumbnail/Icon Area */}
      <div className={`relative h-48 bg-gradient-to-br ${getCategoryColor(document.category)}
                      flex items-center justify-center overflow-hidden`}>
        {showPreview && document.thumbnail_url ? (
          <img
            src={document.thumbnail_url}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white opacity-80">
            {getFileIcon(document.file_type)}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(document);
            }}
            className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-full
                       hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="View document"
          >
            <Eye className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.(document);
            }}
            className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-full
                       hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* Favorite Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(document);
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-slate-800/80 rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:bg-white dark:hover:bg-slate-800"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {document.pulse_source && (
            <PulseSourceBadge source={document.pulse_source} size="sm" showLabel={false} />
          )}

          {document.ai_metadata?.classification_category && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium
                         shadow-lg"
              title={`AI Classification: ${document.ai_metadata.classification_reasoning || 'Auto-classified'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${getConfidenceColor(document.ai_metadata.classification_confidence)}`} />
              <span className="capitalize">{document.ai_metadata.classification_category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Document Name */}
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2
                       group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {document.name}
        </h3>

        {/* AI Summary Preview */}
        {document.ai_metadata?.ai_summary && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {document.ai_metadata.ai_summary}
          </p>
        )}

        {/* Tags */}
        {document.ai_metadata?.auto_tags && document.ai_metadata.auto_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {document.ai_metadata.auto_tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                           text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {document.ai_metadata.auto_tags.length > 3 && (
              <span className="px-2 py-0.5 text-slate-500 dark:text-slate-400 text-xs">
                +{document.ai_metadata.auto_tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3
                        border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(document.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatFileSize(document.file_size)}</span>
            {document.version_number > 1 && (
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                               rounded text-xs font-medium">
                v{document.version_number}
              </span>
            )}
          </div>
        </div>

        {/* AI Processing Indicator */}
        {document.ai_metadata && (
          <div className="mt-2 flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span>AI Enhanced</span>
            {document.ai_metadata.classification_confidence && (
              <span className="ml-auto font-medium">
                {Math.round(document.ai_metadata.classification_confidence * 100)}% confident
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Menu */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Handle menu open
        }}
        className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-full
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   hover:bg-white dark:hover:bg-slate-800"
        title="More options"
      >
        <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </button>
    </div>
  );
};
