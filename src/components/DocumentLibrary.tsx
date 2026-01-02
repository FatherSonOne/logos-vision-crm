import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Document as AppDocument, Client, Project, TeamMember } from '../types';
import { DocumentCategory } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { googleDriveService } from '../services/googleDriveService';
import {
  FolderOpen, FileText, Upload, Search, Star, Clock, ChevronRight, ChevronDown,
  Download, Trash2, Edit3, Eye, MoreVertical, Grid, List, Filter, X, Check,
  Cloud, Settings, Plus, FolderPlus, Link2, ExternalLink, RefreshCw, Archive,
  FileImage, FileSpreadsheet, Presentation, File, HardDrive, Users, Loader2
} from 'lucide-react';

interface DocumentLibraryProps {
  documents: AppDocument[];
  clients: Client[];
  projects: Project[];
  teamMembers: TeamMember[];
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
  isSystem?: boolean;
}

interface DocumentWithMeta extends AppDocument {
  isFavorite?: boolean;
  folderId?: string;
  version?: number;
  tags?: string[];
  description?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'lastModified' | 'size' | 'category';
type SortDirection = 'asc' | 'desc';

// File type icons with colors
const FileTypeIcon: React.FC<{ type: AppDocument['fileType']; size?: 'sm' | 'md' | 'lg' }> = ({ type, size = 'md' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  const icons: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
    pdf: { icon: <FileText className={sizeClasses[size]} />, bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600 dark:text-red-400' },
    docx: { icon: <FileText className={sizeClasses[size]} />, bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
    xlsx: { icon: <FileSpreadsheet className={sizeClasses[size]} />, bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' },
    pptx: { icon: <Presentation className={sizeClasses[size]} />, bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400' },
    image: { icon: <FileImage className={sizeClasses[size]} />, bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600 dark:text-purple-400' },
    other: { icon: <File className={sizeClasses[size]} />, bgColor: 'bg-slate-100 dark:bg-slate-700', textColor: 'text-slate-600 dark:text-slate-400' },
  };
  const { icon, bgColor, textColor } = icons[type] || icons.other;
  return (
    <div className={`${sizeClasses[size]} p-1.5 rounded-lg ${bgColor} ${textColor} flex items-center justify-center`}>
      {icon}
    </div>
  );
};

// System folders
const systemFolders: Folder[] = [
  { id: 'all', name: 'All Documents', parentId: null, isSystem: true },
  { id: 'favorites', name: 'Favorites', parentId: null, isSystem: true },
  { id: 'recent', name: 'Recently Accessed', parentId: null, isSystem: true },
  { id: 'client', name: 'Client Documents', parentId: null, isSystem: true },
  { id: 'project', name: 'Project Documents', parentId: null, isSystem: true },
  { id: 'internal', name: 'Internal', parentId: null, isSystem: true },
  { id: 'template', name: 'Templates', parentId: null, isSystem: true },
];

// Connected services - will be updated dynamically based on connection status
const getConnectedServices = (isGoogleDriveConnected: boolean) => [
  { id: 'google-drive', name: 'Google Drive', icon: Cloud, connected: isGoogleDriveConnected },
  { id: 'onedrive', name: 'OneDrive', icon: Cloud, connected: false },
  { id: 'dropbox', name: 'Dropbox', icon: Archive, connected: false },
];

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  clients,
  projects,
  teamMembers,
}) => {
  // Auth
  const { user } = useAuth();

  // Google Drive connection state
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isConnectingGoogleDrive, setIsConnectingGoogleDrive] = useState(false);
  const [isSyncingGoogleDrive, setIsSyncingGoogleDrive] = useState(false);

  // Initialize Google Drive service
  useEffect(() => {
    const initGoogleDrive = async () => {
      if (user?.id) {
        const connected = await googleDriveService.init(user.id);
        setIsGoogleDriveConnected(connected);
      }
    };
    initGoogleDrive();
  }, [user?.id]);

  // Handle Google Drive OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state === 'google_drive_connect') {
        setIsConnectingGoogleDrive(true);
        try {
          await googleDriveService.exchangeCodeForTokens(code);
          setIsGoogleDriveConnected(true);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (error) {
          console.error('Failed to connect Google Drive:', error);
          alert('Failed to connect Google Drive. Please try again.');
        } finally {
          setIsConnectingGoogleDrive(false);
        }
      }
    };
    handleOAuthCallback();
  }, []);

