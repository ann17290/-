import React, { useState, useEffect, useRef } from 'react';
import { NovelProject, QuickNote, Character, Chapter, SettingLocation } from '../../types/novel';
import { 
  Lightbulb, 
  X, 
  Plus, 
  Trash2, 
  Pin, 
  Tag as TagIcon, 
  Users, 
  BookOpen, 
  Compass, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  Edit3, 
  ArrowRight, 
  Loader2, 
  Wand2, 
  Share2, 
  Layers,
  ChevronDown,
  Filter
} from 'lucide-react';
import { requestAIAssist } from '../../services/aiService';

interface QuickNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  currentChapterId?: string;
  onInsertTextToChapter?: (text: string, chapterId?: string) => void;
  onNavigateToTab?: (tab: string, targetId?: string) => void;
  initialTagFilter?: string | null;
  initialCharacterFilter?: string | null;
  initialChapterFilter?: string | null;
}

const PRESET_TAGS = [
  'บทสนทนาคมคาย',
  'หักมุม',
  'ปริศนายาพิษ',
  'ไอเดียฉาก',
  'ปมตัวร้าย',
  'เบาะแสคดี',
  'ความลับราชสำนัก',
  'ฉากโรแมนติก',
  'ฉากต่อสู้'
];

const COLOR_MAP: Record<QuickNote['color'], { bg: string; border: string; badge: string; text: string; dot: string }> = {
  amber: {
    bg: 'bg-amber-950/20 hover:bg-amber-950/30',
    border: 'border-amber-700/50 hover:border-amber-600',
    badge: 'bg-amber-900/60 text-amber-200 border-amber-700/50',
    text: 'text-amber-300',
    dot: 'bg-amber-400'
  },
  sky: {
    bg: 'bg-sky-950/20 hover:bg-sky-950/30',
    border: 'border-sky-700/50 hover:border-sky-600',
    badge: 'bg-sky-900/60 text-sky-200 border-sky-700/50',
    text: 'text-sky-300',
    dot: 'bg-sky-400'
  },
  emerald: {
    bg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
    border: 'border-emerald-700/50 hover:border-emerald-600',
    badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/50',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400'
  },
  rose: {
    bg: 'bg-rose-950/20 hover:bg-rose-950/30',
    border: 'border-rose-700/50 hover:border-rose-600',
    badge: 'bg-rose-900/60 text-rose-200 border-rose-700/50',
    text: 'text-rose-300',
    dot: 'bg-rose-400'
  },
  purple: {
    bg: 'bg-purple-950/20 hover:bg-purple-950/30',
    border: 'border-purple-700/50 hover:border-purple-600',
    badge: 'bg-purple-900/60 text-purple-200 border-purple-700/50',
    text: 'text-purple-300',
    dot: 'bg-purple-400'
  },
};

