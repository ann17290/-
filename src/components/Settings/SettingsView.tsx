import React, { useState } from 'react';
import { NovelProject, SettingLocation } from '../../types/novel';
import { 
  Compass, 
  Plus, 
  Trash2, 
  Sparkles, 
  Eye, 
  Volume2, 
  Wind, 
  Hand, 
  BookOpen, 
  Loader2, 
  Copy, 
  Check,
  ShieldAlert
} from 'lucide-react';
import { requestAIAssist } from '../../services/aiService';

interface SettingsViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  onJumpToEditorWithScene?: (sceneDescription: string) => void;
  onJumpToChapter?: (chapterId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  project,
  onUpdateProject,
  onJumpToEditorWithScene,
  onJumpToChapter,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(
    project.locations[0]?.id || ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAiDescribing, setIsAiDescribing] = useState(false);
  const [aiSceneProse, setAiSceneProse] = useState<string | null>(null);
  const [copiedProse, setCopiedProse] = useState(false);

  // New location form
  const [newLoc, setNewLoc] = useState<Partial<SettingLocation>>({
    name: '',
    type: 'พระราชวัง / เขตพระราชฐาน',
    atmosphere: '',
    visualSensory: '',
    audioSensory: '',
    scentSensory: '',
    tactileSensory: '',
    historyLore: '',
    rulesOrMagic: '',
  });

  const selectedLoc = project.locations.find(l => l.id === selectedLocId) || project.locations[0];

  const handleUpdateCurrentLoc = (fields: Partial<SettingLocation>) => {
    if (!selectedLoc) return;
    const updated = project.locations.map(l => 
      l.id === selectedLoc.id ? { ...l, ...fields } : l
    );
    onUpdateProject({ ...project, locations: updated, updatedAt: new Date().toISOString() });
  };

  const handleAddLocation = () => {
    if (!newLoc.name?.trim()) return;
    const loc: SettingLocation = {
      id: `loc-${Date.now()}`,
      name: newLoc.name,
      type: newLoc.type || 'สถานที่ทั่วไป',
      atmosphere: newLoc.atmosphere || '',
      visualSensory: newLoc.visualSensory || '',
      audioSensory: newLoc.audioSensory || '',
      scentSensory: newLoc.scentSensory || '',
      tactileSensory: newLoc.tactileSensory || '',
      historyLore: newLoc.historyLore || '',
      rulesOrMagic: newLoc.rulesOrMagic || '',
    };
    onUpdateProject({
      ...project,
      locations: [...project.locations, loc],
      updatedAt: new Date().toISOString(),
    });
    setSelectedLocId(loc.id);
    setShowAddModal(false);
    setNewLoc({
      name: '',
      type: 'พระราชวัง / เขตพระราชฐาน',
      atmosphere: '',
      visualSensory: '',
      audioSensory: '',
      scentSensory: '',
      tactileSensory: '',
      historyLore: '',
      rulesOrMagic: '',
    });
  };

  const handleDeleteLocation = (id: string) => {
    if (project.locations.length <= 1) {
      alert('ไม่สามารถลบฉากสุดท้ายได้');
      return;
    }
    if (!confirm('ยืนยันที่จะลบฉากนี้หรือไม่?')) return;
    const remaining = project.locations.filter(l => l.id !== id);
    onUpdateProject({
      ...project,
      locations: remaining,
      updatedAt: new Date().toISOString(),
    });
    setSelectedLocId(remaining[0].id);
  };

  // AI Instant Scene Prose Generator
  const handleGenerateSceneProse = async () => {
    if (!selectedLoc) return;
    setIsAiDescribing(true);
    setAiSceneProse(null);

    try {
      const prompt = `สถานที่: ${selectedLoc.name} (${selectedLoc.type})
บรรยากาศ: ${selectedLoc.atmosphere}
ประสาทสัมผัสทางสายตา: ${selectedLoc.visualSensory}
เสียงแวดล้อม: ${selectedLoc.audioSensory}
กลิ่นอาย: ${selectedLoc.scentSensory}
สัมผัสอุณหภูมิ: ${selectedLoc.tactileSensory}
ประวัติ/กฎ: ${selectedLoc.historyLore}
แนวเรื่อง: ${project.genre}`;

      const result = await requestAIAssist('describe_scene', prompt, {
        treatment: project.logline,
      });

      setAiSceneProse(result);
    } catch (err: any) {
      alert(`AI ขัดข้อง: ${err.message}`);
    } finally {
      setIsAiDescribing(false);
    }
  };

  const copySceneProse = () => {
    if (!aiSceneProse) return;
    navigator.clipboard.writeText(aiSceneProse);
    setCopiedProse(true);
    setTimeout(() => setCopiedProse(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-stone-900 text-stone-100 select-none">
      {/* Locations Directory Sidebar */}
      <aside className="w-72 md:w-80 border-r border-stone-800 bg-stone-950/80 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider font-sans-thai">
              ฉาก & สร้างโลก ({project.locations.length})
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1 rounded-md text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            title="เพิ่มฉากใหม่"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {project.locations.map(loc => {
            const isSelected = loc.id === selectedLocId;
            return (
              <div
                key={loc.id}
                onClick={() => {
                  setSelectedLocId(loc.id);
                  setAiSceneProse(null);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-800/70 text-amber-100 shadow-sm'
                    : 'border-stone-800/50 bg-stone-900/40 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-stone-100 font-sans-thai truncate max-w-[170px]">
                    {loc.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                    {loc.type.split('/')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-amber-400/80 mt-1.5 line-clamp-1 italic">
                  {loc.atmosphere || 'ยังไม่ได้ระบุบรรยากาศ'}
                </p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Setting Inspector */}
      {selectedLoc ? (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Setting Card */}
            <div className="p-6 rounded-xl bg-stone-950/80 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>ข้อมูลฉากและสถานที่</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold font-serif-thai text-stone-100 mt-1">
                  {selectedLoc.name}
                </h1>
                <p className="text-xs text-stone-400 mt-0.5">ประเภท: {selectedLoc.type}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateSceneProse}
                  disabled={isAiDescribing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isAiDescribing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>ให้ AI เขียนบทบรรยายฉาก</span>
                </button>

                <button
                  onClick={() => handleDeleteLocation(selectedLoc.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 rounded-lg border border-stone-800 hover:bg-stone-900 transition-colors"
                  title="ลบฉากนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Generated AI Scene Prose */}
            {aiSceneProse && (
              <div className="p-5 rounded-xl bg-stone-950 border border-amber-800/40 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    บทบรรยายฉากสำเร็จรูป (วรรณศิลป์ประณีต)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copySceneProse}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200"
                    >
                      {copiedProse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedProse ? 'คัดลอกแล้ว' : 'คัดลอกนำไปใช้'}</span>
                    </button>
                  </div>
                </div>
                <div className="text-stone-200 text-xs md:text-sm leading-relaxed font-sans-thai whitespace-pre-wrap">
                  {aiSceneProse}
                </div>
              </div>
            )}

            {/* Atmosphere Overview */}
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2 text-xs">
              <span className="font-semibold text-amber-400 text-sm">บรรยากาศและอารมณ์โดยรวม (Atmosphere & Mood):</span>
              <textarea
                value={selectedLoc.atmosphere}
                onChange={(e) => handleUpdateCurrentLoc({ atmosphere: e.target.value })}
                rows={2}
                placeholder="เช่น เย็นเยียบ เงียบสงัด มีกลิ่นควันกำยานหอมปนเปกับความลับ..."
                className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
              />
            </div>

            {/* 5-Sensory Details Palette */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm font-serif-thai text-stone-200">
                มิติประสาทสัมผัสทั้งห้า (Sensory Palette)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Visual */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <Eye className="w-4 h-4" />
                    <span>ภาพที่เห็น (Visuals & Light):</span>
                  </div>
                  <textarea
                    value={selectedLoc.visualSensory}
                    onChange={(e) => handleUpdateCurrentLoc({ visualSensory: e.target.value })}
                    rows={3}
                    placeholder="เช่น ระเบียงไม้สักทอง ผ้าม่านไหมพลิ้ว แสงตะเกียงน้ำมันสลัว..."
                    className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                  />
                </div>

                {/* Audio */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                    <Volume2 className="w-4 h-4" />
                    <span>เสียงแวดล้อม (Audio & Sounds):</span>
                  </div>
                  <textarea
                    value={selectedLoc.audioSensory}
                    onChange={(e) => handleUpdateCurrentLoc({ audioSensory: e.target.value })}
                    rows={3}
                    placeholder="เช่น เสียงกระดิ่งลมสำริด เสียงหยดฝนตกกระทบหลังคากระเบื้อง..."
                    className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                  />
                </div>

                {/* Scent */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                    <Wind className="w-4 h-4" />
                    <span>กลิ่นอาย (Scents & Aromas):</span>
                  </div>
                  <textarea
                    value={selectedLoc.scentSensory}
                    onChange={(e) => handleUpdateCurrentLoc({ scentSensory: e.target.value })}
                    rows={3}
                    placeholder="เช่น กลิ่นควันกำยานไม้กฤษณา กลิ่นคาวสนิม กลิ่นดอกไม้ชุ่มฝน..."
                    className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                  />
                </div>

                {/* Tactile */}
                <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <Hand className="w-4 h-4" />
                    <span>สัมผัสและอุณหภูมิ (Tactile & Temperature):</span>
                  </div>
                  <textarea
                    value={selectedLoc.tactileSensory}
                    onChange={(e) => handleUpdateCurrentLoc({ tactileSensory: e.target.value })}
                    rows={3}
                    placeholder="เช่น ความเย็นเยียบของแผ่นหินอ่อน สัมผัสเปียกชื้นของละอองฝน..."
                    className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Lore & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                <span className="font-semibold text-amber-400 text-sm">ประวัติความเป็นมาและตำนาน (Lore & History):</span>
                <textarea
                  value={selectedLoc.historyLore}
                  onChange={(e) => handleUpdateCurrentLoc({ historyLore: e.target.value })}
                  rows={4}
                  placeholder="เรื่องเล่า ความเป็นมา หรือความลับที่ซ่อนอยู่ในสถานที่แห่งนี้..."
                  className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                <span className="font-semibold text-rose-400 text-sm">กฎระเบียบหรือเวทมนตร์เฉพาะที่ (Rules & Magic):</span>
                <textarea
                  value={selectedLoc.rulesOrMagic}
                  onChange={(e) => handleUpdateCurrentLoc({ rulesOrMagic: e.target.value })}
                  rows={4}
                  placeholder="ข้อห้าม กฎหมายของสถานที่ เวทมนตร์ หรือเงื่อนไขพิเศษ..."
                  className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                />
              </div>
            </div>

            {/* Associated Chapters using this Location */}
            {(() => {
              const usingChapters = project.chapters.filter(c => c.locationId === selectedLoc.id);
              if (usingChapters.length === 0) return null;
              return (
                <div className="space-y-2 pt-2">
                  <h3 className="font-semibold text-sm font-serif-thai text-stone-200">
                    บทที่ดำเนินเรื่องในฉากนี้ ({usingChapters.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {usingChapters.map(ch => (
                      <div
                        key={ch.id}
                        className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 flex items-center justify-between"
                      >
                        <span className="font-medium text-stone-200 truncate max-w-[200px]">{ch.title}</span>
                        {onJumpToChapter && (
                          <button
                            onClick={() => onJumpToChapter(ch.id)}
                            className="text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            ไปเขียนบทนี้ →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-500 text-sm">
          เลือกฉากจากแถบด้านซ้ายเพื่อดูหรือแก้ไขข้อมูล
        </div>
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <h3 className="font-semibold text-stone-100 font-serif-thai text-base">เพิ่มฉาก / สถานที่ใหม่</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">ชื่อฉากหรือสถานที่:*</label>
                <input
                  type="text"
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  placeholder="เช่น ยอดผาน้ำค้างแข็ง, หอตำราหลวง"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">ประเภทสถานที่:</label>
                <input
                  type="text"
                  value={newLoc.type}
                  onChange={(e) => setNewLoc({ ...newLoc, type: e.target.value })}
                  placeholder="เช่น พระราชวัง, ธรรมชาติ/ป่าเขา, เมืองท่า, ตลาดมืด"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">บรรยากาศและอารมณ์โดยรวม:</label>
                <textarea
                  value={newLoc.atmosphere}
                  onChange={(e) => setNewLoc({ ...newLoc, atmosphere: e.target.value })}
                  placeholder="เช่น หนาวเหน็บ ลึกลับ อันตรายแต่น่าเกรงขาม..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-stone-400 hover:text-stone-200 text-xs rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddLocation}
                disabled={!newLoc.name?.trim()}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                สร้างสถานที่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