  // Connect to Google Drive
  const connectGoogleDrive = () => {
    const authUrl = googleDriveService.getAuthUrl();
    window.location.href = authUrl;
  };

  // Disconnect Google Drive
  const disconnectGoogleDrive = async () => {
    await googleDriveService.disconnect();
    setIsGoogleDriveConnected(false);
  };

  // Sync with Google Drive
  const syncGoogleDrive = async () => {
    if (!isGoogleDriveConnected) return;
    setIsSyncingGoogleDrive(true);
    try {
      const result = await googleDriveService.syncAll();
      alert(`Synced ${result.synced} documents. ${result.errors.length > 0 ? `Errors: ${result.errors.length}` : ''}`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setIsSyncingGoogleDrive(false);
    }
  };

  // Get connected services with current status
  const connectedServicesMenu = getConnectedServices(isGoogleDriveConnected);

  // State
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<AppDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['folders', 'categories']));
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [customFolders, setCustomFolders] = useState<Folder[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentDocuments, setRecentDocuments] = useState<string[]>([]);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; doc: AppDocument } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>(DocumentCategory.Internal);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('doc_favorites');
    const savedRecent = localStorage.getItem('doc_recent');
    const savedFolders = localStorage.getItem('doc_custom_folders');

    if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
    if (savedRecent) setRecentDocuments(JSON.parse(savedRecent));
    if (savedFolders) setCustomFolders(JSON.parse(savedFolders));
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('doc_favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('doc_recent', JSON.stringify(recentDocuments));
  }, [recentDocuments]);

  useEffect(() => {
    localStorage.setItem('doc_custom_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Filter by active folder
    switch (activeFolder) {
      case 'all':
        break;
      case 'favorites':
        result = result.filter(doc => favorites.has(doc.id));
        break;
      case 'recent':
        result = result.filter(doc => recentDocuments.includes(doc.id));
        // Sort by recent access order
        result.sort((a, b) => recentDocuments.indexOf(a.id) - recentDocuments.indexOf(b.id));
        break;
      case 'client':
        result = result.filter(doc => doc.category === DocumentCategory.Client);
        break;
      case 'project':
        result = result.filter(doc => doc.category === DocumentCategory.Project);
        break;
      case 'internal':
        result = result.filter(doc => doc.category === DocumentCategory.Internal);
        break;
      case 'template':
        result = result.filter(doc => doc.category === DocumentCategory.Template);
        break;
      default:
        // Custom folder - would filter by folderId if implemented
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
      );
    }

    // Sort (unless viewing recent which has its own order)
    if (activeFolder !== 'recent') {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'lastModified':
            comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
            break;
          case 'size':
            comparison = parseFloat(a.size) - parseFloat(b.size);
            break;
          case 'category':
            comparison = a.category.localeCompare(b.category);
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [documents, activeFolder, searchQuery, sortField, sortDirection, favorites, recentDocuments]);

  // Helper functions
  const getRelatedName = useCallback((doc: AppDocument) => {
    if (doc.category === DocumentCategory.Client) {
      return clients.find(c => c.id === doc.relatedId)?.name || 'Unknown Client';
    }
    if (doc.category === DocumentCategory.Project) {
      return projects.find(p => p.id === doc.relatedId)?.name || 'Unknown Project';
    }
    return '—';
  }, [clients, projects]);

  const getUploaderName = useCallback((id: string) => {
    return teamMembers.find(tm => tm.id === id)?.name || 'Unknown';
  }, [teamMembers]);

  const toggleFavorite = useCallback((docId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(docId)) {
        newFavorites.delete(docId);
      } else {
        newFavorites.add(docId);
      }
      return newFavorites;
    });
  }, []);

  const addToRecent = useCallback((docId: string) => {
    setRecentDocuments(prev => {
      const filtered = prev.filter(id => id !== docId);
      return [docId, ...filtered].slice(0, 20); // Keep last 20
    });
  }, []);

  const handleDocumentClick = useCallback((doc: AppDocument) => {
    addToRecent(doc.id);
    setPreviewDocument(doc);
    setShowPreviewModal(true);
  }, [addToRecent]);

  const handleContextMenu = useCallback((e: React.MouseEvent, doc: AppDocument) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, doc });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  const toggleDocumentSelection = useCallback((docId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  }, []);

  const selectAllDocuments = useCallback(() => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
    }
  }, [filteredDocuments, selectedDocuments.size]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setShowUploadModal(true);
    }
  }, []);

  const getFileType = (file: File): AppDocument['fileType'] => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'docx';
    if (['xls', 'xlsx'].includes(ext || '')) return 'xlsx';
    if (['ppt', 'pptx'].includes(ext || '')) return 'pptx';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newProgress: { [key: string]: number } = {};
    selectedFiles.forEach(f => { newProgress[f.name] = 0; });
    setUploadProgress(newProgress);

    try {
      for (const file of selectedFiles) {
        // Create a unique file path
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `documents/${timestamp}_${safeName}`;

        // Update progress to show upload started
        setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error for', file.name, uploadError);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // -1 indicates error
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 60 }));

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Insert document record into database
        // Using correct column names from schema: file_url, uploaded_by_id, uploaded_at
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            file_type: getFileType(file),
            category: uploadCategory,
            file_url: urlData?.publicUrl || filePath,
            uploaded_by_id: user?.id || null,
            uploaded_at: new Date().toISOString(),
          });

        if (dbError) {
          console.error('Database error for', file.name, dbError);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      // Check if all files uploaded successfully
      const allSuccessful = Object.values(uploadProgress).every(p => p === 100);
      if (allSuccessful) {
        setTimeout(() => {
          setShowUploadModal(false);
          setSelectedFiles([]);
          setUploadProgress({});
          // Trigger a refresh of documents - parent component should handle this
          window.dispatchEvent(new CustomEvent('documents-updated'));
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const createFolder = useCallback(() => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        parentId: null,
      };
      setCustomFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  }, [newFolderName]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Folder counts
  const folderCounts = useMemo(() => ({
    all: documents.length,
    favorites: documents.filter(d => favorites.has(d.id)).length,
    recent: Math.min(recentDocuments.length, 20),
    client: documents.filter(d => d.category === DocumentCategory.Client).length,
    project: documents.filter(d => d.category === DocumentCategory.Project).length,
    internal: documents.filter(d => d.category === DocumentCategory.Internal).length,
    template: documents.filter(d => d.category === DocumentCategory.Template).length,
  }), [documents, favorites, recentDocuments]);

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900">
      {/* Left Sidebar - Branching Menu */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-rose-500" />
            Documents
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Quick Access */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('quick')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Quick Access
              {expandedSections.has('quick') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.has('quick') && (
              <div className="mt-1 space-y-0.5">
                {[
                  { id: 'all', name: 'All Documents', icon: FolderOpen, count: folderCounts.all },
                  { id: 'favorites', name: 'Favorites', icon: Star, count: folderCounts.favorites },
                  { id: 'recent', name: 'Recent', icon: Clock, count: folderCounts.recent },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFolder(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeFolder === item.id
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Categories
              {expandedSections.has('categories') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.has('categories') && (
              <div className="mt-1 space-y-0.5">
                {[
                  { id: 'client', name: 'Client Documents', count: folderCounts.client },
                  { id: 'project', name: 'Project Documents', count: folderCounts.project },
                  { id: 'internal', name: 'Internal', count: folderCounts.internal },
                  { id: 'template', name: 'Templates', count: folderCounts.template },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFolder(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeFolder === item.id
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Folders */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('folders')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              My Folders
              {expandedSections.has('folders') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.has('folders') && (
              <div className="mt-1 space-y-0.5">
                {customFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeFolder === folder.id
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    {folder.name}
                  </button>
                ))}
                <button
                  onClick={() => setShowNewFolderDialog(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
              </div>
            )}
          </div>

          {/* Connected Services */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Connected Services
              {expandedSections.has('services') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.has('services') && (
              <div className="mt-1 space-y-0.5">
                {connectedServicesMenu.map(service => (
                  <div key={service.id} className="space-y-1">
                    <button
                      onClick={() => {
                        if (service.id === 'google-drive') {
                          if (service.connected) {
                            if (confirm('Disconnect Google Drive?')) {
                              disconnectGoogleDrive();
                            }
                          } else {
                            connectGoogleDrive();
                          }
                        }
                      }}
                      disabled={isConnectingGoogleDrive}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <service.icon className="w-4 h-4" />
                        {service.name}
                      </span>
                      {isConnectingGoogleDrive && service.id === 'google-drive' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : service.connected ? (
                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                      ) : (
                        <span className="text-xs text-blue-500 hover:text-blue-600">Connect</span>
                      )}
                    </button>
                    {/* Sync button for connected services */}
                    {service.connected && service.id === 'google-drive' && (
                      <button
                        onClick={syncGoogleDrive}
                        disabled={isSyncingGoogleDrive}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncingGoogleDrive ? 'animate-spin' : ''}`} />
                        {isSyncingGoogleDrive ? 'Syncing...' : 'Sync Now'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Storage Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Storage Used</span>
            <span>2.4 GB / 10 GB</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: '24%' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeFolder === 'all' ? 'All Documents' :
                 activeFolder === 'favorites' ? 'Favorites' :
                 activeFolder === 'recent' ? 'Recently Accessed' :
                 systemFolders.find(f => f.id === activeFolder)?.name ||
                 customFolders.find(f => f.id === activeFolder)?.name ||
                 'Documents'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-rose-500 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-600 text-rose-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-600 text-rose-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettingsPanel(true)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedDocuments.size > 0 && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="px-3 py-1.5 text-sm text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  Move to
                </button>
                <button className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-1">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedDocuments(new Set())}
                  className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Document Area with Drag & Drop */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 overflow-auto p-4 transition-colors ${
            isDragging ? 'bg-rose-50 dark:bg-rose-900/10' : ''
          }`}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="fixed inset-0 z-40 bg-rose-500/10 border-4 border-dashed border-rose-500 flex items-center justify-center pointer-events-none">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-2xl text-center">
                <Upload className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-slate-900 dark:text-white">Drop files to upload</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Release to add files to your library</p>
              </div>
            </div>
          )}

          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                {searchQuery
                  ? `No documents match "${searchQuery}". Try a different search term.`
                  : 'Upload your first document or drag and drop files here.'}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg font-medium shadow-lg transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload Documents
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                        onChange={selectAllDocuments}
                        className="w-4 h-4 text-rose-500 rounded border-slate-300 dark:border-slate-600 focus:ring-rose-500"
                      />
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        Name
                        {sortField === 'name' && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSort('category')}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        Category
                        {sortField === 'category' && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Related To
                    </th>
                    <th
                      onClick={() => handleSort('size')}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        Size
                        {sortField === 'size' && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSort('lastModified')}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        Modified
                        {sortField === 'lastModified' && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </span>
                    </th>
                    <th className="w-20 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredDocuments.map(doc => (
                    <tr
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      onContextMenu={(e) => handleContextMenu(e, doc)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(doc.id)}
                          onChange={() => toggleDocumentSelection(doc.id)}
                          className="w-4 h-4 text-rose-500 rounded border-slate-300 dark:border-slate-600 focus:ring-rose-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileTypeIcon type={doc.fileType} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              by {getUploaderName(doc.uploadedById)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                              favorites.has(doc.id)
                                ? 'text-amber-500'
                                : 'text-slate-400 hover:text-amber-500'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${favorites.has(doc.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.category === DocumentCategory.Client ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          doc.category === DocumentCategory.Project ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          doc.category === DocumentCategory.Internal ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {getRelatedName(doc)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {doc.size}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(doc.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleContextMenu(e, doc)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  onContextMenu={(e) => handleContextMenu(e, doc)}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-700 cursor-pointer transition-all group relative"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedDocuments.has(doc.id)}
                    onChange={(e) => { e.stopPropagation(); toggleDocumentSelection(doc.id); }}
                    className="absolute top-3 left-3 w-4 h-4 text-rose-500 rounded border-slate-300 dark:border-slate-600 focus:ring-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Favorite */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                    className={`absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      favorites.has(doc.id)
                        ? 'text-amber-500 opacity-100'
                        : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(doc.id) ? 'fill-current' : ''}`} />
                  </button>

                  <div className="flex flex-col items-center text-center pt-4">
                    <FileTypeIcon type={doc.fileType} size="lg" />
                    <h3 className="mt-3 text-sm font-medium text-slate-900 dark:text-white truncate w-full px-2">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {doc.size} • {new Date(doc.lastModified).toLocaleDateString()}
                    </p>
                    <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      doc.category === DocumentCategory.Client ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      doc.category === DocumentCategory.Project ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      doc.category === DocumentCategory.Internal ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {doc.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 220),
            top: Math.min(contextMenu.y, window.innerHeight - 300),
          }}
        >
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => { toggleFavorite(contextMenu.doc.id); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Star className={`w-4 h-4 ${favorites.has(contextMenu.doc.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
            {favorites.has(contextMenu.doc.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Edit3 className="w-4 h-4" />
            Rename
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <FolderOpen className="w-4 h-4" />
            Move to Folder
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Link2 className="w-4 h-4" />
            Copy Link
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Documents</h2>
                <button
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  disabled={isUploading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  selectedFiles.length > 0
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-900 dark:text-white font-medium mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  PDF, DOC, XLS, PPT, images up to 50MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setSelectedFiles(prev => [...prev, ...files]);
                    }
                  }}
                />
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileTypeIcon type={getFileType(file)} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadProgress[file.name] !== undefined && (
                          <div className="flex items-center gap-2">
                            {uploadProgress[file.name] === -1 ? (
                              <span className="text-xs text-red-500">Failed</span>
                            ) : uploadProgress[file.name] === 100 ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <>
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-rose-500 transition-all duration-300"
                                    style={{ width: `${uploadProgress[file.name]}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">{uploadProgress[file.name]}%</span>
                              </>
                            )}
                          </div>
                        )}
                        {!isUploading && (
                          <button
                            onClick={() => removeSelectedFile(file.name)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category selector */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  disabled={isUploading}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value={DocumentCategory.Client}>Client Documents</option>
                  <option value={DocumentCategory.Project}>Project Documents</option>
                  <option value={DocumentCategory.Internal}>Internal</option>
                  <option value={DocumentCategory.Template}>Templates</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setUploadProgress({});
                }}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileTypeIcon type={previewDocument.fileType} size="lg" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{previewDocument.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {previewDocument.size} • Uploaded by {getUploaderName(previewDocument.uploadedById)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(previewDocument.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.has(previewDocument.id)
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${favorites.has(previewDocument.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Document details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Category</h3>
                  <p className="text-slate-900 dark:text-white">{previewDocument.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Related To</h3>
                  <p className="text-slate-900 dark:text-white">{getRelatedName(previewDocument)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">File Type</h3>
                  <p className="text-slate-900 dark:text-white uppercase">{previewDocument.fileType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Modified</h3>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(previewDocument.lastModified).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Preview placeholder */}
              <div className="mt-6 p-12 bg-slate-100 dark:bg-slate-700 rounded-xl text-center">
                <FileTypeIcon type={previewDocument.fileType} size="lg" />
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                  Document preview not available
                </p>
                <button className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto">
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Details
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewFolderDialog(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
