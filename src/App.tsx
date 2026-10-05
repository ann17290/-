/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NovelProject, EditorTheme } from './types/novel';
import { SAMPLE_PROJECT } from './data/sampleNovel';
import { Navbar, ActiveTab } from './components/Navbar';
import { ManuscriptEditor } from './components/Editor/ManuscriptEditor';
import { TreatmentView } from './components/Treatment/TreatmentView';
import { CharactersView } from './components/Characters/CharactersView';
import { SettingsView } from './components/Settings/SettingsView';
import { RelationshipDiagramView } from './components/Diagram/RelationshipDiagramView';
import { AIToolsView } from './components/AIHelper/AIToolsView';
import { StoryAnalysisView } from './components/StoryAnalysis/StoryAnalysisView';
import { BookTypesettingView } from './components/BookTypesetting/BookTypesettingView';
import { SmartImportModal } from './components/SmartImport/SmartImportModal';
import { ExportModal } from './components/ExportModal';
import { QuickNotesDrawer } from './components/QuickNotes/QuickNotesDrawer';

const STORAGE_KEY_PROJECT = 'nawani_novel_project_v1';
const STORAGE_KEY_THEME = 'nawani_editor_theme_v1';

export default function App() {
  // Load initial project from LocalStorage or use SAMPLE_PROJECT
  const [project, setProject] = useState<NovelProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title && Array.isArray(parsed.chapters)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load project from storage:', e);
    }
    return SAMPLE_PROJECT;
  });

  // Editor theme
  const [theme, setTheme] = useState<EditorTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'sepia' || saved === 'light') {
        return saved;
      }
    } catch {}
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+J / Cmd+J toggles Quick Notes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsQuickNotesOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-save project changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECT, JSON.stringify(project));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [project]);

  // Save theme
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
  }, [theme]);

  // Jump from treatment or other views into chapter editor
  const handleJumpToChapter = (chapterId: string) => {
    setActiveTab('editor');
  };

  // Reset to sample project
  const handleResetSample = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็น "บัลลังก์เงาบุปผา" (ตัวอย่างนิยาย) หรือไม่?')) {
      setProject(SAMPLE_PROJECT);
      setActiveTab('editor');
    }
  };

  // Send AI output text directly into chapter
  const handleSendToChapter = (chapterId: string, text: string) => {
    const updated = project.chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          content: ch.content ? `${ch.content}\n\n${text}` : text,
        };
      }
      return ch;
    });
    setProject({ ...project, chapters: updated, updatedAt: new Date().toISOString() });
    alert('ส่งเนื้อหาไปยังบทเรียบร้อยแล้ว!');
    setActiveTab('editor');
  };

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${
      theme === 'sepia' ? 'bg-[#1e1814] text-[#f4ecd8]' : theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-stone-950 text-stone-100'
    }`}>
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSmartImport={() => setIsSmartImportOpen(true)}
        onOpenQuickNotes={() => setIsQuickNotesOpen(true)}
        quickNotesCount={project.quickNotes?.length || 0}
        onResetSample={handleResetSample}
        novelTitle={project.title}
      />

      {/* Main Workspace based on activeTab */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'editor' && (
          <ManuscriptEditor
            project={project}
            theme={theme}
            onUpdateProject={setProject}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenQuickNotes={() => setIsQuickNotesOpen(true)}
          />
        )}

        {activeTab === 'treatment' && (
          <TreatmentView
            project={project}
            onUpdateProject={setProject}
            onJumpToChapter={handleJumpToChapter}
            onOpenAnalysis={() => setActiveTab('analysis')}
            onJumpToCharacter={() => setActiveTab('characters')}
            onJumpToLocation={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'analysis' && (
          <StoryAnalysisView
            project={project}
            onJumpToTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'typesetting' && (
          <BookTypesettingView
            project={project}
            onUpdateProject={setProject}
          />
        )}

        {activeTab === 'characters' && (
          <CharactersView
            project={project}
            onUpdateProject={setProject}
            onJumpToDiagram={() => setActiveTab('diagram')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            project={project}
            onUpdateProject={setProject}
            onJumpToChapter={handleJumpToChapter}
          />
        )}

        {activeTab === 'diagram' && (
          <RelationshipDiagramView
            project={project}
            onUpdateProject={setProject}
          />
        )}

        {activeTab === 'ai_tools' && (
          <AIToolsView
            project={project}
            onSendToChapter={handleSendToChapter}
          />
        )}
      </div>

      {/* Smart Auto-Import & Linking Modal */}
      <SmartImportModal
        isOpen={isSmartImportOpen}
        onClose={() => setIsSmartImportOpen(false)}
        currentProject={project}
        onApplyImport={(newProj) => {
          setProject(newProj);
          setActiveTab('editor');
        }}
      />

      {/* Quick Notes & Idea Inbox Drawer */}
      <QuickNotesDrawer
        isOpen={isQuickNotesOpen}
        onClose={() => setIsQuickNotesOpen(false)}
        project={project}
        onUpdateProject={setProject}
        currentChapterId={project.chapters[0]?.id}
        onInsertTextToChapter={(text, chapterId) => {
          handleSendToChapter(chapterId || project.chapters[0]?.id, text);
        }}
        onNavigateToTab={(tab) => {
          setActiveTab(tab as any);
          setIsQuickNotesOpen(false);
        }}
      />

      {/* Export & Backup Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        onImportProject={(imported) => setProject(imported)}
        onOpenTypesetting={() => {
          setIsExportOpen(false);
          setActiveTab('typesetting');
        }}
      />
    </div>
  );
}
