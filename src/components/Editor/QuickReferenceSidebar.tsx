import React, { useState } from 'react';
import { NovelProject, Character, SettingLocation, QuickNote } from '../../types/novel';
import { Users, Compass, ScrollText, Copy, PlusCircle, Check, ArrowRight, Lightbulb, Tag, Pin, Plus, BookOpen } from 'lucide-react';

interface QuickReferenceSidebarProps {
  project: NovelProject;
  currentChapterId: string;
  onInsertText: (text: string) => void;
  onClose?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenFullNotesDrawer?: () => void;
  onUpdateProject?: (updated: NovelProject) => void;
}

export const QuickReferenceSidebar: React.FC<QuickReferenceSidebarProps> = ({
  project,
  currentChapterId,
  onInsertText,
  onNavigateToTab,
  onOpenFullNotesDrawer,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'beat' | 'notes'>('characters');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick note composer in sidebar
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [quickNoteTag, setQuickNoteTag] = useState('');
  const [quickNoteColor, setQuickNoteColor] = useState<QuickNote['color']>('amber');

  const currentChapter = project.chapters.find(c => c.id === currentChapterId);
  const povCharacter = project.characters.find(c => c.id === currentChapter?.povCharacterId);
  const currentLocation = project.locations.find(l => l.id === currentChapter?.locationId);
  const quickNotes = project.quickNotes || [];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveSidebarNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteContent.trim() || !onUpdateProject) return;

    const newNote: QuickNote = {
      id: `qn-${Date.now()}`,
      content: quickNoteContent.trim(),
      color: quickNoteColor,
      tags: quickNoteTag.trim() ? [quickNoteTag.trim().replace(/^#/, '')] : ['โน้ตระหว่างเขียน'],
      chapterIds: currentChapterId ? [currentChapterId] : undefined,
      pinned: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateProject({
      ...project,
      quickNotes: [newNote, ...quickNotes],
      updatedAt: new Date().toISOString(),
    });

    setQuickNoteContent('');
    setQuickNoteTag('');
  };

  // Filter notes for sidebar: notes linked to this chapter first
  const chapterNotes = quickNotes.filter(n => n.chapterIds?.includes(currentChapterId));
  const otherNotes = quickNotes.filter(n => !n.chapterIds?.includes(currentChapterId));

  return (
    <div className="h-full flex flex-col bg-stone-900 border-l border-stone-800 text-stone-200 w-80 md:w-96 select-none">
      {/* Header Tabs */}
      <div className="p-2 border-b border-stone-800 bg-stone-950 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'characters'
              ? 'bg-stone-800 text-amber-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
          title="ตัวละคร"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ตัวละคร</span>
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'locations'
              ? 'bg-stone-800 text-amber-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
          title="ฉาก & สถานที่"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ฉาก</span>
        </button>
        <button
          onClick={() => setActiveTab('beat')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'beat'
              ? 'bg-stone-800 text-amber-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
          title="ทรีทเม้นต์บทนี้"
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ทรีทเม้นต์</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'notes'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
          title="โน้ตด่วน & ไอเดีย"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>โน้ต</span>
          {quickNotes.length > 0 && (
            <span className="text-[10px] px-1 rounded-full bg-stone-800 text-amber-300 font-semibold">
              {quickNotes.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'notes' && (
          <div className="space-y-3">
            {/* Top Bar inside Notes Tab */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>โน้ตด่วน & ไอเดียกระจัดกระจาย</span>
              </span>
              {onOpenFullNotesDrawer && (
                <button
                  type="button"
                  onClick={onOpenFullNotesDrawer}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                >
                  <span>คลังเต็ม</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Note Mini Composer */}
            {onUpdateProject && (
              <form onSubmit={handleSaveSidebarNote} className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 space-y-2">
                <textarea
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  placeholder={`จดไอเดียสำหรับ ${currentChapter?.title || 'บทนี้'}...`}
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 rounded p-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 resize-none font-sans-thai"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={quickNoteTag}
                    onChange={(e) => setQuickNoteTag(e.target.value)}
                    placeholder="#แท็ก..."
                    className="flex-1 bg-stone-900 border border-stone-800 rounded px-2 py-1 text-[11px] text-stone-200 placeholder-stone-600 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={!quickNoteContent.trim()}
                    className="px-2.5 py-1 text-xs rounded bg-amber-400 text-stone-950 font-medium hover:bg-amber-300 disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>จดโน้ต</span>
                  </button>
                </div>
              </form>
            )}

            {/* Notes linked to this chapter */}
            {chapterNotes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>โน้ตประจำบทนี้ ({chapterNotes.length})</span>
                </span>
                {chapterNotes.map(note => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-stone-200 font-sans-thai text-xs leading-relaxed whitespace-pre-wrap flex-1">
                        {note.content}
                      </p>
                      <button
                        type="button"
                        onClick={() => onInsertText(note.content)}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 shrink-0"
                        title="แทรกลงในบทนี้"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-emerald-900/40 text-[10px]">
                      {note.tags?.map(t => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                          #{t}
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleCopy(note.id, note.content)}
                        className="ml-auto text-stone-400 hover:text-stone-200"
                      >
                        {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other Notes */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                <span>โน้ตไอเดียทั้งหมด ({otherNotes.length})</span>
              </span>

              {otherNotes.map(note => (
                <div
                  key={note.id}
                  className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-stone-300 font-sans-thai text-xs leading-relaxed whitespace-pre-wrap flex-1">
                      {note.content}
                    </p>
                    <button
                      type="button"
                      onClick={() => onInsertText(note.content)}
                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 shrink-0"
                      title="แทรกลงในบทนี้"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-stone-800 text-[10px]">
                    {note.tags?.map(t => (
                      <span key={t} className="px-1.5 py-0.2 rounded bg-stone-900 text-stone-400 border border-stone-800">
                        #{t}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleCopy(note.id, note.content)}
                      className="ml-auto text-stone-400 hover:text-stone-200"
                    >
                      {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-3">
            {povCharacter && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs space-y-1">
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  POV ผู้ดำเนินมุมมองบทนี้
                </span>
                <p className="font-semibold text-stone-100">{povCharacter.name}</p>
                <p className="text-stone-300 text-[11px]">{povCharacter.roleLabel}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              <span>รายชื่อตัวละครทั้งหมด ({project.characters.length})</span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('characters')}
                  className="text-amber-400 hover:text-amber-300 normal-case flex items-center gap-0.5"
                >
                  <span>ไปหน้าตัวละคร</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {project.characters.map(char => (
              <div
                key={char.id}
                className="p-3 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-stone-700 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-100">{char.name}</h4>
                    {char.alias && <p className="text-[11px] text-amber-400/90">{char.alias}</p>}
                    <span className="text-[10px] text-stone-400">{char.roleLabel} · {char.age || 'ไม่ระบุอายุ'}</span>
                  </div>
                  <button
                    onClick={() => onInsertText(char.name)}
                    title="แทรกชื่อลงในต้นฉบับ"
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

                <div className="space-y-1 text-[11px] text-stone-300 font-sans-thai">
                  <div>
                    <span className="text-stone-500 font-medium">บุคลิก: </span>
                    <span>{char.personality}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">เป้าหมาย: </span>
                    <span className="text-emerald-400/90">{char.goal}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">ปมในใจ: </span>
                    <span className="text-rose-400/90">{char.coreFlaw}</span>
                  </div>
                  {char.speechHabits && (
                    <div className="pt-1 border-t border-stone-800/80">
                      <span className="text-stone-500 font-medium">สำนวนคำพูด: </span>
                      <span className="italic text-stone-300">{char.speechHabits}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-3">
            {currentLocation && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs space-y-1">
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  สถานที่หลักประจำบทนี้
                </span>
                <p className="font-semibold text-stone-100">{currentLocation.name}</p>
                <p className="text-stone-300 text-[11px]">{currentLocation.type}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              <span>ฉาก & สิ่งแวดล้อม ({project.locations.length})</span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('settings')}
                  className="text-amber-400 hover:text-amber-300 normal-case flex items-center gap-0.5"
                >
                  <span>ไปหน้าฉาก</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {project.locations.map(loc => (
              <div
                key={loc.id}
                className="p-3 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-stone-700 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-100">{loc.name}</h4>
                    <span className="text-[10px] text-stone-400">{loc.type}</span>
                  </div>
                  <button
                    onClick={() => onInsertText(loc.name)}
                    title="แทรกชื่อสถานที่"
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

                <p className="text-[11px] text-amber-300/80 italic">{loc.atmosphere}</p>

                <div className="space-y-1 text-[11px] text-stone-300 pt-1 border-t border-stone-800/60">
                  <div>
                    <span className="text-stone-500">ภาพที่เห็น: </span>
                    <span>{loc.visualSensory}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">เสียงแวดล้อม: </span>
                    <span>{loc.audioSensory}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">กลิ่นอาย: </span>
                    <span>{loc.scentSensory}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'beat' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-2">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                เป้าหมายของบท ({currentChapter?.title})
              </span>
              <p className="text-stone-200 leading-relaxed font-sans-thai">
                {currentChapter?.summary || 'ยังไม่ได้ระบุโครงเรื่องย่อของบทนี้'}
              </p>
              {currentChapter?.notes && (
                <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">โน้ตนักเขียน: </span>
                  <span>{currentChapter.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider pt-2">
              <span>โครงสร้างเรื่องใหญ่ (Story Beats)</span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('treatment')}
                  className="text-amber-400 hover:text-amber-300 normal-case flex items-center gap-0.5"
                >
                  <span>ไปหน้าทรีทเม้นต์</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {project.storyBeats.map(beat => (
                <div
                  key={beat.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                    beat.completed
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-stone-300'
                      : 'bg-stone-950/60 border-stone-800/80 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-100 text-[11px]">{beat.title}</span>
                    <span className="text-[10px] text-amber-400">{beat.act}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-normal">{beat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
