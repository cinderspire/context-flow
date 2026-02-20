import React from 'react';
import type { ContextSuggestion } from '../../../../../core/types';

interface SuggestionsProps {
  suggestions: ContextSuggestion[];
  selectedIndex: number;
  onSelect: (id: string) => void;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ 
  suggestions, 
  selectedIndex,
  onSelect 
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="suggestions-section">
      <div className="section-title">
        🤖 AI Suggestions
        <span className="ai-badge">SMART</span>
      </div>
      <div className="suggestion-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.contextId}
            className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(suggestion.contextId)}
          >
            <span className="suggestion-emoji">{suggestion.emoji}</span>
            <div className="suggestion-info">
              <div className="suggestion-name">{suggestion.label}</div>
              <div className="suggestion-reason">{suggestion.reason}</div>
            </div>
            <div className="suggestion-confidence">
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
