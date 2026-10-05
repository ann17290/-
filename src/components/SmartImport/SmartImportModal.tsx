import React, { useState } from 'react';
import { 
  NovelProject, 
  Character, 
  SettingLocation, 
  StoryBeat, 
  Chapter, 
  DiagramNode, 
  DiagramEdge,
  CharacterRelationship 
} from '../../types/novel';
import { requestAIAssist } from '../../services/aiService';
import { 
  Upload, 
  Sparkles, 
  X, 
  Check, 
  FileText, 
  Loader2, 
  Network, 
  Users, 
  Compass, 
  BookOpen, 
  Layers, 
  ArrowRight,
  FolderInput,
  Wand2,
  Copy
} from 'lucide-react';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: NovelProject;
  onApplyImport: (newProject: NovelProject) => void;
}

export const SmartImportModal: React.FC<SmartImportModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onApplyImport,
}) => {
  const [importText, setImportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'characters' | 'locations' | 'chapters' | 'diagram'>('overview');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  if (!isOpen) return null;

  // Sample quick templates for instant demo
  const samplePrompts = [
    {
      title: 'นิยายแฟนตาซีเวทมนตร์ & สืบสวน',
      desc: 'เรื่องราวของอัศวินสาวและจอมเวทนอกรีต',
      content: `ชื่อเรื่อง: สุสานมนตราแห่งนครไร้เงา (Necro-Arcana)
เรื่องย่อ: ในนครลอยฟ้า "แอรอนเดล" มหาเวทแห่งสภาถูกลอบสังหารด้วยศาสตร์มืดที่สาบสูญไปพันปี "เรเวีย" หัวหน้ากองอัศวินเหยี่ยวเงินจึงจำต้องร่วมมือกับ "ไคเลอร์" จอมเวทนอกรีตผู้ต้องขังแดนประหาร เพื่อสืบหาเบื้องหลังก่อนที่ศิลาผนึกดวงวิญญาณจะแตกสลาย
ตัวละคร:
1. เรเวีย วาเลนไทน์: หัวหน้าอัศวินหญิง สุขุม เที่ยงธรรม จุดอ่อนคือยึดติดกับกฎระเบียบจนมองข้ามความจริง
2. ไคเลอร์ ซิลเวอร์แฮนด์: จอมเวทหนุ่มผู้ถูกเนรเทศ เจ้าเล่ห์ ปากร้ายแต่รักความยุติธรรม เชี่ยวชาญมนตร์ดำ
3. มาลาคอร์: ลอร์ดแห่งสภาสูง ตัวร้ายผู้วางแผนชิงศิลาเวท
สถานที่:
- นครลอยฟ้าแอรอนเดล: เมืองหินอ่อนสีขาวโพลนลอยอยู่เหนือเมฆ
- คุกใต้พิภพโอเบลิสก์: คุกคุมขังจอมเวทมืด เย็นยะเยือกและไร้แสงแดด
- ซากวิหารมนตราโบราณ: โบราณสถานกลางป่าหมอก
โครงเรื่อง:
- บทที่ ๑: คดีลอบสังหารในวิหารแก้ว (เรเวียพบศพและหลักฐานมนตร์มืด)
- บทที่ ๒: สัญญาเลือดในคุกศิลา (เรเวียไปยื่นข้อตกลงกับไคเลอร์)
- บทที่ ๓: ลายแทงแห่งความมืด (ทั้งสองแกะรอยพ่อค้ามนตร์ดำกลางตลาดมืด)`
    },
    {
      title: 'นิยายรักโรแมนติก & ธุรกิจสืบสวน',
      desc: 'ความรักและความขัดแย้งของทายาทสองตระกูล',
      content: `ชื่อเรื่อง: เล่ห์รักร้อยกล (Veil of Deceit)
เรื่องย่อ: "นรินทร์" ประธานหนุ่มแห่งเครือธุรกิจอสังหาริมทรัพย์ระดับประเทศ จับได้ว่ามีหนอนบ่อนไส้ขโมยข้อมูลลับของตระกูล จึงจ้าง "พิมดาว" นักตรวจสอบบัญชีและนักสืบเอกชนสาวผู้ชาญฉลาดเข้ามาช่วยสืบ ทว่ายิ่งสืบลึกกลับพบว่าตระกูลของทั้งคู่มีความแค้นฝังลึกในอดีตร่วมกัน
ตัวละคร:
1. นรินทร์ (พระเอก): ประธานหนุ่มสุขุม เยือกเย็น ระแวงคนง่าย
2. พิมดาว (นางเอก): นักสืบและผู้ตรวจสอบบัญชี เฉลียวฉลาด ตรงไปตรงมา จุดอ่อนคือเชื่อใจคนในครอบครัวเกินไป
3. ภควัต: ผู้จัดการฝ่ายการเงิน ตัวร้ายผู้คอร์รัปชัน
สถานที่:
- ตึกระฟ้าเกรซทาวเวอร์: สภาพแวดล้อมสำนักงานหรูหรากระจกใสใจกลางกรุงเทพฯ
- คฤหาสน์รัตนกิจ: บ้านพักตระกูลเก่าแก่ที่เก็บงำความลับ
โครงเรื่อง:
- บทที่ ๑: ตัวเลขที่หายไป (พิมดาวพบความผิดปกติในงบการเงิน)
- บทที่ ๒: การจ้างวานลับ (นรินทร์เรียกพิมดาวมาตกลงสัญญา)
- บทที่ ๓: แฟ้มคดีหมายเลขศูนย์ (การค้นพบความลับการตายของรุ่นพ่อ)`
    }
  ];

  // AI Parse and Link
  const handleAnalyzeAndDissect = async () => {
    if (!importText.trim()) {
      alert('กรุณาใส่ข้อความหรือเลือกตัวอย่างที่ต้องการนำเข้า');
      return;
    }

    setIsLoading(true);
    setParsedData(null);

    try {
      const jsonStr = await requestAIAssist('parse_and_link', importText);
      // Clean up markdown if any
      const cleaned = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setParsedData(parsed);
    } catch (err: any) {
      console.error('Failed to parse:', err);
      alert(`การประมวลผลแยกข้อมูลขัดข้อง: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert parsed data into fully linked NovelProject
  const handleApplyToProject = () => {
    if (!parsedData) return;

    // 1. Process Characters with IDs
    const newCharacters: Character[] = (parsedData.characters || []).map((c: any, idx: number) => ({
      id: `char-imp-${Date.now()}-${idx}`,
      name: c.name || `ตัวละคร ${idx + 1}`,
      alias: c.alias || '',
      role: c.role || 'supporting',
      roleLabel: c.roleLabel || 'ตัวละคร',
      age: c.age || '',
      gender: c.gender || '',
      appearance: c.appearance || '',
      personality: c.personality || '',
      goal: c.goal || '',
      coreFlaw: c.coreFlaw || '',
      backstory: c.backstory || '',
      speechHabits: c.speechHabits || '',
      color: c.color || ['#0284c7', '#b91c1c', '#475569', '#15803d', '#d97706'][idx % 5],
      avatarIcon: 'Sparkles',
    }));

    // 2. Process Locations with IDs
    const newLocations: SettingLocation[] = (parsedData.locations || []).map((l: any, idx: number) => ({
      id: `loc-imp-${Date.now()}-${idx}`,
      name: l.name || `สถานที่ ${idx + 1}`,
      type: l.type || 'สถานที่ทั่วไป',
      atmosphere: l.atmosphere || '',
      visualSensory: l.visualSensory || '',
      audioSensory: l.audioSensory || '',
      scentSensory: l.scentSensory || '',
      tactileSensory: l.tactileSensory || '',
      historyLore: l.historyLore || '',
      rulesOrMagic: l.rulesOrMagic || '',
    }));

    // 3. Process Chapters and auto-link POV character and Location
    const newChapters: Chapter[] = (parsedData.chapters || []).map((ch: any, idx: number) => {
      // Find matching character ID
      const matchingChar = newCharacters.find(c => 
        ch.povCharacterName && (c.name.includes(ch.povCharacterName) || ch.povCharacterName.includes(c.name))
      );
      // Find matching location ID
      const matchingLoc = newLocations.find(l => 
        ch.locationName && (l.name.includes(ch.locationName) || ch.locationName.includes(l.name))
      );

      return {
        id: `ch-imp-${Date.now()}-${idx}`,
        title: ch.title || `บทที่ ${idx + 1}`,
        order: idx + 1,
        content: ch.content || `${ch.title}\n\n${ch.summary || 'เริ่มต้นเขียนเนื้อหาบทนี้...'}\n`,
        summary: ch.summary || '',
        povCharacterId: matchingChar?.id,
        locationId: matchingLoc?.id,
        targetWords: 3000,
        status: 'draft',
      };
    });

    // 4. Process Story Beats
    const newStoryBeats: StoryBeat[] = (parsedData.storyBeats || []).map((b: any, idx: number) => ({
      id: `beat-imp-${Date.now()}-${idx}`,
      act: b.act || (idx === 0 ? 'Act 1' : idx === 1 ? 'Act 2' : 'Act 3'),
      title: b.title || `เหตุการณ์สำคัญ ${idx + 1}`,
      timing: b.timing || '',
      description: b.description || '',
      completed: false,
    }));

    // 5. Generate Diagram Nodes with Positions
    const newNodes: DiagramNode[] = newCharacters.map((c, idx) => ({
      id: `node-${c.id}`,
      title: c.name,
      type: 'character',
      characterId: c.id,
      x: 180 + (idx % 3) * 260,
      y: 140 + Math.floor(idx / 3) * 180,
      color: c.color,
      description: c.roleLabel,
    }));

    // 6. Generate Relationships & Edges
    const newRelationships: CharacterRelationship[] = [];
    const newEdges: DiagramEdge[] = [];

    (parsedData.relationships || []).forEach((rel: any, idx: number) => {
      const srcChar = newCharacters.find(c => 
        rel.sourceName && (c.name.includes(rel.sourceName) || rel.sourceName.includes(c.name))
      );
      const tgtChar = newCharacters.find(c => 
        rel.targetName && (c.name.includes(rel.targetName) || rel.targetName.includes(c.name))
      );

      if (srcChar && tgtChar) {
        const relId = `rel-imp-${Date.now()}-${idx}`;
        newRelationships.push({
          id: relId,
          sourceId: srcChar.id,
          targetId: tgtChar.id,
          relationType: rel.relationType || 'ความสัมพันธ์',
          sentiment: rel.sentiment || 'complex',
        });

        newEdges.push({
          id: `edge-${relId}`,
          from: `node-${srcChar.id}`,
          to: `node-${tgtChar.id}`,
          label: rel.relationType || 'สัมพันธ์',
          sentiment: rel.sentiment || 'complex',
        });
      }
    });

    // Final Project Assemble
    const assembledProject: NovelProject = {
      id: importMode === 'replace' ? `project-${Date.now()}` : currentProject.id,
      title: parsedData.title || (importMode === 'replace' ? 'นิยายเรื่องใหม่' : currentProject.title),
      author: currentProject.author || 'นักเขียน',
      genre: parsedData.genre || currentProject.genre,
      logline: parsedData.logline || currentProject.logline,
      synopsis: parsedData.synopsis || currentProject.synopsis,
      theme: parsedData.theme || currentProject.theme,
      tone: parsedData.tone || currentProject.tone,
      chapters: importMode === 'replace' ? newChapters : [...currentProject.chapters, ...newChapters],
      characters: importMode === 'replace' ? newCharacters : [...currentProject.characters, ...newCharacters],
      relationships: importMode === 'replace' ? newRelationships : [...currentProject.relationships, ...newRelationships],
      locations: importMode === 'replace' ? newLocations : [...currentProject.locations, ...newLocations],
      storyBeats: importMode === 'replace' ? newStoryBeats : [...currentProject.storyBeats, ...newStoryBeats],
      diagramNodes: importMode === 'replace' ? newNodes : [...currentProject.diagramNodes, ...newNodes],
      diagramEdges: importMode === 'replace' ? newEdges : [...currentProject.diagramEdges, ...newEdges],
      typesettingConfig: currentProject.typesettingConfig,
      updatedAt: new Date().toISOString(),
    };

    onApplyImport(assembledProject);
    alert('นำเข้าและเชื่อมโยงข้อมูลสู่ทุกหมวดหมู่สำเร็จเรียบร้อยแล้ว!');
    onClose();
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-100 font-serif-thai text-base">
                นำเข้าข้อมูลและโยงความสัมพันธ์สู่ทุกหัวข้ออัตโนมัติ (Smart Auto-Linker)
              </h2>
              <p className="text-xs text-stone-400">
                วางโครงเรื่องย่อ บันทึกตัวละคร หรือฉบับร่าง แล้วให้ AI แยกเป็นบท ตัวละคร ฉาก และแผนผังทันที
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-800 p-5 gap-5 overflow-y-auto">
          {/* Left: Input Text & Presets */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300">ใส่ข้อความหรืออัปโหลดไฟล์:</span>
              <label className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>อัปโหลด .txt / .md</span>
                <input type="file" accept=".txt,.md,.text" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="วางโครงเรื่อง เรื่องย่อ บันทึกตัวละคร หรือเนื้อหาบทที่ต้องการให้ AI วิเคราะห์แยกย่อยและเชื่อมโยงสู่ทุกหัวข้อ..."
              rows={12}
              className="w-full flex-1 p-3.5 bg-stone-950/90 border border-stone-800 rounded-xl text-stone-200 text-xs md:text-sm font-sans-thai leading-relaxed focus:outline-none focus:border-amber-400 resize-none shadow-inner"
            />

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-500 font-medium">หรือเลือกโครงเรื่องตัวอย่างเพื่อทดสอบ:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {samplePrompts.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImportText(tmpl.content)}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-800/80 text-left transition-colors"
                  >
                    <div className="font-semibold text-stone-200 truncate">{tmpl.title}</div>
                    <div className="text-[10px] text-stone-500 truncate">{tmpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyzeAndDissect}
              disabled={isLoading || !importText.trim()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI กำลังวิเคราะห์แยกหมวดหมู่และเชื่อมโยง...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>วิเคราะห์แยกย่อย & โยงหัวข้อ (Auto-Dissect)</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Parsed Preview Breakdown */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-amber-400" />
                ผลการแยกย่อยและเชื่อมโยงโครงเรื่อง
              </span>

              {parsedData && (
                <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                  ตรวจพบครบถ้วน
                </span>
              )}
            </div>

            {parsedData ? (
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                {/* Preview Category Tabs */}
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setPreviewTab('overview')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'overview' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    ภาพรวมเรื่อง
                  </button>
                  <button
                    onClick={() => setPreviewTab('characters')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'characters' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    ตัวละคร ({parsedData.characters?.length || 0})
                  </button>
                  <button
                    onClick={() => setPreviewTab('locations')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'locations' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    ฉาก ({parsedData.locations?.length || 0})
                  </button>
                  <button
                    onClick={() => setPreviewTab('chapters')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'chapters' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    บท & พล็อต ({parsedData.chapters?.length || 0})
                  </button>
                  <button
                    onClick={() => setPreviewTab('diagram')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'diagram' ? 'bg-stone-800 text-amber-300 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    แผนผัง ({parsedData.relationships?.length || 0} เส้น)
                  </button>
                </div>

                {/* Tab Content Box */}
                <div className="flex-1 p-3.5 bg-stone-950/90 border border-stone-800 rounded-xl overflow-y-auto text-xs space-y-3 font-sans-thai">
                  {previewTab === 'overview' && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-stone-500">ชื่อเรื่อง:</span>
                        <div className="font-bold text-sm text-stone-100 font-serif-thai">{parsedData.title}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">แนวเรื่อง:</span>
                        <div className="text-amber-400">{parsedData.genre}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">ล็อกไลน์ (Logline):</span>
                        <p className="text-stone-300 leading-relaxed italic">"{parsedData.logline}"</p>
                      </div>
                      <div>
                        <span className="text-stone-500">แก่นเรื่อง (Theme):</span>
                        <p className="text-stone-300">{parsedData.theme}</p>
                      </div>
                    </div>
                  )}

                  {previewTab === 'characters' && (
                    <div className="space-y-2">
                      {parsedData.characters?.map((c: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-200">{c.name} {c.alias && `(${c.alias})`}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">{c.roleLabel}</span>
                          </div>
                          <p className="text-[11px] text-stone-400">{c.personality}</p>
                          <div className="text-[10px] text-emerald-400">เป้าหมาย: {c.goal}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {previewTab === 'locations' && (
                    <div className="space-y-2">
                      {parsedData.locations?.map((l: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-200">{l.name}</span>
                            <span className="text-[10px] text-stone-500">{l.type}</span>
                          </div>
                          <p className="text-[11px] text-stone-300 italic">{l.atmosphere}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {previewTab === 'chapters' && (
                    <div className="space-y-2">
                      {parsedData.chapters?.map((ch: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                          <div className="font-semibold text-stone-200">{ch.title}</div>
                          <p className="text-[11px] text-stone-400">{ch.summary}</p>
                          <div className="flex gap-2 text-[10px] text-amber-400 pt-1">
                            {ch.povCharacterName && <span>🔗 POV: {ch.povCharacterName}</span>}
                            {ch.locationName && <span>🔗 ฉาก: {ch.locationName}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {previewTab === 'diagram' && (
                    <div className="space-y-2">
                      <div className="text-stone-400 text-[11px] mb-2">
                        ระบบจะวางโหนดและสร้างเส้นเชื่อมโยงบนผืนผ้าใบให้อัตโนมัติ:
                      </div>
                      {parsedData.relationships?.map((r: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-stone-900 border border-stone-800 flex items-center justify-between text-xs">
                          <span className="text-stone-200">{r.sourceName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                            → {r.relationType} →
                          </span>
                          <span className="text-stone-200">{r.targetName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Import Mode Options */}
                <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-amber-500"
                      />
                      <span>สร้างเป็นโปรเจกต์ใหม่</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-amber-500"
                      />
                      <span>ผสานเข้ากับเรื่องปัจจุบัน</span>
                    </label>
                  </div>

                  <button
                    onClick={handleApplyToProject}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg shadow-md transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>นำเข้าและเชื่อมโยงสู่ระบบ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-stone-950/50 border border-dashed border-stone-800 rounded-xl text-stone-500 text-xs space-y-2">
                <Wand2 className="w-8 h-8 text-stone-700" />
                <p>ใส่เนื้อหาทางด้านซ้ายแล้วกดปุ่ม "วิเคราะห์แยกย่อย & โยงหัวข้อ"</p>
                <p className="text-[11px] text-stone-600">
                  ระบบจะสกัดชื่อเรื่อง, บท, ตัวละคร, ฉาก, และโยงแผนผังความสัมพันธ์ให้โดยอัตโนมัติ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
