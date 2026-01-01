import React, { useState, useEffect } from 'react';
import {
  Building2, ChevronDown, ChevronRight, Users, GitBranch,
  Plus, MoreHorizontal, ExternalLink
} from 'lucide-react';
import { organizationService } from '../services/organizationService';
import type { OrganizationHierarchy, OrganizationSummary } from '../types';

interface OrgNode {
  id: string;
  name: string;
  type: string;
  contactCount?: number;
  children: OrgNode[];
}

interface OrgChartProps {
  rootOrganizationId?: string;
  onOrganizationClick?: (organizationId: string) => void;
  onAddChildOrg?: (parentId: string) => void;
  showContactCounts?: boolean;
  maxDepth?: number;
}

interface OrgNodeProps {
  node: OrgNode;
  depth: number;
  maxDepth: number;
  isLast: boolean;
  onOrganizationClick?: (organizationId: string) => void;
  onAddChildOrg?: (parentId: string) => void;
  showContactCounts?: boolean;
}

const HIERARCHY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  root: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
  subsidiary: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  chapter: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  affiliate: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  division: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  department: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
  branch: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
  region: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
};

const HIERARCHY_LABELS: Record<string, string> = {
  root: 'Parent',
  subsidiary: 'Subsidiary',
  chapter: 'Chapter',
  affiliate: 'Affiliate',
  division: 'Division',
  department: 'Department',
  branch: 'Branch',
  region: 'Region',
};

const OrgNodeComponent: React.FC<OrgNodeProps> = ({
  node,
  depth,
  maxDepth,
  isLast,
  onOrganizationClick,
  onAddChildOrg,
  showContactCounts,
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const colors = HIERARCHY_COLORS[node.type] || HIERARCHY_COLORS.subsidiary;

  return (
    <div className="relative">
      {/* Vertical connector line */}
      {depth > 0 && (
        <div
          className={`absolute left-0 top-0 w-px bg-gray-300 ${isLast ? 'h-6' : 'h-full'}`}
          style={{ left: '-24px' }}
        />
      )}

      {/* Horizontal connector line */}
      {depth > 0 && (
        <div
          className="absolute top-6 h-px bg-gray-300"
          style={{ left: '-24px', width: '24px' }}
        />
      )}

      <div className="pl-0">
        {/* Node */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${colors.bg} ${colors.border}`}
          onClick={() => onOrganizationClick?.(node.id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && depth < maxDepth ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.text} bg-white/50`}>
            <Building2 className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-800 truncate">{node.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                {HIERARCHY_LABELS[node.type] || node.type}
              </span>
            </div>
            {showContactCounts && node.contactCount !== undefined && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
                <Users className="w-3.5 h-3.5" />
                {node.contactCount} contacts
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onAddChildOrg && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildOrg(node.id);
                }}
                className="p-1.5 hover:bg-white/50 rounded transition-colors"
                title="Add child organization"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrganizationClick?.(node.id);
              }}
              className="p-1.5 hover:bg-white/50 rounded transition-colors"
              title="View organization"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && depth < maxDepth && (
          <div className="ml-12 mt-2 space-y-2 relative">
            {node.children.map((child, index) => (
              <OrgNodeComponent
                key={child.id}
                node={child}
                depth={depth + 1}
                maxDepth={maxDepth}
                isLast={index === node.children.length - 1}
                onOrganizationClick={onOrganizationClick}
                onAddChildOrg={onAddChildOrg}
                showContactCounts={showContactCounts}
              />
            ))}
          </div>
        )}

        {/* Collapsed children indicator */}
        {hasChildren && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-12 mt-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <GitBranch className="w-4 h-4" />
            {node.children.length} child organization{node.children.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({
  rootOrganizationId,
  onOrganizationClick,
  onAddChildOrg,
  showContactCounts = true,
  maxDepth = 5,
}) => {
  const [tree, setTree] = useState<OrgNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rootOrganizationId) {
      loadOrgTree();
    }
  }, [rootOrganizationId]);

  const loadOrgTree = async () => {
    if (!rootOrganizationId) return;

    try {
      setLoading(true);
      setError(null);
      const treeData = await organizationService.getOrganizationTree(rootOrganizationId);
      setTree(treeData);
    } catch (err: any) {
      console.error('Error loading org tree:', err);
      setError(err.message || 'Failed to load organization tree');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={loadOrgTree}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No organization hierarchy to display</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <OrgNodeComponent
        node={tree}
        depth={0}
        maxDepth={maxDepth}
        isLast={true}
        onOrganizationClick={onOrganizationClick}
        onAddChildOrg={onAddChildOrg}
        showContactCounts={showContactCounts}
      />
    </div>
  );
};

// Simplified flat list view for organizations
interface OrgListProps {
  organizations: OrganizationSummary[];
  onOrganizationClick?: (organizationId: string) => void;
  selectedId?: string;
}

export const OrgList: React.FC<OrgListProps> = ({
  organizations,
  onOrganizationClick,
  selectedId,
}) => {
  return (
    <div className="space-y-2">
      {organizations.map((org) => (
        <button
          key={org.organizationId}
          onClick={() => onOrganizationClick?.(org.organizationId)}
          className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
            selectedId === org.organizationId
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 truncate">{org.organizationName}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {org.affiliatedContactsCount} contacts
              </span>
              {org.childOrgsCount > 0 && (
                <span className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  {org.childOrgsCount} child orgs
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      ))}

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No organizations found</p>
        </div>
      )}
    </div>
  );
};