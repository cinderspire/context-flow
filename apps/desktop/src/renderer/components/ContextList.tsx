import React from 'react';
import type { ContextSummary } from '../../../../../core/types';

interface ContextListProps {
  contexts: ContextSummary[];
  selectedIndex: number;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Default
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ContextList: React.FC<ContextListProps> = ({ 
  contexts, 
  selectedIndex,
  onRestore, 
  onDelete 
}) => {
  if (contexts.length === 0) {
    return (
      <div className="context-section">
        <div className="section-title">📁 Saved Contexts</div>
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <div className="empty-text">No contexts saved yet</div>
          <div className="empty-hint">Press SNAP to save your first context</div>
        </div>
      </div>
    );
  }

  return (
    <div className="context-section">
      <div className="section-title">📁 Saved Contexts ({contexts.length})</div>
      <div className="context-list">
        {contexts.map((context, index) => (
          <div
            key={context.id}
            className={`context-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onRestore(context.id)}
          >
            <span className="context-emoji">{context.emoji}</span>
            <div className="context-info">
              <div className="context-name">{context.name}</div>
              <div className="context-meta">
                {formatTime(context.timestamp)} • {context.appCount} apps
                {context.restoreCount > 0 && ` • Restored ${context.restoreCount}x`}
              </div>
            </div>
            <div className="context-actions">
              <button 
                className="context-action-btn restore"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(context.id);
                }}
              >
                Restore
              </button>
              <button 
                className="context-action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this context?')) {
                    onDelete(context.id);
                  }
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
