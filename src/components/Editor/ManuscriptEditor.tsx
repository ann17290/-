import React, { useState, useEffect, useRef } from 'react';
import { NovelProject, Chapter, EditorTheme, EditorFont, SpellCheckIssue } from '../../types/novel';
import { calculateTextStats, checkThaiSpelling } from '../../utils/thaiSpellChecker';
import { ProofreadDrawer } from './ProofreadDrawer';
import { QuickReferenceSidebar } from './QuickReferenceSidebar';
import { AIWritingModal } from '../AIHelper/AIWritingModal';
import { 
  Plus, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  Settings2, 
  Clock, 
  FileText, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  Wand2,
  FolderOpen,
  PanelRightOpen,
  PanelRightClose,
  Lightbulb
} from 'lucide-react';

interface ManuscriptEditorProps {
  project: NovelProject;
  theme: EditorTheme;
  onUpdateProject: (updated: NovelProject) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenQuickNotes?: () => void;
}

export const ManuscriptEditor: React.FC<ManuscriptEditorProps> = ({
  project,
  theme,
  onUpdateProject,
  onNavigateToTab,
  onOpenQuickNotes,
}) => {
  const [currentChapterId, setCurrentChapterId] = useState<string>(
    project.chapters[0]?.id || ''
  );
  const [isZenMode, setIsZenMode] = useState(false);
  const [fontFamily, setFontFamily] = useState<EditorFont>('serif');
  const [fontSize, setFontSize] = useState<number>(17); // 14 to 22
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  
  // Drawers
  const [showProofreadDrawer, setShowProofreadDrawer] = useState(false);
  const [showReferenceSidebar, setShowReferenceSidebar] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedTextForAI, setSelectedTextForAI] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChapter = project.chapters.find(c => c.id === currentChapterId) || project.chapters[0];

  // Auto-switch chapter if currentChapterId invalid
  useEffect(() => {
    if (!project.chapters.some(c => c.id === currentChapterId) && project.chapters.length > 0) {
      setCurrentChapterId(project.chapters[0].id);
    }
  }, [project.chapters, currentChapterId]);

  const currentContent = currentChapter?.content || '';
  const stats = calculateTextStats(currentContent);
  const spellIssues = checkThaiSpelling(currentContent);

  // Update content of current chapter
  const handleContentChange = (newContent: string) => {
    const updatedChapters = project.chapters.map(ch => {
      if (ch.id === currentChapterId) {
        return { ...ch, content: newContent };
      }
      return ch;
    });

    onUpdateProject({
      ...project,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add chapter
  const handleAddChapter = () => {
    const newOrder = project.chapters.length + 1;
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: `บทที่ ${newOrder}: (ยังไม่ได้ตั้งชื่อ)`,
      order: newOrder,
      content: '',
      targetWords: 3000,
      status: 'draft',
      summary: '',
    };

    onUpdateProject({
      ...project,
      chapters: [...project.chapters, newChapter],
      updatedAt: new Date().toISOString(),
    });
    setCurrentChapterId(newChapter.id);
  };

  // Delete chapter
  const handleDeleteChapter = (chId: string) => {
    if (project.chapters.length <= 1) {
      alert('ไม่สามารถลบบทสุดท้ายได้');
      return;
    }
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทนี้?')) return;

    const remaining = project.chapters.filter(c => c.id !== chId);
    onUpdateProject({
      ...project,
      chapters: remaining,
      updatedAt: new Date().toISOString(),
    });
    if (currentChapterId === chId) {
      setCurrentChapterId(remaining[0].id);
    }
  };

  // Fix single spell issue
  const handleFixIssue = (issue: SpellCheckIssue) => {
    if (!currentChapter) return;
    const before = currentContent.substring(0, issue.index);
    const after = currentContent.substring(issue.index + issue.length);
    const updated = before + issue.suggested + after;
    handleContentChange(updated);
  };

  // Fix all spelling issues
  const handleFixAllSpelling = () => {
    if (!currentChapter || spellIssues.length === 0) return;
    let text = currentContent;
    // Apply in reverse order to preserve string indices
    const spellingIssues = spellIssues.filter(i => i.type === 'spelling').reverse();
    for (const issue of spellingIssues) {
      text = text.substring(0, issue.index) + issue.suggested + text.substring(issue.index + issue.length);
    }
    handleContentChange(text);
  };

  // Handle open AI with selected text
  const handleOpenAIWithSelection = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      setSelectedTextForAI(selected || '');
    }
    setShowAIModal(true);
  };

  // Apply AI result
  const handleApplyAIResult = (newText: string, mode: 'replace' | 'append') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleContentChange(currentContent + '\n\n' + newText);
      return;
    }

    if (mode === 'replace') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const updated = currentContent.substring(0, start) + newText + currentContent.substring(end);
        handleContentChange(updated);
      } else {
        handleContentChange(newText);
      }
    } else {
      const updated = currentContent ? `${currentContent}\n\n${newText}` : newText;
      handleContentChange(updated);
    }
  };

  // Theme styling calculation
  const getThemeEditorClass = () => {
    if (theme === 'sepia') {
      return 'bg-[#261f1a] text-[#f4ecd8] border-stone-800 placeholder-stone-600';
    }
    if (theme === 'light') {
      return 'bg-[#fcfaf7] text-stone-900 border-stone-300 placeholder-stone-400';
    }
    return 'bg-stone-950 text-stone-100 border-stone-800 placeholder-stone-600';
  };

  const getThemeContainerClass = () => {
    if (theme === 'sepia') {
      return 'bg-[#1e1814] text-[#f4ecd8]';
    }
    if (theme === 'light') {
      return 'bg-stone-100 text-stone-900';
    }
    return 'bg-stone-900 text-stone-100';
  };

  return (
    <div className={`flex-1 flex overflow-hidden ${getThemeContainerClass()} relative`}>
      {/* Chapter List Sidebar (hidden in Zen mode) */}
      {!isZenMode && (
        <aside className="w-64 border-r border-stone-800/80 bg-stone-950/70 flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider font-sans-thai">
              ลำดับบท ({project.chapters.length})
            </span>
            <button
              onClick={handleAddChapter}
              title="เพิ่มบทใหม่"
              className="p-1 rounded-md text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {project.chapters.map(ch => {
              const chStats = calculateTextStats(ch.content);
              const isSelected = ch.id === currentChapterId;
              return (
                <div
                  key={ch.id}
                  onClick={() => setCurrentChapterId(ch.id)}
                  className={`group p-2.5 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-100 shadow-sm'
                      : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs truncate max-w-[170px] font-sans-thai">
                      {ch.title}
                    </span>
                    {project.chapters.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(ch.id);
                        }}
                        title="ลบบทนี้"
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 p-0.5 rounded transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-500">
                    <span>{chStats.words.toLocaleString()} คำ</span>
                    <span>·</span>
                    <span>{chStats.estimatedPages} หน้า</span>
                    <span>·</span>
                    <span className={`capitalize ${
                      ch.status === 'completed' ? 'text-emerald-400' : ch.status === 'polishing' ? 'text-amber-400' : 'text-stone-500'
                    }`}>
                      {ch.status === 'completed' ? 'ตรวจแล้ว' : ch.status === 'polishing' ? 'เกลาสำนวน' : 'ร่างแรก'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Novel Meta info bottom */}
          <div className="p-3 border-t border-stone-800 bg-stone-950/40 text-xs text-stone-400 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-stone-500">ทั้งเล่ม:</span>
              <span className="font-semibold text-amber-300">
                {project.chapters.reduce((acc, c) => acc + calculateTextStats(c.content).words, 0).toLocaleString()} คำ
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-stone-500">ประมาณการหน้า A5:</span>
              <span className="text-stone-300">
                {project.chapters.reduce((acc, c) => acc + calculateTextStats(c.content).estimatedPages, 0).toFixed(0)} หน้า
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* Main Manuscript Writing Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Editor Toolbar */}
        <div className="h-11 border-b border-stone-800/80 bg-stone-950/60 px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentChapter?.title || ''}
              onChange={(e) => {
                const updated = project.chapters.map(c => 
                  c.id === currentChapterId ? { ...c, title: e.target.value } : c
                );
                onUpdateProject({ ...project, chapters: updated, updatedAt: new Date().toISOString() });
              }}
              className="bg-transparent font-serif-thai font-semibold text-sm text-stone-200 hover:bg-stone-800/50 focus:bg-stone-800 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/50 max-w-[260px] md:max-w-md"
            />
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Quick AI Trigger */}
            <button
              onClick={handleOpenAIWithSelection}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/50 rounded-md transition-colors shadow-sm"
              title="เปิดผู้ช่วย AI ช่วยเขียน เกลาสำนวน หรือเพิ่มเนื้อหา"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ช่วยเขียน / เกลาสำนวน</span>
            </button>

            {/* Proofread Drawer Toggle */}
            <button
              onClick={() => {
                setShowProofreadDrawer(!showProofreadDrawer);
                if (showReferenceSidebar) setShowReferenceSidebar(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                showProofreadDrawer
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/70'
                  : 'text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
              title="ตรวจคำผิดและคำซ้ำแบบเรียลไทม์"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>ตรวจคำผิด {spellIssues.length > 0 && `(${spellIssues.length})`}</span>
            </button>

            {/* Reference Sidebar Toggle */}
            <button
              onClick={() => {
                setShowReferenceSidebar(!showReferenceSidebar);
                if (showProofreadDrawer) setShowProofreadDrawer(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                showReferenceSidebar
                  ? 'bg-sky-950/70 text-sky-300 border border-sky-800/70'
                  : 'text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
              title="เปิดข้อมูลตัวละครและฉากอ้างอิง"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">ข้อมูลอ้างอิง</span>
            </button>

            {/* Quick Notes Button */}
            <button
              onClick={() => {
                if (onOpenQuickNotes) {
                  onOpenQuickNotes();
                } else {
                  setShowReferenceSidebar(true);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-800/50"
              title="เปิดคลังไอเดีย & โน้ตด่วน (Quick Notes)"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>โน้ตด่วน {(project.quickNotes?.length || 0) > 0 && `(${project.quickNotes?.length})`}</span>
            </button>

            {/* Typography Controls */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-900 p-0.5 rounded-md border border-stone-800 text-xs">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-2 py-0.5 rounded font-serif-thai ${
                  fontFamily === 'serif' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                }`}
                title="ฟอนต์วรรณกรรมหัวมีเชิง (Noto Serif Thai)"
              >
                มีเชิง
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-2 py-0.5 rounded font-sans-thai ${
                  fontFamily === 'sans' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                }`}
                title="ฟอนต์ร่วมสมัย (Sarabun Sans)"
              >
                ไร้เชิง
              </button>
            </div>

            {/* Zen Fullscreen Mode */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title={isZenMode ? 'ออกจากโหมดสมาธิ (Zen Mode)' : 'เข้าสู่โหมดสมาธิไร้สิ่งรบกวน (Zen Mode)'}
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Writing Pane */}
        <div className="flex-1 overflow-y-auto flex justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl flex flex-col h-full">
            <textarea
              ref={textareaRef}
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="จรดปลายนิ้วเริ่มรังสรรค์เรื่องราวของคุณที่นี่... สามารถพิมพ์บทบรรยายหรือบทสนทนาได้ทันที"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
              className={`w-full flex-1 p-6 md:p-8 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all resize-none shadow-sm ${
                fontFamily === 'serif' ? 'font-serif-thai' : 'font-sans-thai'
              } ${getThemeEditorClass()}`}
            />
          </div>
        </div>

        {/* Live Statistics & Target Progress Bar */}
        <div className="h-8 border-t border-stone-800/80 bg-stone-950/80 px-4 flex items-center justify-between text-xs text-stone-400 shrink-0 select-none">
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              คำ: <strong className="text-stone-200">{stats.words.toLocaleString()}</strong>
            </span>
            <span>·</span>
            <span>
              อักขระ: <strong className="text-stone-200">{stats.characters.toLocaleString()}</strong> (ไม่รวมช่องว่าง {stats.charactersNoSpaces.toLocaleString()})
            </span>
            <span>·</span>
            <span>
              ย่อหน้า: <strong className="text-stone-200">{stats.paragraphs}</strong>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              ประมาณ <strong className="text-amber-400">{stats.estimatedPages}</strong> หน้า A5
            </span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">
              เวลาอ่าน ~<strong className="text-stone-200">{stats.readingTimeMinutes}</strong> นาที
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentChapter?.targetWords > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-stone-500">เป้าหมาย:</span>
                <span className="text-stone-300">
                  {stats.words.toLocaleString()} / {currentChapter.targetWords.toLocaleString()} คำ ({Math.min(100, Math.round((stats.words / currentChapter.targetWords) * 100))}%)
                </span>
                <div className="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.words / currentChapter.targetWords) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Slide-out Proofreading Drawer */}
      {showProofreadDrawer && (
        <ProofreadDrawer
          issues={spellIssues}
          content={currentContent}
          onFixIssue={handleFixIssue}
          onFixAllSpelling={handleFixAllSpelling}
          onApplyAIRevision={(rev) => handleContentChange(rev)}
          onClose={() => setShowProofreadDrawer(false)}
        />
      )}

      {/* Slide-out Quick Reference Sidebar */}
      {showReferenceSidebar && (
        <QuickReferenceSidebar
          project={project}
          currentChapterId={currentChapterId}
          onInsertText={(text) => {
            handleContentChange(currentContent + (currentContent.endsWith(' ') ? '' : ' ') + text);
          }}
          onClose={() => setShowReferenceSidebar(false)}
          onNavigateToTab={onNavigateToTab}
          onOpenFullNotesDrawer={onOpenQuickNotes}
          onUpdateProject={onUpdateProject}
        />
      )}

      {/* AI Writing Co-Pilot Modal */}
      <AIWritingModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        selectedText={selectedTextForAI}
        project={project}
        currentChapterId={currentChapterId}
        onApplyText={handleApplyAIResult}
      />
    </div>
  );
};
