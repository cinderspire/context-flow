/**
 * Context Flow - Renderer App
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ContextSummary, ContextSnapshot, ContextSuggestion } from '../../../../core/types';
import { ContextList } from './components/ContextList';
import { SnapButton } from './components/SnapButton';
import { Suggestions } from './components/Suggestions';
import { Header } from './components/Header';
import './App.css';

function App() {
  const [contexts, setContexts] = useState<ContextSummary[]>([]);
  const [suggestions, setSuggestions] = useState<ContextSuggestion[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Load contexts on mount
  useEffect(() => {
    loadContexts();
    loadSuggestions();

    // Setup event listeners
    window.contextFlow.onContextSaved(handleContextSaved);
    window.contextFlow.onRingRotate(handleRingRotate);
    window.contextFlow.onRingPress(handleRingPress);

    return () => {
      window.contextFlow.removeAllListeners();
    };
  }, []);

  // Load contexts from main
  const loadContexts = async () => {
    const data = await window.contextFlow.getContexts();
    setContexts(data);
  };

  // Load AI suggestions
  const loadSuggestions = async () => {
    const data = await window.contextFlow.getSuggestions();
    setSuggestions(data);
  };

  // Handle context saved
  const handleContextSaved = useCallback((snapshot: ContextSnapshot) => {
    showNotification(`Saved: ${snapshot.name}`);
    loadContexts();
    loadSuggestions();
  }, []);

  // Handle ring rotation
  const handleRingRotate = useCallback((direction: 'next' | 'prev') => {
    const totalItems = suggestions.length + contexts.length;
    if (totalItems === 0) return;

    setSelectedIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % totalItems;
      } else {
        return prev === 0 ? totalItems - 1 : prev - 1;
      }
    });
  }, [suggestions.length, contexts.length]);

  // Handle ring press
  const handleRingPress = useCallback(() => {
    const allItems = [...suggestions, ...contexts];
    if (allItems[selectedIndex]) {
      handleRestore(allItems[selectedIndex].contextId);
    }
  }, [selectedIndex, suggestions, contexts]);

  // Handle snap
  const handleSnap = async () => {
    setIsCapturing(true);
    
    const result = await window.contextFlow.captureContext();
    
    if (result.success) {
      showNotification('Context saved!');
      loadContexts();
    } else {
      showNotification('Failed to save context');
    }
    
    setIsCapturing(false);
  };

  // Handle restore
  const handleRestore = async (id: string) => {
    showNotification('Restoring context...');
    
    const result = await window.contextFlow.restoreContext(id);
    
    if (result.success) {
      showNotification('Context restored!');
      loadContexts(); // Update last restored time
    } else {
      showNotification('Failed to restore context');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const result = await window.contextFlow.deleteContext(id);
    
    if (result.success) {
      loadContexts();
    }
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <SnapButton 
          onClick={handleSnap} 
          isLoading={isCapturing}
        />

        {suggestions.length > 0 && (
          <Suggestions 
            suggestions={suggestions}
            selectedIndex={selectedIndex < suggestions.length ? selectedIndex : -1}
            onSelect={handleRestore}
          />
        )}

        <ContextList 
          contexts={contexts}
          selectedIndex={selectedIndex >= suggestions.length ? selectedIndex - suggestions.length : -1}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      </main>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;
