import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Folder, File, FileText, FileImage, FileSpreadsheet, Presentation,
  ChevronRight, Download, ExternalLink, Share2, Loader2, ArrowLeft,
  X, Users, Copy, Check, Trash2, MoreVertical, RefreshCw, Home
} from 'lucide-react';
import { googleDriveService, GoogleDriveFile, GoogleDrivePermission } from '../services/googleDriveService';

interface GoogleDriveBrowserProps {
  onImportFile?: (file: GoogleDriveFile) => void;
  onClose?: () => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const GoogleDriveBrowser: React.FC<GoogleDriveBrowserProps> = ({
  onImportFile,
  onClose
}) => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }]);
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'reader' | 'writer' | 'commenter'>('commenter');
  const [isSharing, setIsSharing] = useState(false);
  const [permissions, setPermissions] = useState<GoogleDrivePermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: GoogleDriveFile } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load files
  const loadFiles = useCallback(async (folderId: string = 'root') => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleDriveService.listFiles(folderId);
      setFiles(result.files);
    } catch (err) {
      console.error('Failed to load files:', err);
      const message = err instanceof Error ? err.message : 'Failed to load files';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFiles(currentFolderId);
  }, [currentFolderId, loadFiles]);

  // Search files
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFiles(currentFolderId);
      return;
    }

    setIsSearching(true);
    try {
      const results = await googleDriveService.searchFiles(searchQuery);
      setFiles(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Navigate to folder
  const navigateToFolder = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery('');
  };

  // Navigate via breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumbs[index];
    setCurrentFolderId(item.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setSearchQuery('');
  };

  // Go back
  const goBack = () => {
    if (breadcrumbs.length > 1) {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  };

  // Open file
  const openFile = (file: GoogleDriveFile) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      window.open(googleDriveService.getWebViewUrl(file.id), '_blank');
    }
  };

  // Download file
  const downloadFile = async (file: GoogleDriveFile) => {
    try {
      const blob = await googleDriveService.downloadFile(file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  // Share file
  const handleShare = async () => {
    if (!selectedFile || !shareEmail.trim()) return;

    setIsSharing(true);
    try {
      await googleDriveService.shareFile(selectedFile.id, shareEmail, shareRole);
      setShareEmail('');
      // Reload permissions
      const perms = await googleDriveService.getFilePermissions(selectedFile.id);
      setPermissions(perms);
    } catch (error) {
      console.error('Share failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to share file');
    } finally {
      setIsSharing(false);
    }
  };

  // Open share modal
  const openShareModal = async (file: GoogleDriveFile) => {
    setSelectedFile(file);
    setShowShareModal(true);
    setLoadingPermissions(true);
    try {
      const perms = await googleDriveService.getFilePermissions(file.id);
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Remove permission
  const removePermission = async (permissionId: string) => {
    if (!selectedFile) return;
    try {
      await googleDriveService.removePermission(selectedFile.id, permissionId);
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
    } catch (error) {
      console.error('Failed to remove permission:', error);
    }
  };

  // Copy link
  const copyLink = (file: GoogleDriveFile) => {
    const url = file.webViewLink || googleDriveService.getWebViewUrl(file.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Context menu handler
  const handleContextMenu = (e: React.MouseEvent, file: GoogleDriveFile) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Get file icon
  const getFileIcon = (file: GoogleDriveFile) => {
    const mimeType = file.mimeType;
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-500" />;
    }
    if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="w-5 h-5 text-orange-500" />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const isFolder = (file: GoogleDriveFile) => file.mimeType === 'application/vnd.google-apps.folder';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.01-.02-1.708-3.001-3.775-6.62l-3.76-6.574h-3.758zm-5.526 6.62L3.255 14.68l1.879 3.287 1.88 3.287 3.76-6.574 3.76-6.574h-3.76l-3.76 6.574-.53.926" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Drive</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search in Google Drive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-20 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-blue-500 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto">
          <button
            onClick={() => navigateToBreadcrumb(0)}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <Home className="w-4 h-4" />
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`px-2 py-1 text-sm rounded whitespace-nowrap ${
                  index === breadcrumbs.length - 1
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Connection Issue
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
              {error.includes('token') || error.includes('401') || error.includes('unauthorized')
                ? 'Your Google Drive session has expired. Please reconnect to continue.'
                : error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => loadFiles(currentFolderId)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={() => {
                  // Navigate to settings to reconnect
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'settings' } }));
                  onClose?.();
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Reconnect Google Drive
              </button>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No files found' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {files.map(file => (
              <div
                key={file.id}
                onContextMenu={(e) => handleContextMenu(e, file)}
                onClick={() => isFolder(file) ? navigateToFolder(file) : setSelectedFile(file)}
                onDoubleClick={() => isFolder(file) ? navigateToFolder(file) : openFile(file)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                  selectedFile?.id === file.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {/* Thumbnail or Icon */}
                <div className="flex-shrink-0">
                  {file.thumbnailLink && !isFolder(file) ? (
                    <img
                      src={file.thumbnailLink}
                      alt={file.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                      isFolder(file) ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDate(file.modifiedTime)}</span>
                    {!isFolder(file) && <span>{formatSize(file.size)}</span>}
                    {file.shared && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Users className="w-3 h-3" />
                        Shared
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {!isFolder(file) && (
                    <>
                      <button
                        onClick={() => openShareModal(file)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openFile(file)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        title="Open"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => handleContextMenu(e, file)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with selected file actions */}
      {selectedFile && !isFolder(selectedFile) && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {getFileIcon(selectedFile)}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onImportFile && (
                <button
                  onClick={() => onImportFile(selectedFile)}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Link to FileHub
                </button>
              )}
              <button
                onClick={() => openFile(selectedFile)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 min-w-[180px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            top: Math.min(contextMenu.y, window.innerHeight - 250),
          }}
        >
          {isFolder(contextMenu.file) ? (
            <button
              onClick={() => { navigateToFolder(contextMenu.file); setContextMenu(null); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Folder className="w-4 h-4" />
              Open Folder
            </button>
          ) : (
            <>
              <button
                onClick={() => { openFile(contextMenu.file); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Drive
              </button>
              <button
                onClick={() => { downloadFile(contextMenu.file); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => { openShareModal(contextMenu.file); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={() => { copyLink(contextMenu.file); setContextMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
              {onImportFile && (
                <>
                  <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={() => { onImportFile(contextMenu.file); setContextMenu(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    <File className="w-4 h-4" />
                    Link to FileHub
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share "{selectedFile.name}"</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Add people */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Add people
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value as 'reader' | 'writer' | 'commenter')}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="reader">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="writer">Editor</option>
                  </select>
                </div>
                <button
                  onClick={handleShare}
                  disabled={!shareEmail.trim() || isSharing}
                  className="mt-3 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </button>
              </div>

              {/* People with access */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  People with access
                </h4>
                {loadingPermissions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : permissions.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Only you have access
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {permissions.map(perm => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {perm.displayName || perm.emailAddress || perm.type}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {perm.role === 'reader' ? 'Viewer' : perm.role}
                            </p>
                          </div>
                        </div>
                        {perm.role !== 'owner' && (
                          <button
                            onClick={() => removePermission(perm.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy link */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => copyLink(selectedFile)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveBrowser;
