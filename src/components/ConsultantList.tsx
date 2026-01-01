import React, { useState, useMemo } from 'react';
import type { TeamMember, TeamMemberPermission } from '../types';
import { PlusIcon } from './icons';
import { TeamMemberSlideOut } from './TeamMemberSlideOut';
import { Shield, Edit3, Eye, Mail, Phone, Camera, ChevronDown, SortAsc } from 'lucide-react';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  onAddTeamMember: () => void;
  onUpdateTeamMember?: (member: TeamMember) => void;
  currentUserPermission?: TeamMemberPermission;
  currentUserId?: string; // Current logged-in user's team member ID
}

// Permission badge for cards
const PermissionBadge: React.FC<{ permission?: TeamMemberPermission }> = ({ permission = 'viewer' }) => {
  const config = {
    admin: { icon: Shield, label: 'Admin', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400' },
    editor: { icon: Edit3, label: 'Editor', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
    viewer: { icon: Eye, label: 'Viewer', bgColor: 'bg-gray-100 dark:bg-gray-800/50', textColor: 'text-gray-500 dark:text-gray-400' },
  };
  const { icon: Icon, label, bgColor, textColor } = config[permission];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
};

// Profile completion indicator - shows which fields are filled
const ProfileCompletionDots: React.FC<{ member: TeamMember }> = ({ member }) => {
  const fields = [
    { filled: !!member.profilePicture, label: 'Photo' },
    { filled: !!member.role, label: 'Role' },
    { filled: !!member.email, label: 'Email' },
    { filled: !!member.phone, label: 'Phone' },
  ];

  const filledCount = fields.filter(f => f.filled).length;
  const isComplete = filledCount === fields.length;

  return (
    <div className="flex items-center gap-1" title={`${filledCount}/${fields.length} fields complete`}>
      {fields.map((field, idx) => (
        <div
          key={idx}
          className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
          style={{
            backgroundColor: field.filled
              ? (isComplete ? 'var(--cmf-success)' : 'var(--cmf-accent)')
              : 'var(--cmf-border)',
          }}
          title={`${field.label}: ${field.filled ? 'Added' : 'Missing'}`}
        />
      ))}
    </div>
  );
};

// Sort options
type SortOption = 'name' | 'role' | 'permission';

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: () => void;
  isCurrentUser?: boolean;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onClick, isCurrentUser }) => {
  const initial = member.name.charAt(0).toUpperCase();
  const hasContactInfo = member.email || member.phone;

  // Handle quick action clicks without triggering card click
  const handleQuickAction = (e: React.MouseEvent, action: 'email' | 'phone') => {
    e.stopPropagation();
    if (action === 'email' && member.email) {
      window.location.href = `mailto:${member.email}`;
    } else if (action === 'phone' && member.phone) {
      window.location.href = `tel:${member.phone}`;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-6 rounded-xl text-center flex flex-col items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer group relative"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        border: isCurrentUser ? '2px solid var(--cmf-accent)' : '1px solid var(--cmf-border)',
      }}
    >
      {/* Top row: Completion dots (left) and You badge (right) */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
        <ProfileCompletionDots member={member} />
        {isCurrentUser && (
          <div
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--cmf-accent)',
              color: 'var(--cmf-accent-text)',
            }}
          >
            You
          </div>
        )}
      </div>

      {/* Profile Picture or Initial with photo prompt */}
      <div className="relative mt-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: 'var(--cmf-accent-subtle)',
            border: isCurrentUser ? '3px solid var(--cmf-accent)' : '3px solid var(--cmf-border)',
          }}
        >
          {member.profilePicture ? (
            <img
              src={member.profilePicture}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Initial shown by default, camera icon on hover */}
              <span
                className="text-3xl font-bold group-hover:hidden"
                style={{ color: 'var(--cmf-accent)' }}
              >
                {initial}
              </span>
              <div className="hidden group-hover:flex flex-col items-center">
                <Camera className="w-6 h-6" style={{ color: 'var(--cmf-accent)' }} />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--cmf-text-muted)' }}>
                  Add photo
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name */}
      <h3
        className="text-lg font-semibold truncate w-full mb-1 mt-4"
        style={{ color: 'var(--cmf-text)' }}
      >
        {member.name}
      </h3>

      {/* Role - show placeholder if empty */}
      <p
        className="text-sm mb-2 truncate w-full"
        style={{
          color: member.role ? 'var(--cmf-text-secondary)' : 'var(--cmf-text-muted)',
          fontStyle: member.role ? 'normal' : 'italic',
        }}
      >
        {member.role || 'Add role'}
      </p>

      {/* Permission Badge */}
      <PermissionBadge permission={member.permission} />

      {/* Quick Contact Actions - shown on hover if contact info exists */}
      <div className="mt-3 h-8 flex items-center justify-center gap-2">
        {hasContactInfo ? (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {member.email && (
              <button
                onClick={(e) => handleQuickAction(e, 'email')}
                className="p-1.5 rounded-full transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: 'var(--cmf-accent-subtle)',
                  color: 'var(--cmf-accent)',
                }}
                title={`Email ${member.name}`}
              >
                <Mail className="w-4 h-4" />
              </button>
            )}
            {member.phone && (
              <button
                onClick={(e) => handleQuickAction(e, 'phone')}
                className="p-1.5 rounded-full transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: 'var(--cmf-accent-subtle)',
                  color: 'var(--cmf-accent)',
                }}
                title={`Call ${member.name}`}
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <p
            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color: 'var(--cmf-text-muted)', fontStyle: 'italic' }}
          >
            Add contact info
          </p>
        )}
      </div>
    </button>
  );
};

const AddTeamMemberCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-6 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
    style={{
      backgroundColor: 'var(--cmf-surface)',
      border: '2px dashed var(--cmf-border-strong)',
    }}
  >
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-105"
      style={{
        backgroundColor: 'var(--cmf-accent-subtle)',
      }}
    >
      <PlusIcon className="w-8 h-8" />
    </div>
    <h3
      className="text-lg font-semibold"
      style={{ color: 'var(--cmf-text-secondary)' }}
    >
      Add Member
    </h3>
  </button>
);

// Sort dropdown component
const SortDropdown: React.FC<{
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}> = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'permission', label: 'Permission' },
  ];

  const currentLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Name';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 hover:scale-[1.02]"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border)',
          color: 'var(--cmf-text-secondary)',
        }}
      >
        <SortAsc className="w-4 h-4" />
        <span>Sort: {currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-1 py-1 rounded-lg shadow-lg z-20 min-w-[140px]"
            style={{
              backgroundColor: 'var(--cmf-surface)',
              border: '1px solid var(--cmf-border)',
            }}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors duration-150"
                style={{
                  backgroundColor: sortBy === option.value ? 'var(--cmf-accent-subtle)' : 'transparent',
                  color: sortBy === option.value ? 'var(--cmf-accent)' : 'var(--cmf-text)',
                }}
                onMouseEnter={(e) => {
                  if (sortBy !== option.value) {
                    e.currentTarget.style.backgroundColor = 'var(--cmf-surface-2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (sortBy !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  teamMembers,
  onAddTeamMember,
  onUpdateTeamMember,
  currentUserPermission = 'viewer', // Default to viewer
  currentUserId,
}) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Sort team members based on selected option
  const sortedMembers = useMemo(() => {
    const sorted = [...teamMembers];
    switch (sortBy) {
      case 'name':
        // Sort by last name (last word of name)
        sorted.sort((a, b) => {
          const lastNameA = a.name.split(' ').pop()?.toLowerCase() || '';
          const lastNameB = b.name.split(' ').pop()?.toLowerCase() || '';
          return lastNameA.localeCompare(lastNameB);
        });
        break;
      case 'role':
        // Sort by role, empty roles at the end
        sorted.sort((a, b) => {
          if (!a.role && !b.role) return 0;
          if (!a.role) return 1;
          if (!b.role) return -1;
          return a.role.toLowerCase().localeCompare(b.role.toLowerCase());
        });
        break;
      case 'permission':
        // Sort by permission level: admin > editor > viewer
        const permissionOrder = { admin: 0, editor: 1, viewer: 2 };
        sorted.sort((a, b) => {
          const orderA = permissionOrder[a.permission || 'viewer'];
          const orderB = permissionOrder[b.permission || 'viewer'];
          return orderA - orderB;
        });
        break;
    }
    return sorted;
  }, [teamMembers, sortBy]);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsSlideOutOpen(true);
  };

  const handleCloseSlideOut = () => {
    setIsSlideOutOpen(false);
    // Delay clearing the member to allow for close animation
    setTimeout(() => setSelectedMember(null), 300);
  };

  const handleSaveMember = (updatedMember: TeamMember) => {
    if (onUpdateTeamMember) {
      onUpdateTeamMember(updatedMember);
    }
    // Update selected member with new data
    setSelectedMember(updatedMember);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--cmf-text)' }}
          >
            Team Members
          </h2>
          <span
            className="text-sm"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {/* Grid of team member cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedMembers.map((teamMember) => (
          <TeamMemberCard
            key={teamMember.id}
            member={teamMember}
            onClick={() => handleMemberClick(teamMember)}
            isCurrentUser={teamMember.id === currentUserId}
          />
        ))}
        <AddTeamMemberCard onClick={onAddTeamMember} />
      </div>

      {/* Team Member Slide-Out Panel */}
      <TeamMemberSlideOut
        isOpen={isSlideOutOpen}
        onClose={handleCloseSlideOut}
        member={selectedMember}
        onSave={handleSaveMember}
        currentUserPermission={currentUserPermission}
        currentUserId={currentUserId}
      />
    </div>
  );
};
