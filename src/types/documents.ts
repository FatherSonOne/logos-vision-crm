/**
 * Enterprise Document Library - Type Definitions
 * Phase 1: Foundation types for AI, versioning, Pulse integration, and analytics
 */

import type { Document } from './index';

// ============================================================================
// Storage Provider Types
// ============================================================================

export type StorageProvider = 'supabase' | 'google_drive' | 'onedrive' | 'pulse';

export type SyncStatus = 'pending' | 'synced' | 'error' | 'conflict';

export type SyncDirection = 'pulse_to_logos' | 'logos_to_pulse' | 'bidirectional';

// ============================================================================
// Document Visibility & Security
// ============================================================================

export type DocumentVisibility = 'private' | 'team' | 'organization' | 'public';

export type DocumentSensitivity = 'public' | 'normal' | 'confidential' | 'restricted';

// ============================================================================
// Pulse Integration Types
// ============================================================================

export type PulseItemType = 'meeting' | 'chat_archive' | 'conversation' | 'vox' | 'project_file';

export interface PulseDocumentSource {
  type: PulseItemType;
  item_id: string;
  title: string;
  channel_id?: string;
  channel_name?: string;
  date: string;
  participants?: string[];
}

export interface DocumentPulseItem {
  id: string;
  document_id: string;
  pulse_item_type: PulseItemType;
  pulse_item_id: string;
  pulse_channel_id?: string;
  pulse_channel_name?: string;
  sync_status: SyncStatus;
  sync_direction: SyncDirection;
  last_synced_at?: string;
  sync_error_message?: string;
  pulse_participants?: string[];
  pulse_created_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AI Metadata Types
// ============================================================================

export interface DetectedEntity {
  type: 'person' | 'organization' | 'location' | 'date' | 'email' | 'phone' | 'custom';
  value: string;
  confidence?: number;
  context?: string;
}

export interface DocumentAIMetadata {
  id: string;
  document_id: string;

  // Text extraction (OCR/PDF parsing)
  extracted_text?: string;
  language_detected?: string;
  extraction_confidence?: number;

  // AI Classification
  classification_category?: string;
  classification_confidence?: number;
  classification_reasoning?: string;

  // Auto-tagging
  auto_tags: string[];
  suggested_tags?: string[];

  // Entity extraction
  detected_entities?: Record<string, DetectedEntity[]>;

  // Summarization
  ai_summary?: string;
  key_points?: string[];

  // Processing metadata
  processed_at: string;
  processing_time_ms?: number;
  ai_model_used?: string;
}

// ============================================================================
// Version Control Types
// ============================================================================

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  file_path?: string;
  file_size?: number;
  uploaded_by_id?: string;
  change_description?: string;
  created_at: string;
}

