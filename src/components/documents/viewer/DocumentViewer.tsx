/**
 * Document Viewer Component
 * Full-screen modal for previewing documents with AI insights sidebar
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import type { EnhancedDocument } from '../../../types/documents';
import { AIInsightsPanel } from '../ai/AIInsightsPanel';

interface DocumentViewerProps {
  document: EnhancedDocument;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (document: EnhancedDocument) => void;
  onShare?: (document: EnhancedDocument) => void;
  onPrint?: (document: EnhancedDocument) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onPrint,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset state when document changes
  useEffect(() => {
    setZoom(100);
    setRotation(0);
    setCurrentPage(1);
  }, [document.id]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentPage((p) => p + 1);
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(z + 10, 200));
      } else if (e.key === '-') {
        setZoom((z) => Math.max(z - 10, 50));
      } else if (e.key === '0') {
        setZoom(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, onClose]);

  if (!isOpen) return null;

  const isPDF = document.file_type?.toLowerCase().includes('pdf');
  const isImage = document.file_type?.toLowerCase().includes('image') ||
                  document.file_type?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isText = document.file_type?.toLowerCase().includes('text') ||
                 document.file_type?.toLowerCase().match(/\.(txt|md|json|xml|csv)$/i);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Main Container */}
      <div className="relative w-full h-full max-w-[1920px] mx-auto flex flex-col bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-800 border-b border-slate-700">
          {/* Document Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{document.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span>{document.file_type}</span>
                <span>•</span>
                <span>
                  {document.file_size
                    ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                    : 'Unknown size'}
                </span>
                {document.version_number > 1 && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-medium">
                      v{document.version_number}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* AI Panel Toggle */}
            {document.ai_metadata && (
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  showAIPanel
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={showAIPanel ? 'Hide AI Insights' : 'Show AI Insights'}
              >
                {showAIPanel ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            )}

            {/* Download */}
            <button
              onClick={() => onDownload?.(document)}
              className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Share */}
            <button
              onClick={() => onShare?.(document)}
              className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Print */}
            <button
              onClick={() => onPrint?.(document)}
              className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>

            {/* Open in New Tab */}
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Document Preview */}
          <div className={`flex-1 flex flex-col bg-slate-900 ${showAIPanel && document.ai_metadata ? '' : 'w-full'}`}>
            {/* Viewer Controls */}
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1 hover:bg-slate-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-4 h-4 text-slate-300" />
                </button>
                <span className="text-sm font-medium text-slate-300 min-w-[4rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1 hover:bg-slate-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              {/* Rotation */}
              {isImage && (
                <button
                  onClick={handleRotate}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4 text-slate-300" />
                </button>
              )}

              {/* Reset */}
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg
                           text-sm font-medium transition-colors"
                title="Reset zoom and rotation (0)"
              >
                Reset
              </button>

              {/* Page Navigation (for PDFs) */}
              {isPDF && (
                <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-700 rounded-lg">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 hover:bg-slate-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page (←)"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-300" />
                  </button>
                  <span className="text-sm font-medium text-slate-300 min-w-[5rem] text-center">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Next page (→)"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Display */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              <div
                className="transition-all duration-300"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                {/* PDF Viewer */}
                {isPDF && (
                  <div className="bg-white rounded-lg shadow-2xl">
                    <div className="p-8 text-center">
                      <p className="text-slate-600 mb-4">PDF Preview</p>
                      <p className="text-sm text-slate-500">
                        PDF.js integration would render the document here
                      </p>
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-600 text-white
                                   rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open PDF in New Tab
                      </a>
                    </div>
                  </div>
                )}

                {/* Image Viewer */}
                {isImage && (
                  <img
                    src={document.file_url}
                    alt={document.name}
                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                  />
                )}

                {/* Text Viewer */}
                {isText && document.ai_metadata?.extracted_text && (
                  <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl">
                    <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono">
                      {document.ai_metadata.extracted_text}
                    </pre>
                  </div>
                )}

                {/* Fallback */}
                {!isPDF && !isImage && !isText && (
                  <div className="bg-slate-800 rounded-lg shadow-2xl p-12 text-center">
                    <div className="text-slate-400 mb-4">
                      <ExternalLink className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Preview not available</p>
                      <p className="text-sm">This file type cannot be previewed in the browser</p>
                    </div>
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-600 text-white
                                 rounded-lg hover:bg-rose-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          {showAIPanel && document.ai_metadata && (
            <div className="w-96 border-l border-slate-700 bg-slate-800 overflow-hidden flex flex-col
                            animate-in slide-in-from-right duration-300">
              <AIInsightsPanel aiMetadata={document.ai_metadata} className="flex-1" />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                Created: {new Date(document.created_at).toLocaleDateString()}
              </span>
              {document.updated_at && (
                <span>
                  Modified: {new Date(document.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Press</span>
              <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">ESC</kbd>
              <span className="text-slate-500">to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
