import React, { useState } from 'react';
import { NovelProject, Character, CharacterRelationship } from '../../types/novel';
import { 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  Shield, 
  Crown, 
  Heart, 
  MessageSquare, 
  BookOpen, 
  Edit3, 
  ArrowRight,
  UserCheck,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { requestAIAssist } from '../../services/aiService';

interface CharactersViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  onJumpToEditorWithCharacter?: (charName: string) => void;
  onJumpToDiagram?: () => void;
}

export const CharactersView: React.FC<CharactersViewProps> = ({
  project,
  onUpdateProject,
  onJumpToEditorWithCharacter,
  onJumpToDiagram,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    project.characters[0]?.id || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiIdeaOutput, setAiIdeaOutput] = useState<string | null>(null);

  // New Character State
  const [newChar, setNewChar] = useState<Partial<Character>>({
    name: '',
    alias: '',
    role: 'supporting',
    roleLabel: 'ตัวละครสมทบ',
    age: '',
    gender: '',
    appearance: '',
    personality: '',
    goal: '',
    coreFlaw: '',
    backstory: '',
    speechHabits: '',
    color: '#0284c7',
  });

  const selectedChar = project.characters.find(c => c.id === selectedCharId) || project.characters[0];

  const handleUpdateCurrentChar = (fields: Partial<Character>) => {
    if (!selectedChar) return;
    const updated = project.characters.map(c => 
      c.id === selectedChar.id ? { ...c, ...fields } : c
    );
    onUpdateProject({ ...project, characters: updated, updatedAt: new Date().toISOString() });
  };

  const handleAddCharacter = () => {
    if (!newChar.name?.trim()) return;
    const char: Character = {
      id: `char-${Date.now()}`,
      name: newChar.name,
      alias: newChar.alias || '',
      role: newChar.role || 'supporting',
      roleLabel: newChar.roleLabel || 'ตัวละครสมทบ',
      age: newChar.age || '',
      gender: newChar.gender || '',
      appearance: newChar.appearance || '',
      personality: newChar.personality || '',
      goal: newChar.goal || '',
      coreFlaw: newChar.coreFlaw || '',
      backstory: newChar.backstory || '',
      speechHabits: newChar.speechHabits || '',
      color: newChar.color || '#0284c7',
      avatarIcon: 'Sparkles',
    };

    onUpdateProject({
      ...project,
      characters: [...project.characters, char],
      updatedAt: new Date().toISOString(),
    });
    setSelectedCharId(char.id);
    setShowAddModal(false);
    setNewChar({
      name: '',
      alias: '',
      role: 'supporting',
      roleLabel: 'ตัวละครสมทบ',
      age: '',
      gender: '',
      appearance: '',
      personality: '',
      goal: '',
      coreFlaw: '',
      backstory: '',
      speechHabits: '',
      color: '#0284c7',
    });
  };

  const handleDeleteCharacter = (id: string) => {
    if (project.characters.length <= 1) {
      alert('ไม่สามารถลบตัวละครสุดท้ายได้');
      return;
    }
    if (!confirm('ยืนยันที่จะลบตัวละครนี้หรือไม่?')) return;
    const remaining = project.characters.filter(c => c.id !== id);
    onUpdateProject({
      ...project,
      characters: remaining,
      updatedAt: new Date().toISOString(),
    });
    setSelectedCharId(remaining[0].id);
  };

  // AI Brainstorming for this character
  const handleAIBrainstormTrait = async (type: 'flaw' | 'speech' | 'backstory') => {
    if (!selectedChar) return;
    setAiGenerating(true);
    setAiIdeaOutput(null);
    try {
      const typeDesc = {
        flaw: 'ช่วยคิด "ปมขัดแย้งในอดีตและข้อบกพร่องทางจิตใจ (Core Flaw)" ที่ลึกซึ้งและท้าทายศีลธรรมของตัวละครนี้',
        speech: 'ช่วยออกแบบ "สำเนียง สำนวนคำพูดประจำตัว และคำติดปาก" ให้มีเอกลักษณ์เฉพาะตัวและสะท้อนบุคลิกภาพ',
        backstory: 'ช่วยเขียน "เรื่องราวในอดีต (Backstory)" ที่เชื่อมโยงกับแก่นเรื่องและสร้างแรงขับเคลื่อนอันทรงพลัง',
      }[type];

      const prompt = `ตัวละคร: ${selectedChar.name} (${selectedChar.roleLabel})
บุคลิก: ${selectedChar.personality}
เป้าหมาย: ${selectedChar.goal}
บริบทเรื่อง: ${project.logline}

กรุณา${typeDesc} สำหรับนิยายเรื่องนี้ เสนอเป็น 2-3 แนวคิดที่น่าสนใจ คมคาย และนำไปใช้ได้ทันที`;

      const result = await requestAIAssist('expand', prompt);
      setAiIdeaOutput(result);
    } catch (err: any) {
      alert(`AI ขัดข้อง: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const charRelationships = project.relationships.filter(
    r => r.sourceId === selectedChar?.id || r.targetId === selectedChar?.id
  );

  return (
    <div className="flex-1 flex overflow-hidden bg-stone-900 text-stone-100 select-none">
      {/* Left Character Directory Sidebar */}
      <aside className="w-72 md:w-80 border-r border-stone-800 bg-stone-950/80 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider font-sans-thai">
              ทำเนียบตัวละคร ({project.characters.length})
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1 rounded-md text-amber-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            title="เพิ่มตัวละครใหม่"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {project.characters.map(char => {
            const isSelected = char.id === selectedCharId;
            return (
              <div
                key={char.id}
                onClick={() => {
                  setSelectedCharId(char.id);
                  setAiIdeaOutput(null);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-800/70 text-amber-100 shadow-sm'
                    : 'border-stone-800/50 bg-stone-900/40 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: char.color || '#0284c7' }}
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-stone-100 font-sans-thai">{char.name}</h4>
                      {char.alias && <p className="text-[11px] text-amber-400/80">{char.alias}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                    {char.roleLabel}
                  </span>
                </div>

                <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                  {char.personality}
                </p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Character Sheet */}
      {selectedChar ? (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Profile Card */}
            <div className="p-6 rounded-xl bg-stone-950/80 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md shrink-0"
                  style={{ backgroundColor: selectedChar.color || '#0284c7' }}
                >
                  {selectedChar.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl md:text-2xl font-bold font-serif-thai text-stone-100">
                      {selectedChar.name}
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-amber-300 font-medium">
                      {selectedChar.roleLabel}
                    </span>
                  </div>
                  {selectedChar.alias && (
                    <p className="text-sm text-amber-400/90 font-medium mt-0.5">
                      ฉายา / นามแฝง: {selectedChar.alias}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                    <span>อายุ: {selectedChar.age || 'ไม่ระบุ'}</span>
                    <span>·</span>
                    <span>เพศ: {selectedChar.gender || 'ไม่ระบุ'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteCharacter(selectedChar.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 rounded-lg border border-stone-800 hover:bg-stone-900 transition-colors"
                  title="ลบตัวละคร"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Assistant Ideas Panel */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-stone-950 border border-amber-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>ผู้ช่วย AI ระดมมิติของตัวละคร (Character Depth Brainstormer)</span>
                </div>
                {aiGenerating && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleAIBrainstormTrait('flaw')}
                  disabled={aiGenerating}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-900/40 text-stone-200 transition-colors"
                >
                  💡 ช่วยคิดปมในอดีต & จุดอ่อน (Flaws)
                </button>
                <button
                  onClick={() => handleAIBrainstormTrait('speech')}
                  disabled={aiGenerating}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-900/40 text-stone-200 transition-colors"
                >
                  🗣️ ช่วยคิดสำนวนคำพูด & คำติดปาก
                </button>
                <button
                  onClick={() => handleAIBrainstormTrait('backstory')}
                  disabled={aiGenerating}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-900/40 text-stone-200 transition-colors"
                >
                  📖 ช่วยเขียนประวัติเบื้องหลัง (Backstory)
                </button>
              </div>

              {aiIdeaOutput && (
                <div className="mt-3 p-3.5 bg-stone-950 rounded-lg border border-stone-800 text-xs text-stone-300 leading-relaxed font-sans-thai whitespace-pre-wrap">
                  {aiIdeaOutput}
                </div>
              )}
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Goals */}
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                <span className="font-semibold text-emerald-400 text-sm">เป้าหมายสูงสุด (Core Goal):</span>
                <textarea
                  value={selectedChar.goal}
                  onChange={(e) => handleUpdateCurrentChar({ goal: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                />
              </div>

              {/* Core Flaw */}
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                <span className="font-semibold text-rose-400 text-sm">ปมในใจ / ข้อบกพร่อง (Core Flaw):</span>
                <textarea
                  value={selectedChar.coreFlaw}
                  onChange={(e) => handleUpdateCurrentChar({ coreFlaw: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                />
              </div>

              {/* Personality */}
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                <span className="font-semibold text-amber-400 text-sm">อุปนิสัยและบุคลิกภาพ (Personality):</span>
                <textarea
                  value={selectedChar.personality}
                  onChange={(e) => handleUpdateCurrentChar({ personality: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                />
              </div>

              {/* Appearance */}
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                <span className="font-semibold text-sky-400 text-sm">รูปลักษณ์และการแต่งกาย (Appearance):</span>
                <textarea
                  value={selectedChar.appearance}
                  onChange={(e) => handleUpdateCurrentChar({ appearance: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
                />
              </div>
            </div>

            {/* Backstory & Speech Habits */}
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2 text-xs">
              <span className="font-semibold text-amber-400 text-sm">ประวัติความเป็นมาในอดีต (Backstory):</span>
              <textarea
                value={selectedChar.backstory}
                onChange={(e) => handleUpdateCurrentChar({ backstory: e.target.value })}
                rows={4}
                className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-3 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
              />
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2 text-xs">
              <span className="font-semibold text-purple-400 text-sm">เอกลักษณ์การพูดและสำนวนประจำตัว (Speech Habits):</span>
              <textarea
                value={selectedChar.speechHabits}
                onChange={(e) => handleUpdateCurrentChar({ speechHabits: e.target.value })}
                rows={2}
                placeholder="เช่น ใช้น้ำเสียงทุ้มต่ำ พูดสั้นกระชับ หรือมีคำสร้อยประจำตัว..."
                className="w-full bg-stone-900/70 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai leading-relaxed"
              />
            </div>

            {/* Associated Relationships */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm font-serif-thai text-stone-200">
                  ความสัมพันธ์กับตัวละครอื่น ({charRelationships.length})
                </h3>
                {onJumpToDiagram && (
                  <button
                    onClick={onJumpToDiagram}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>ดูภาพรวมบนแผนผัง</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {charRelationships.map(rel => {
                  const otherCharId = rel.sourceId === selectedChar.id ? rel.targetId : rel.sourceId;
                  const otherChar = project.characters.find(c => c.id === otherCharId);
                  return (
                    <div
                      key={rel.id}
                      onClick={() => otherChar && setSelectedCharId(otherChar.id)}
                      className="p-3 bg-stone-950/80 border border-stone-800 hover:border-amber-800/60 rounded-lg text-xs space-y-1 cursor-pointer transition-colors group"
                      title="คลิกเพื่อสลับไปดูข้อมูลตัวละครนี้"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-200 group-hover:text-amber-300 transition-colors">
                          {otherChar?.name || 'ตัวละคร'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          rel.sentiment === 'positive'
                            ? 'text-emerald-400 bg-emerald-950'
                            : rel.sentiment === 'negative'
                            ? 'text-rose-400 bg-rose-950'
                            : 'text-amber-400 bg-amber-950'
                        }`}>
                          {rel.relationType}
                        </span>
                      </div>
                      {rel.description && (
                        <p className="text-stone-400 text-[11px] leading-normal">{rel.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Notes Linked to This Character */}
            {(() => {
              const linkedNotes = (project.quickNotes || []).filter(n => n.characterIds?.includes(selectedChar.id));
              return (
                <div className="space-y-3 pt-3 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h3 className="font-semibold text-sm font-serif-thai text-stone-200">
                        โน้ตด่วน & ไอเดียที่โยงถึง {selectedChar.name} ({linkedNotes.length})
                      </h3>
                    </div>
                  </div>

                  {linkedNotes.length === 0 ? (
                    <div className="p-3.5 rounded-lg bg-stone-950/60 border border-stone-800/80 text-stone-400 text-xs">
                      ยังไม่มีโน้ตด่วนที่เชื่อมโยงกับตัวละครนี้ (คุณสามารถเปิดคลังโน้ตด่วนแล้วเลือกแท็กตัวละครนี้เพื่อบันทึกไอเดียได้ทันที)
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {linkedNotes.map(n => (
                        <div key={n.id} className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5 text-xs">
                          <p className="text-stone-200 font-sans-thai line-clamp-3 leading-relaxed">{n.content}</p>
                          <div className="flex items-center gap-1 text-[10px] text-stone-500 pt-1 border-t border-stone-800/60">
                            {n.tags?.map(t => (
                              <span key={t} className="px-1.5 py-0.2 rounded bg-stone-900 text-amber-300/80 border border-stone-800">
                                #{t}
                              </span>
                            ))}
                            <span className="ml-auto text-[9px] text-stone-600">
                              {new Date(n.createdAt).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-500 text-sm">
          เลือกตัวละครจากแถบด้านซ้ายเพื่อดูหรือแก้ไขข้อมูล
        </div>
      )}

      {/* Add Character Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-xl">
            <h3 className="font-semibold text-stone-100 font-serif-thai text-base">เพิ่มตัวละครใหม่</h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">ชื่อตัวละคร:*</label>
                  <input
                    type="text"
                    value={newChar.name}
                    onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                    placeholder="เช่น ไป๋ลี่หลิน"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">ฉายา / นามแฝง:</label>
                  <input
                    type="text"
                    value={newChar.alias}
                    onChange={(e) => setNewChar({ ...newChar, alias: e.target.value })}
                    placeholder="เช่น แม่ทัพเงา"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">บทบาท:</label>
                  <select
                    value={newChar.role}
                    onChange={(e) => {
                      const r = e.target.value as any;
                      const labels: any = {
                        protagonist: 'ตัวเอก / พระเอก-นางเอก',
                        deuteragonist: 'ตัวเอกร่วม',
                        antagonist: 'ตัวร้ายหลัก',
                        supporting: 'ตัวละครสมทบ',
                        mentor: 'อาจารย์ / ผู้ชี้แนะ',
                        comic_relief: 'ตัวสร้างสีสัน',
                      };
                      setNewChar({ ...newChar, role: r, roleLabel: labels[r] });
                    }}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-200 focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="protagonist">ตัวเอก (Protagonist)</option>
                    <option value="deuteragonist">ตัวเอกร่วม (Deuteragonist)</option>
                    <option value="antagonist">ตัวร้าย (Antagonist)</option>
                    <option value="supporting">ตัวละครสมทบ (Supporting)</option>
                    <option value="mentor">อาจารย์ (Mentor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">อายุ:</label>
                  <input
                    type="text"
                    value={newChar.age}
                    onChange={(e) => setNewChar({ ...newChar, age: e.target.value })}
                    placeholder="เช่น 24 ปี"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">เพศ:</label>
                  <input
                    type="text"
                    value={newChar.gender}
                    onChange={(e) => setNewChar({ ...newChar, gender: e.target.value })}
                    placeholder="ชาย / หญิง / อื่นๆ"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">บุคลิกและนิสัยคร่าวๆ:</label>
                <textarea
                  value={newChar.personality}
                  onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                  placeholder="เช่น สุขุม ช่างสังเกต ปากร้ายใจดี..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">เป้าหมายหลัก:</label>
                <input
                  type="text"
                  value={newChar.goal}
                  onChange={(e) => setNewChar({ ...newChar, goal: e.target.value })}
                  placeholder="เช่น ล้างมลทินให้ตระกูล, กอบกู้แผ่นดิน"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
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
                onClick={handleAddCharacter}
                disabled={!newChar.name?.trim()}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                สร้างตัวละคร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