export const QuickNotesDrawer: React.FC<QuickNotesDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  currentChapterId,
  onInsertTextToChapter,
  onNavigateToTab,
  initialTagFilter,
  initialCharacterFilter,
  initialChapterFilter,
}) => {
  const quickNotes = project.quickNotes || [];

  // Compose State
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<QuickNote['color']>('amber');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(initialTagFilter || null);
  const [selectedCharFilter, setSelectedCharFilter] = useState<string | null>(initialCharacterFilter || null);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string | null>(initialChapterFilter || null);
  const [pinnedOnlyFilter, setPinnedOnlyFilter] = useState(false);

  // Edit Note State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCharIds, setEditCharIds] = useState<string[]>([]);
  const [editChapterIds, setEditChapterIds] = useState<string[]>([]);
  const [editColor, setEditColor] = useState<QuickNote['color']>('amber');

  // AI Expand Modal State
  const [aiNoteTarget, setAiNoteTarget] = useState<QuickNote | null>(null);
  const [aiFocusMode, setAiFocusMode] = useState<'scene' | 'dialogue' | 'placement'>('scene');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pre-fill filters when initial props change
  useEffect(() => {
    if (initialTagFilter !== undefined) setSelectedTagFilter(initialTagFilter);
  }, [initialTagFilter]);

  useEffect(() => {
    if (initialCharacterFilter !== undefined) setSelectedCharFilter(initialCharacterFilter);
  }, [initialCharacterFilter]);

  useEffect(() => {
    if (initialChapterFilter !== undefined) setSelectedChapterFilter(initialChapterFilter);
  }, [initialChapterFilter]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !aiNoteTarget) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, aiNoteTarget]);

  if (!isOpen) return null;

  // Extract all unique tags with count
  const tagCounts = quickNotes.reduce((acc, note) => {
    note.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const allTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Handle Add Tag in Composer
  const handleAddTag = (tagToAdd: string) => {
    const cleanTag = tagToAdd.trim().replace(/^#/, '');
    if (cleanTag && !newTags.includes(cleanTag)) {
      setNewTags([...newTags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter(t => t !== tagToRemove));
  };

  // Toggle character link in composer
  const handleToggleChar = (charId: string) => {
    setSelectedCharIds(prev => 
      prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
    );
  };

  // Toggle chapter link in composer
  const handleToggleChapter = (chapterId: string) => {
    setSelectedChapterIds(prev => 
      prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  // Submit new note
  const handleCreateNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newContent.trim()) return;

    const newNote: QuickNote = {
      id: `qn-${Date.now()}`,
      content: newContent.trim(),
      color: newColor,
      tags: newTags,
      characterIds: selectedCharIds.length > 0 ? selectedCharIds : undefined,
      chapterIds: selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
      locationIds: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
      pinned: isPinned,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...(project.quickNotes || [])];
    onUpdateProject({
      ...project,
      quickNotes: updatedNotes,
      updatedAt: new Date().toISOString(),
    });

    // Reset composer
    setNewContent('');
    setNewTags([]);
    setSelectedCharIds([]);
    setSelectedChapterIds([]);
    setSelectedLocationIds([]);
    setIsPinned(false);
    setIsComposerExpanded(false);
  };

  // Toggle Pin on note
  const handleTogglePin = (noteId: string) => {
    const updated = quickNotes.map(n => 
      n.id === noteId ? { ...n, pinned: !n.pinned } : n
    );
    onUpdateProject({ ...project, quickNotes: updated, updatedAt: new Date().toISOString() });
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    if (!confirm('ต้องการลบโน้ตนี้หรือไม่?')) return;
    const updated = quickNotes.filter(n => n.id !== noteId);
    onUpdateProject({ ...project, quickNotes: updated, updatedAt: new Date().toISOString() });
  };

  // Start editing note
  const handleStartEdit = (note: QuickNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditCharIds(note.characterIds || []);
    setEditChapterIds(note.chapterIds || []);
    setEditColor(note.color || 'amber');
  };

  // Save edited note
  const handleSaveEdit = (noteId: string) => {
    const updated = quickNotes.map(n => {
      if (n.id === noteId) {
        return {
          ...n,
          content: editContent.trim(),
          tags: editTags,
          characterIds: editCharIds.length > 0 ? editCharIds : undefined,
          chapterIds: editChapterIds.length > 0 ? editChapterIds : undefined,
          color: editColor,
        };
      }
      return n;
    });
    onUpdateProject({ ...project, quickNotes: updated, updatedAt: new Date().toISOString() });
    setEditingNoteId(null);
  };

  // Copy note text
  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // AI Expand Note
  const handleOpenAiExpand = (note: QuickNote) => {
    setAiNoteTarget(note);
    setAiResult(null);
  };

  const handleRunAiExpand = async () => {
    if (!aiNoteTarget) return;
    setAiGenerating(true);
    setAiResult(null);

    try {
      const linkedChars = project.characters
        .filter(c => aiNoteTarget.characterIds?.includes(c.id))
        .map(c => `${c.name} (${c.roleLabel})`)
        .join(', ');

      const linkedChs = project.chapters
        .filter(c => aiNoteTarget.chapterIds?.includes(c.id))
        .map(c => c.title)
        .join(', ');

      const result = await requestAIAssist(
        'expand_note',
        aiNoteTarget.content,
        {
          characters: linkedChars || undefined,
          treatment: linkedChs ? `บทที่เกี่ยวข้อง: ${linkedChs}` : undefined,
        },
        {
          direction: (aiNoteTarget.tags || []).join(', ') || 'ไอเดียพล็อต',
          focus: aiFocusMode === 'dialogue' ? 'เน้นแต่งเป็นบทสนทนาโต้ตอบ' : aiFocusMode === 'scene' ? 'เน้นแต่งเป็นฉากบรรยายสมบูรณ์' : 'เน้นวิเคราะห์หาจุดสอดแทรกในพล็อต',
        }
      );
      setAiResult(result);
    } catch (err: any) {
      alert(`AI ขัดข้อง: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save AI result as new note or insert into chapter
  const handleSaveAiAsNote = () => {
    if (!aiResult || !aiNoteTarget) return;
    const newNote: QuickNote = {
      id: `qn-${Date.now()}`,
      content: `[ต่อยอดจาก: ${aiNoteTarget.content.substring(0, 40)}...]\n\n${aiResult}`,
      color: aiNoteTarget.color,
      tags: [...(aiNoteTarget.tags || []), 'AI ต่อยอด'],
      characterIds: aiNoteTarget.characterIds,
      chapterIds: aiNoteTarget.chapterIds,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    onUpdateProject({
      ...project,
      quickNotes: [newNote, ...quickNotes],
      updatedAt: new Date().toISOString(),
    });
    alert('บันทึกผลงาน AI เป็นโน้ตใหม่เรียบร้อยแล้ว!');
    setAiNoteTarget(null);
  };

  // Filter notes logic
  const filteredNotes = quickNotes.filter(note => {
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchContent = note.content.toLowerCase().includes(query);
      const matchTag = note.tags?.some(t => t.toLowerCase().includes(query));
      const matchChar = project.characters.some(c => 
        note.characterIds?.includes(c.id) && c.name.toLowerCase().includes(query)
      );
      const matchChapter = project.chapters.some(c => 
        note.chapterIds?.includes(c.id) && c.title.toLowerCase().includes(query)
      );
      if (!matchContent && !matchTag && !matchChar && !matchChapter) return false;
    }

    // Pinned filter
    if (pinnedOnlyFilter && !note.pinned) return false;

    // Tag filter
    if (selectedTagFilter && !note.tags?.includes(selectedTagFilter)) return false;

    // Character filter
    if (selectedCharFilter && !note.characterIds?.includes(selectedCharFilter)) return false;

    // Chapter filter
    if (selectedChapterFilter && !note.chapterIds?.includes(selectedChapterFilter)) return false;

    return true;
  }).sort((a, b) => {
    // Pinned first, then newest
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pinnedCount = quickNotes.filter(n => n.pinned).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      {/* Background click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Main Drawer Container */}
      <div className="w-full max-w-2xl bg-stone-950 border-l border-stone-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-800/80 bg-stone-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-amber-950 shadow-md">
              <Lightbulb className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-100 text-base font-serif-thai">
                  คลังไอเดีย & โน้ตด่วน (Quick Notes)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/80 border border-amber-800/60 text-amber-300">
                  {quickNotes.length} โน้ต
                </span>
                {pinnedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-800 text-stone-300 flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{pinnedCount}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-sans-thai">
                จดแรงบันดาลใจกระจัดกระจาย แปะแท็ก เชื่อมโยงตัวละครและบทต่างๆ ได้ทันที
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="ปิด (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Jot Composer Box */}
          <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800/90 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 font-sans-thai">
                <Sparkles className="w-3.5 h-3.5" />
                <span>จดไอเดียใหม่ทันที (Quick Jot)</span>
              </span>
              <div className="flex items-center gap-1.5">
                {/* Color Selector */}
                {(['amber', 'emerald', 'sky', 'rose', 'purple'] as QuickNote['color'][]).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-4 h-4 rounded-full transition-transform ${COLOR_MAP[color].dot} ${
                      newColor === color ? 'scale-125 ring-2 ring-stone-200 ring-offset-1 ring-offset-stone-900' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={`สี ${color}`}
                  />
                ))}
                <span className="text-stone-700 mx-1">|</span>
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
                    isPinned ? 'text-amber-400 bg-amber-950/60 border border-amber-800/50' : 'text-stone-400 hover:text-stone-300'
                  }`}
                  title={isPinned ? 'ปักหมุดไว้บนสุดแล้ว' : 'ปักหมุดไว้บนสุด'}
                >
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Note Textarea */}
            <textarea
              value={newContent}
              onChange={(e) => {
                setNewContent(e.target.value);
                if (!isComposerExpanded && e.target.value.length > 0) {
                  setIsComposerExpanded(true);
                }
              }}
              onFocus={() => setIsComposerExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleCreateNote();
                }
              }}
              placeholder="จดไอเดียที่แวบขึ้นมา... เช่น ปริศนาใหม่, บทสนทนาเด็ด, ฉากหักมุม, หรือความลับตัวละคร (กด Ctrl+Enter เพื่อบันทึก)"
              rows={isComposerExpanded ? 3 : 2}
              className="w-full bg-stone-950/90 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 font-sans-thai resize-none"
            />

            {/* Expanded Controls: Tags & Linkings */}
            {isComposerExpanded && (
              <div className="space-y-2.5 pt-1 border-t border-stone-800/70 text-xs animate-in fade-in duration-150">
                {/* Tag Input & Suggestions */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-[11px] font-medium text-stone-400">แปะแท็ก:</span>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="พิมพ์แท็กแล้วกด Enter..."
                      className="bg-stone-950 border border-stone-800 rounded px-2 py-0.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-hidden focus:border-amber-500 w-36"
                    />
                    {tagInput.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAddTag(tagInput)}
                        className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[11px]"
                      >
                        เพิ่ม
                      </button>
                    )}
                  </div>

                  {/* Active Selected Tags */}
                  {newTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {newTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-950/60 border border-amber-800/50 text-amber-300"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-amber-100"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Preset Tags */}
                  <div className="flex flex-wrap gap-1 items-center pl-5 text-[10px]">
                    <span className="text-stone-500">แท็กแนะนำ:</span>
                    {PRESET_TAGS.filter(t => !newTags.includes(t)).slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="px-1.5 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character & Chapter Linking Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-stone-800/50">
                  {/* Link Characters */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-400" />
                      <span>โยงถึงตัวละคร:</span>
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-stone-950/70 border border-stone-800/80 rounded-md">
                      {project.characters.map(char => {
                        const isSelected = selectedCharIds.includes(char.id);
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => handleToggleChar(char.id)}
                            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors truncate max-w-[130px] flex items-center gap-1 ${
                              isSelected
                                ? 'bg-sky-950/80 text-sky-200 border border-sky-700/60 font-medium'
                                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span className="truncate">{char.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Link Chapters */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>โยงถึงบท:</span>
                      {currentChapterId && (
                        <button
                          type="button"
                          onClick={() => handleToggleChapter(currentChapterId)}
                          className="text-[10px] text-amber-400 underline hover:text-amber-300 ml-auto"
                        >
                          {selectedChapterIds.includes(currentChapterId) ? 'ลบบทปัจจุบัน' : '+ บทปัจจุบัน'}
                        </button>
                      )}
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-stone-950/70 border border-stone-800/80 rounded-md">
                      {project.chapters.map(ch => {
                        const isSelected = selectedChapterIds.includes(ch.id);
                        const isCurrent = ch.id === currentChapterId;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => handleToggleChapter(ch.id)}
                            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors truncate max-w-[140px] flex items-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700/60 font-medium'
                                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                            }`}
                            title={ch.title}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span className="truncate">{ch.title}</span>
                            {isCurrent && <span className="text-[9px] text-amber-400">(ปัจจุบัน)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposerExpanded(false);
                      setNewContent('');
                    }}
                    className="text-stone-500 hover:text-stone-300 text-[11px]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateNote()}
                    disabled={!newContent.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>บันทึกโน้ต (Ctrl+Enter)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Search Controls */}
          <div className="space-y-2 pt-2 border-t border-stone-800/80">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาข้อความ, แท็ก, หรือชื่อตัวละคร..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Pin Filter Toggle */}
              <button
                type="button"
                onClick={() => setPinnedOnlyFilter(!pinnedOnlyFilter)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors shrink-0 ${
                  pinnedOnlyFilter
                    ? 'bg-amber-950/70 border-amber-800/70 text-amber-300 font-medium'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Pin className={`w-3 h-3 ${pinnedOnlyFilter ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>ปักหมุดเท่านั้น</span>
              </button>
            </div>

            {/* Quick Entity Selectors: Character & Chapter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Filter by Character */}
              <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-md px-2 py-1">
                <Users className="w-3 h-3 text-sky-400 shrink-0" />
                <select
                  value={selectedCharFilter || ''}
                  onChange={(e) => setSelectedCharFilter(e.target.value || null)}
                  className="bg-transparent text-stone-300 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="" className="bg-stone-900 text-stone-200">ทุกตัวละคร</option>
                  {project.characters.map(char => (
                    <option key={char.id} value={char.id} className="bg-stone-900 text-stone-200">
                      {char.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Chapter */}
              <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-md px-2 py-1">
                <BookOpen className="w-3 h-3 text-emerald-400 shrink-0" />
                <select
                  value={selectedChapterFilter || ''}
                  onChange={(e) => setSelectedChapterFilter(e.target.value || null)}
                  className="bg-transparent text-stone-300 text-xs focus:outline-hidden cursor-pointer max-w-[150px] truncate"
                >
                  <option value="" className="bg-stone-900 text-stone-200">ทุกบท</option>
                  {project.chapters.map(ch => (
                    <option key={ch.id} value={ch.id} className="bg-stone-900 text-stone-200">
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset all filters */}
              {(selectedTagFilter || selectedCharFilter || selectedChapterFilter || pinnedOnlyFilter || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTagFilter(null);
                    setSelectedCharFilter(null);
                    setSelectedChapterFilter(null);
                    setPinnedOnlyFilter(false);
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline ml-auto"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>

            {/* Tag Filter Pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setSelectedTagFilter(null)}
                  className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                    selectedTagFilter === null
                      ? 'bg-amber-400 text-stone-950 font-medium'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  ทั้งหมด ({quickNotes.length})
                </button>

                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                      selectedTagFilter === tag
                        ? 'bg-amber-950/90 text-amber-300 border border-amber-700/80 font-medium shadow-xs'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className="text-[9px] opacity-70">({tagCounts[tag]})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Cards List */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-stone-900/40 border border-stone-800/80 space-y-2">
                <Lightbulb className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-sm font-medium text-stone-300 font-serif-thai">ไม่พบโน้ตที่ตรงกับเงื่อนไข</p>
                <p className="text-xs text-stone-500 font-sans-thai max-w-sm mx-auto">
                  {searchQuery || selectedTagFilter || selectedCharFilter || selectedChapterFilter
                    ? 'ลองล้างตัวกรองหรือเปลี่ยนคำค้นหาเพื่อดูโน้ตอื่นๆ'
                    : 'พิมพ์ข้อความในช่อง "จดไอเดียใหม่" ด้านบนเพื่อเริ่มบันทึกความคิดสร้างสรรค์ของคุณ'}
                </p>
              </div>
            ) : (
              filteredNotes.map(note => {
                const colorConfig = COLOR_MAP[note.color || 'amber'];
                const isEditingThis = editingNoteId === note.id;

                const linkedChars = project.characters.filter(c => note.characterIds?.includes(c.id));
                const linkedChapters = project.chapters.filter(c => note.chapterIds?.includes(c.id));
                const linkedLocations = project.locations.filter(l => note.locationIds?.includes(l.id));

                return (
                  <div
                    key={note.id}
                    className={`p-3.5 rounded-xl border transition-all ${colorConfig.bg} ${colorConfig.border} ${
                      note.pinned ? 'ring-1 ring-amber-500/40' : ''
                    } shadow-sm space-y-2.5 relative group`}
                  >
                    {/* Card Top: Pin, Date, Actions */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {/* Pin Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePin(note.id)}
                          className={`p-1 rounded hover:bg-stone-800/60 transition-colors ${
                            note.pinned ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
                          }`}
                          title={note.pinned ? 'ถอดหมุด' : 'ปักหมุดไว้บนสุด'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-amber-400' : ''}`} />
                        </button>

                        <span className="text-[10px] text-stone-500">
                          {new Date(note.createdAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyNote(note.id, note.content)}
                          className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
                          title="คัดลอกข้อความ"
                        >
                          {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(note)}
                          className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
                          title="แก้ไขข้อความ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800/80 transition-colors"
                          title="ลบโน้ต"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content (View or Edit) */}
                    {isEditingThis ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-100 font-sans-thai focus:outline-hidden focus:border-amber-500"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {(['amber', 'emerald', 'sky', 'rose', 'purple'] as QuickNote['color'][]).map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setEditColor(color)}
                                className={`w-3.5 h-3.5 rounded-full ${COLOR_MAP[color].dot} ${
                                  editColor === color ? 'ring-2 ring-stone-200' : 'opacity-60'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-1 text-xs text-stone-400 hover:text-stone-200"
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(note.id)}
                              className="px-2.5 py-1 text-xs rounded bg-amber-400 text-stone-950 font-medium hover:bg-amber-300"
                            >
                              บันทึก
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-200 font-sans-thai leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}

                    {/* Tags Chips */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center pt-1">
                        {note.tags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTagFilter(tag)}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-900/80 hover:bg-stone-800 text-amber-300/90 border border-stone-800 hover:border-amber-700/60 transition-colors"
                          >
                            <span>#{tag}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Linked Entities Bar: Characters, Chapters, Locations */}
                    {(linkedChars.length > 0 || linkedChapters.length > 0 || linkedLocations.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-800/60 text-[10px]">
                        {/* Linked Characters */}
                        {linkedChars.map(char => (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => {
                              if (onNavigateToTab) onNavigateToTab('characters', char.id);
                              else setSelectedCharFilter(char.id);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-800/60 text-sky-300 hover:bg-sky-900/60 transition-colors"
                            title={`ตัวละคร: ${char.name} (${char.roleLabel})`}
                          >
                            <Users className="w-2.5 h-2.5 text-sky-400" />
                            <span>{char.name}</span>
                          </button>
                        ))}

                        {/* Linked Chapters */}
                        {linkedChapters.map(ch => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => {
                              if (onNavigateToTab) onNavigateToTab('editor', ch.id);
                              else setSelectedChapterFilter(ch.id);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                            title={`บท: ${ch.title}`}
                          >
                            <BookOpen className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{ch.title}</span>
                          </button>
                        ))}

                        {/* Linked Locations */}
                        {linkedLocations.map(loc => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              if (onNavigateToTab) onNavigateToTab('settings', loc.id);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 transition-colors"
                            title={`สถานที่: ${loc.name}`}
                          >
                            <Compass className="w-2.5 h-2.5 text-purple-400" />
                            <span>{loc.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Card Bottom Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                      <div className="flex items-center gap-1.5">
                        {/* AI Expand Trigger */}
                        <button
                          type="button"
                          onClick={() => handleOpenAiExpand(note)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-950/60 hover:bg-amber-900/70 border border-amber-800/50 text-amber-300 transition-colors shadow-xs"
                          title="ให้ AI ช่วยต่อยอดไอเดียนี้เป็นฉากหรือบทสนทนา"
                        >
                          <Wand2 className="w-3 h-3 text-amber-400" />
                          <span>AI ช่วยต่อยอด</span>
                        </button>
                      </div>

                      {/* Insert to Chapter */}
                      {onInsertTextToChapter && (
                        <button
                          type="button"
                          onClick={() => {
                            const targetChId = note.chapterIds?.[0] || currentChapterId;
                            onInsertTextToChapter(note.content, targetChId);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 transition-colors"
                          title="แทรกเนื้อหาของโน้ตนี้ลงในต้นฉบับบทปัจจุบัน"
                        >
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                          <span>แทรกในบท</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer / Shortcut Hint */}
        <div className="p-3 border-t border-stone-800 bg-stone-900/50 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
          <span>กด <b>Ctrl+Enter</b> ในช่องพิมพ์เพื่อบันทึกทันใจ</span>
          <span><b>Esc</b> เพื่อปิด</span>
        </div>
      </div>

      {/* AI Expansion Modal Drawer */}
      {aiNoteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-xl bg-stone-950 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-100 text-sm font-serif-thai">
                    ให้ AI ช่วยต่อยอดไอเดีย (Quick Note Expansion)
                  </h4>
                  <p className="text-[11px] text-stone-400">แปลงข้อคิดดิบๆ ให้เป็นฉาก ร้อยกรอง หรือคำแนะนำการจัดวาง</p>
                </div>
              </div>
              <button
                onClick={() => setAiNoteTarget(null)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Note Preview */}
            <div className="p-3 rounded-lg bg-stone-900/80 border border-stone-800 text-xs space-y-1">
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                ไอเดียตั้งต้น:
              </span>
              <p className="text-stone-200 font-sans-thai">{aiNoteTarget.content}</p>
            </div>

            {/* Mode Selector */}
            <div className="space-y-1.5 text-xs">
              <span className="font-medium text-stone-300">เลือกแนวทางการต่อยอด:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAiFocusMode('scene')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    aiFocusMode === 'scene'
                      ? 'bg-amber-950/70 border-amber-700/80 text-amber-200'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <p className="font-semibold text-[11px]">บรรยายฉากเต็ม</p>
                  <p className="text-[10px] text-stone-400">เขียนเป็นร้อยแก้ว 2-3 ย่อหน้า</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAiFocusMode('dialogue')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    aiFocusMode === 'dialogue'
                      ? 'bg-amber-950/70 border-amber-700/80 text-amber-200'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <p className="font-semibold text-[11px]">บทสนทนาโต้ตอบ</p>
                  <p className="text-[10px] text-stone-400">แต่งบทพูดคมคายและภาษากาย</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAiFocusMode('placement')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    aiFocusMode === 'placement'
                      ? 'bg-amber-950/70 border-amber-700/80 text-amber-200'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <p className="font-semibold text-[11px]">วิเคราะห์จัดวางพล็อต</p>
                  <p className="text-[10px] text-stone-400">แนะนำจุดที่ควรใส่ในบทใด</p>
                </button>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={handleRunAiExpand}
              disabled={aiGenerating}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-medium text-xs shadow-md transition-all disabled:opacity-50"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังรังสรรค์และต่อยอดเนื้อหาด้วย AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>เริ่มการสร้างสรรค์เนื้อหา</span>
                </>
              )}
            </button>

            {/* AI Result Display */}
            {aiResult && (
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-amber-800/50 space-y-3 max-h-64 overflow-y-auto">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ผลลัพธ์จาก AI:</span>
                </span>
                <p className="text-xs text-stone-200 font-sans-thai whitespace-pre-wrap leading-relaxed">
                  {aiResult}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult);
                      alert('คัดลอกข้อความแล้ว!');
                    }}
                    className="px-2.5 py-1 text-xs rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  >
                    คัดลอก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAiAsNote}
                    className="px-2.5 py-1 text-xs rounded bg-amber-950/70 border border-amber-800/70 hover:bg-amber-900 text-amber-300 font-medium transition-colors"
                  >
                    บันทึกเป็นโน้ตใหม่
                  </button>
                  {onInsertTextToChapter && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetChId = aiNoteTarget.chapterIds?.[0] || currentChapterId;
                        onInsertTextToChapter(aiResult, targetChId);
                        setAiNoteTarget(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-amber-400 text-stone-950 font-medium hover:bg-amber-300 transition-colors"
                    >
                      แทรกลงในบททันที
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