export interface VersionComparison {
  version1: DocumentVersion;
  version2: DocumentVersion;
  differences: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  text_diff?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DocumentAnalytics {
  id: string;
  document_id: string;
  view_count: number;
  download_count: number;
  share_count: number;
  preview_count: number;
  last_viewed_at?: string;
  last_downloaded_at?: string;
  last_shared_at?: string;
  ai_processing_count: number;
  avg_ai_processing_time_ms?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUsageStats {
  total_views: number;
  total_downloads: number;
  total_shares: number;
  unique_viewers: number;
  avg_views_per_document: number;
  most_viewed_documents: Array<{
    document_id: string;
    name: string;
    view_count: number;
  }>;
  trending_documents: Array<{
    document_id: string;
    name: string;
    recent_activity_score: number;
  }>;
}

export interface StorageStats {
  total_size_bytes: number;
  total_documents: number;
  by_category: Record<string, {
    count: number;
    size_bytes: number;
  }>;
  by_provider: Record<StorageProvider, {
    count: number;
    size_bytes: number;
  }>;
  by_type: Record<string, {
    count: number;
    size_bytes: number;
  }>;
}

// ============================================================================
// Smart Collections Types
// ============================================================================

export type RuleOperator = 'and' | 'or';

export type RuleFieldType =
  | 'category'
  | 'tag'
  | 'file_type'
  | 'created_at'
  | 'updated_at'
  | 'size'
  | 'owner'
  | 'project'
  | 'client'
  | 'pulse_type'
  | 'ai_classification'
  | 'visibility'
  | 'sensitivity';

export type RuleCondition =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'in_last'
  | 'before'
  | 'after';

export interface CollectionRule {
  field: RuleFieldType;
  condition: RuleCondition;
  value: any;
  unit?: 'days' | 'weeks' | 'months' | 'years'; // For date ranges
}

export interface SmartCollection {
  id: string;
  name: string;
  description?: string;
  rules: CollectionRule[];
  rule_operator: RuleOperator;
  color?: string;
  icon?: string;
  owner_id?: string;
  is_shared: boolean;
  shared_with_team_ids?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Folder Types
// ============================================================================

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  path: string;
  level: number;
  color?: string;
  icon?: string;
  auto_version_enabled: boolean;
  version_retention_count: number;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FolderTreeNode extends DocumentFolder {
  children?: FolderTreeNode[];
  document_count?: number;
  total_size?: number;
}

// ============================================================================
// Enhanced Document Type
// ============================================================================

export interface EnhancedDocument extends Document {
  // Storage & sync
  storage_provider: StorageProvider;
  sync_status?: SyncStatus;

  // Folder organization
  folder_id?: string;
  folder?: DocumentFolder;

  // Versioning
  version_number: number;
  version_history?: DocumentVersion[];

  // AI metadata
  ai_metadata?: DocumentAIMetadata;
  extracted_text?: string;
  auto_tags?: string[];
  ai_processed: boolean;
  ocr_processed: boolean;

  // Pulse integration
  pulse_source?: PulseDocumentSource;
  pulse_synced: boolean;

  // Enhanced features
  thumbnail_url?: string;
  preview_available: boolean;

  // Security
  visibility: DocumentVisibility;
  sensitivity_level: DocumentSensitivity;

  // Analytics (optional, loaded when needed)
  analytics?: DocumentAnalytics;
}

// ============================================================================
// Service Request/Response Types
// ============================================================================

export interface DocumentFilters {
  category?: string;
  tags?: string[];
  folder_id?: string;
  project_id?: string;
  client_id?: string;
  storage_provider?: StorageProvider;
  pulse_type?: PulseItemType;
  visibility?: DocumentVisibility;
  sensitivity?: DocumentSensitivity;
  search?: string;
  created_after?: Date;
  created_before?: Date;
  file_types?: string[];
  has_ai_metadata?: boolean;
  has_versions?: boolean;
  is_pulse_synced?: boolean;
}

export interface DocumentSearchOptions {
  query: string;
  filters?: DocumentFilters;
  use_ai_search?: boolean;
  include_content?: boolean; // Search in extracted text
  limit?: number;
  offset?: number;
  sort_by?: 'relevance' | 'created_at' | 'updated_at' | 'name' | 'size';
  sort_order?: 'asc' | 'desc';
}

export interface DocumentSearchResult {
  document: EnhancedDocument;
  relevance_score: number;
  matched_fields: string[];
  matched_sections?: string[];
  highlights?: Record<string, string[]>;
}

export interface SearchResults {
  results: DocumentSearchResult[];
  total_count: number;
  query: string;
  processing_time_ms: number;
  ai_used: boolean;
}

export interface UploadOptions {
  category?: string;
  folder_id?: string;
  project_id?: string;
  client_id?: string;
  tags?: string[];
  visibility?: DocumentVisibility;
  sensitivity?: DocumentSensitivity;
  run_ai_processing?: boolean;
  auto_classify?: boolean;
  extract_text?: boolean;
  generate_thumbnail?: boolean;
}

export interface UploadProgress {
  file_name: string;
  bytes_uploaded: number;
  total_bytes: number;
  percentage: number;
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error';
  error_message?: string;
  ai_processing?: {
    classification?: { status: 'pending' | 'processing' | 'complete' | 'error' };
    ocr?: { status: 'pending' | 'processing' | 'complete' | 'error' };
    tagging?: { status: 'pending' | 'processing' | 'complete' | 'error' };
  };
}

export interface BulkOperationResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    document_id: string;
    error: string;
  }>;
}

export interface ImportResult {
  imported_count: number;
  skipped_count: number;
  error_count: number;
  imported_documents: EnhancedDocument[];
  errors: Array<{
    pulse_item_id: string;
    error: string;
  }>;
}

// ============================================================================
// UI State Types
// ============================================================================

export type DocumentViewMode = 'grid' | 'list';

export type DocumentSortField = 'name' | 'created_at' | 'updated_at' | 'size' | 'category';

export type DocumentSortOrder = 'asc' | 'desc';

export interface DocumentListState {
  view_mode: DocumentViewMode;
  sort_field: DocumentSortField;
  sort_order: DocumentSortOrder;
  filters: DocumentFilters;
  selected_ids: string[];
  search_query: string;
}

export interface DocumentPreviewState {
  document: EnhancedDocument;
  show_ai_panel: boolean;
  current_version?: number;
  show_versions: boolean;
  show_analytics: boolean;
}

// ============================================================================
// Feature Flags
// ============================================================================

export interface DocumentFeatureFlags {
  ai_classification_enabled: boolean;
  ai_tagging_enabled: boolean;
  ocr_enabled: boolean;
  semantic_search_enabled: boolean;
  pulse_sync_enabled: boolean;
  version_control_enabled: boolean;
  smart_collections_enabled: boolean;
  analytics_enabled: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class DocumentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DocumentError';
  }
}

export class AIProcessingError extends DocumentError {
  constructor(message: string, details?: any) {
    super(message, 'AI_PROCESSING_ERROR', details);
    this.name = 'AIProcessingError';
  }
}

export class PulseSyncError extends DocumentError {
  constructor(message: string, details?: any) {
    super(message, 'PULSE_SYNC_ERROR', details);
    this.name = 'PulseSyncError';
  }
}

export class StorageError extends DocumentError {
  constructor(message: string, details?: any) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
  }
}
