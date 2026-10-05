import React, { useState } from 'react';
import { NovelProject, StoryBeat, Chapter } from '../../types/novel';
import { 
  ScrollText, 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2, 
  Edit3, 
  PenTool, 
  Bookmark, 
  Layers, 
  Target,
  Sparkles,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface TreatmentViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  onJumpToChapter: (chapterId: string) => void;
  onOpenAnalysis?: () => void;
  onJumpToCharacter?: (charId: string) => void;
  onJumpToLocation?: (locId: string) => void;
}

export const TreatmentView: React.FC<TreatmentViewProps> = ({
  project,
  onUpdateProject,
  onJumpToChapter,
  onOpenAnalysis,
  onJumpToCharacter,
  onJumpToLocation,
}) => {
  const [selectedAct, setSelectedAct] = useState<'All' | 'Act 1' | 'Act 2' | 'Act 3'>('All');
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);

  // New Beat State
  const [showAddBeatModal, setShowAddBeatModal] = useState(false);
  const [newBeatTitle, setNewBeatTitle] = useState('');
  const [newBeatAct, setNewBeatAct] = useState<'Act 1' | 'Act 2' | 'Act 3'>('Act 1');
  const [newBeatTiming, setNewBeatTiming] = useState('');
  const [newBeatDesc, setNewBeatDesc] = useState('');

  const filteredBeats = selectedAct === 'All' 
    ? project.storyBeats 
    : project.storyBeats.filter(b => b.act === selectedAct);

  const toggleBeatCompleted = (beatId: string) => {
    const updated = project.storyBeats.map(b => 
      b.id === beatId ? { ...b, completed: !b.completed } : b
    );
    onUpdateProject({ ...project, storyBeats: updated, updatedAt: new Date().toISOString() });
  };

  const handleAddBeat = () => {
    if (!newBeatTitle.trim()) return;
    const newBeat: StoryBeat = {
      id: `beat-${Date.now()}`,
      act: newBeatAct,
      title: newBeatTitle,
      timing: newBeatTiming || 'ไม่ระบุช่วง',
      description: newBeatDesc,
      completed: false,
    };
    onUpdateProject({
      ...project,
      storyBeats: [...project.storyBeats, newBeat],
      updatedAt: new Date().toISOString(),
    });
    setShowAddBeatModal(false);
    setNewBeatTitle('');
    setNewBeatTiming('');
    setNewBeatDesc('');
  };

  const handleDeleteBeat = (id: string) => {
    if (!confirm('ต้องการลบจุดเรื่อง (Story Beat) นี้ใช่หรือไม่?')) return;
    onUpdateProject({
      ...project,
      storyBeats: project.storyBeats.filter(b => b.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-900 text-stone-100 p-4 md:p-8 space-y-8 select-none">
      {/* Top Banner: Logline & Premise */}
      <div className="max-w-6xl mx-auto bg-stone-950/80 border border-stone-800 rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <ScrollText className="w-4 h-4" />
              <span>ภาพรวมโครงเรื่อง & ทรีทเม้นต์ (Treatment Overview)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-serif-thai text-stone-100 mt-1">
              {project.title}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              แนวเรื่อง: {project.genre} · ผู้แต่ง: {project.author}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAnalysis && (
              <button
                onClick={onOpenAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                title="วิเคราะห์ความสมเหตุสมผลและหลุมพล็อตด้วย AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>วิเคราะห์พล็อตด้วย AI</span>
              </button>
            )}

            <button
              onClick={() => setShowAddBeatModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มจุดสำคัญ (Story Beat)</span>
            </button>
          </div>
        </div>

        {/* Premise & Theme Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-stone-900/80 rounded-lg border border-stone-800/80 space-y-1">
            <span className="font-semibold text-amber-400">แก่นเรื่อง / คำถามหลัก (Core Theme):</span>
            <p className="text-stone-300 leading-relaxed font-sans-thai">{project.theme}</p>
          </div>
          <div className="p-3 bg-stone-900/80 rounded-lg border border-stone-800/80 space-y-1">
            <span className="font-semibold text-amber-400">น้ำเสียงและบรรยากาศ (Tone & Atmosphere):</span>
            <p className="text-stone-300 leading-relaxed font-sans-thai">{project.tone}</p>
          </div>
        </div>

        <div className="p-3 bg-stone-900/80 rounded-lg border border-stone-800/80 space-y-1 text-xs">
          <span className="font-semibold text-amber-400">ล็อกไลน์ / จุดขายของเรื่อง (Logline):</span>
          <p className="text-stone-200 leading-relaxed font-sans-thai text-sm">{project.logline}</p>
        </div>
      </div>

      {/* Story Beats Section (3-Act Structure) */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-stone-100 font-serif-thai">
              โครงสร้างเรื่องใหญ่ (Story Beats & 3-Act Structure)
            </h2>
          </div>

          {/* Act Filter Tabs */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
            {(['All', 'Act 1', 'Act 2', 'Act 3'] as const).map(act => (
              <button
                key={act}
                onClick={() => setSelectedAct(act)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedAct === act
                    ? 'bg-stone-800 text-amber-300 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {act === 'All' ? 'ทั้งหมด' : act === 'Act 1' ? 'องก์ ๑' : act === 'Act 2' ? 'องก์ ๒' : 'องก์ ๓'}
              </button>
            ))}
          </div>
        </div>

        {/* Beats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeats.map(beat => (
            <div
              key={beat.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                beat.completed
                  ? 'bg-stone-950/40 border-emerald-900/50 text-stone-400'
                  : 'bg-stone-950/80 border-stone-800 hover:border-amber-800/60 text-stone-200 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBeatCompleted(beat.id)}
                      title={beat.completed ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเขียนเสร็จแล้ว'}
                      className="text-stone-400 hover:text-emerald-400 transition-colors"
                    >
                      {beat.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-500" />
                      )}
                    </button>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-800 text-amber-400">
                      {beat.act}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBeat(beat.id)}
                    className="text-stone-500 hover:text-rose-400 p-1 rounded"
                    title="ลบจุดนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className={`font-semibold text-sm font-sans-thai ${beat.completed ? 'line-through text-stone-400' : 'text-stone-100'}`}>
                  {beat.title}
                </h3>
                <span className="text-[11px] text-amber-400/80 block">{beat.timing}</span>
                <p className="text-xs text-stone-300 leading-relaxed font-sans-thai pt-1">
                  {beat.description}
                </p>
              </div>

              {beat.chapterTarget && (
                <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-amber-400" />
                    <span>เป้าหมาย: {beat.chapterTarget}</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chapters Outline Cards */}
      <div className="max-w-6xl mx-auto space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-stone-100 font-serif-thai">
              โครงเรื่องรายบท (Chapter Treatments)
            </h2>
          </div>
          <span className="text-xs text-stone-400">{project.chapters.length} บท</span>
        </div>

        <div className="space-y-3">
          {project.chapters.map(ch => {
            const pov = project.characters.find(c => c.id === ch.povCharacterId);
            const loc = project.locations.find(l => l.id === ch.locationId);
            return (
              <div
                key={ch.id}
                className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-stone-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold text-sm text-stone-100 font-serif-thai">{ch.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium ${
                      ch.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : ch.status === 'polishing'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-stone-800 text-stone-300'
                    }`}>
                      {ch.status === 'completed' ? 'สมบูรณ์' : ch.status === 'polishing' ? 'เกลาสำนวน' : 'ร่างแรก'}
                    </span>
                  </div>

                  <p className="text-stone-300 leading-relaxed font-sans-thai text-xs">
                    {ch.summary || 'ยังไม่มีการเขียนเรื่องย่อของบทนี้'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 pt-1">
                    {pov && (
                      <button
                        onClick={() => onJumpToCharacter?.(pov.id)}
                        className="hover:text-amber-300 transition-colors flex items-center gap-1 group text-left"
                        title="คลิกเพื่อเปิดข้อมูลตัวละครนี้"
                      >
                        <span className="text-stone-500">POV:</span>
                        <strong className="text-stone-200 group-hover:underline underline-offset-2">{pov.name}</strong>
                      </button>
                    )}
                    {loc && (
                      <button
                        onClick={() => onJumpToLocation?.(loc.id)}
                        className="hover:text-amber-300 transition-colors flex items-center gap-1 group text-left"
                        title="คลิกเพื่อเปิดข้อมูลฉากนี้"
                      >
                        <span className="text-stone-500">สถานที่:</span>
                        <strong className="text-stone-200 group-hover:underline underline-offset-2">{loc.name}</strong>
                      </button>
                    )}
                    <span>เป้าหมายคำ: <strong className="text-stone-200">{ch.targetWords.toLocaleString()}</strong></span>
                    {(() => {
                      const notesCount = (project.quickNotes || []).filter(n => n.chapterIds?.includes(ch.id)).length;
                      if (notesCount === 0) return null;
                      return (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span>{notesCount} โน้ต</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onJumpToChapter(ch.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-400" />
                    <span>เขียนบทนี้</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Beat Modal */}
      {showAddBeatModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <h3 className="font-semibold text-stone-100 font-serif-thai text-base">เพิ่มจุดเหตุการณ์สำคัญ (Story Beat)</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">ชื่อจุดเรื่อง (Beat Title):</label>
                <input
                  type="text"
                  value={newBeatTitle}
                  onChange={(e) => setNewBeatTitle(e.target.value)}
                  placeholder="เช่น จุดหักมุมกึ่งกลางเรื่อง, การสูญเสียอาจารย์"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">ช่วงองก์ (Act):</label>
                  <select
                    value={newBeatAct}
                    onChange={(e) => setNewBeatAct(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Act 1">องก์ ๑ (Act 1 - Setup)</option>
                    <option value="Act 2">องก์ ๒ (Act 2 - Confrontation)</option>
                    <option value="Act 3">องก์ ๓ (Act 3 - Resolution)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">ช่วงเวลาของเรื่อง:</label>
                  <input
                    type="text"
                    value={newBeatTiming}
                    onChange={(e) => setNewBeatTiming(e.target.value)}
                    placeholder="เช่น 25%, บทที่ 3-4"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">รายละเอียดและผลกระทบของเหตุการณ์:</label>
                <textarea
                  value={newBeatDesc}
                  onChange={(e) => setNewBeatDesc(e.target.value)}
                  placeholder="เกิดอะไรขึ้น ตัวละครใดเกี่ยวข้อง และเปลี่ยนทิศทางเรื่องอย่างไร..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddBeatModal(false)}
                className="px-3 py-1.5 text-stone-400 hover:text-stone-200 text-xs rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddBeat}
                disabled={!newBeatTitle.trim()}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                เพิ่มเข้าทรีทเม้นต์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
