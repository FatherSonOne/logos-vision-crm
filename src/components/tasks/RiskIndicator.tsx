// Risk Indicator Component
// Displays task risk level with detailed blockers and mitigation strategies

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Shield, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskLevel, RiskDetectionResult } from '../../services/taskAiService';

export interface RiskIndicatorProps {
  riskLevel: RiskLevel;
  blockers?: Array<{
    type: 'dependency' | 'resource' | 'timeline' | 'scope';
    description: string;
    mitigation: string;
  }>;
  alerts?: string[];
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  riskLevel,
  blockers = [],
  alerts = [],
  showDetails = true,
  size = 'md',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get risk configuration based on level
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          Icon: XCircle,
          label: 'Critical Risk',
        };
      case 'high':
        return {
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-700',
          iconColor: 'text-orange-600',
          Icon: AlertTriangle,
          label: 'High Risk',
        };
      case 'medium':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          Icon: AlertCircle,
          label: 'Medium Risk',
        };
      case 'low':
      default:
        return {
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-700',
          iconColor: 'text-green-600',
          Icon: Shield,
          label: 'Low Risk',
        };
    }
  };

  const config = getRiskConfig();
  const { Icon } = config;

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
        };
      case 'lg':
        return {
          badge: 'px-4 py-2 text-base',
          icon: 'w-6 h-6',
        };
      case 'md':
      default:
        return {
          badge: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Get blocker type icon and color
  const getBlockerIcon = (type: string) => {
    switch (type) {
      case 'dependency':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'resource':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      case 'timeline':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'scope':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const hasDetails = blockers.length > 0 || alerts.length > 0;

  return (
    <div className={`${className}`}>
      {/* Risk Badge */}
      <div
        className={`inline-flex items-center gap-2 ${sizeClasses.badge} ${config.bgColor} ${config.borderColor} ${config.textColor} border-2 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-all`}
        onClick={() => hasDetails && showDetails && setIsExpanded(!isExpanded)}
      >
        <Icon className={`${sizeClasses.icon} ${config.iconColor}`} />
        <span>{config.label}</span>
        {hasDetails && showDetails && (
          <div className="ml-1">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && hasDetails && showDetails && (
        <div className={`mt-3 p-4 ${config.bgColor} border ${config.borderColor} rounded-lg space-y-4`}>
          {/* Critical Alerts */}
          {alerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-gray-900">Urgent Alerts</span>
              </div>
              <ul className="space-y-1.5">
                {alerts.map((alert, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockers with Mitigation */}
          {blockers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-gray-900">Blockers & Mitigation</span>
              </div>
              <div className="space-y-3">
                {blockers.map((blocker, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                    {/* Blocker Type & Description */}
                    <div className="flex items-start gap-2 mb-2">
                      {getBlockerIcon(blocker.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {blocker.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{blocker.description}</p>
                      </div>
                    </div>

                    {/* Mitigation Strategy */}
                    {blocker.mitigation && (
                      <div className="ml-6 pl-3 border-l-2 border-blue-200">
                        <div className="text-xs font-medium text-blue-700 mb-1">
                          Mitigation Strategy:
                        </div>
                        <p className="text-sm text-gray-600">{blocker.mitigation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Details */}
          {blockers.length === 0 && alerts.length === 0 && (
            <div className="text-center py-3 text-gray-500 text-sm">
              No specific blockers or alerts detected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskIndicator;

// Compact version for inline display in task lists
export const RiskBadge: React.FC<{ riskLevel: RiskLevel; className?: string }> = ({
  riskLevel,
  className = '',
}) => {
  const config = (() => {
    switch (riskLevel) {
      case 'critical':
        return { color: 'bg-red-500', label: 'Critical' };
      case 'high':
        return { color: 'bg-orange-500', label: 'High' };
      case 'medium':
        return { color: 'bg-yellow-500', label: 'Medium' };
      case 'low':
      default:
        return { color: 'bg-green-500', label: 'Low' };
    }
  })();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-white ${config.color} ${className}`}>
      <AlertTriangle className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
};
