import React, { useState } from 'react';
import { NovelProject } from '../../types/novel';
import { 
  Sparkles, 
  Wand2, 
  Plus, 
  Compass, 
  MessageSquare, 
  ArrowRight, 
  Copy, 
  Check, 
  Loader2, 
  Dices,
  PenTool
} from 'lucide-react';
import { requestAIAssist } from '../../services/aiService';

interface AIToolsViewProps {
  project: NovelProject;
  onSendToChapter: (chapterId: string, text: string) => void;
}

export const AIToolsView: React.FC<AIToolsViewProps> = ({
  project,
  onSendToChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'polish' | 'expand' | 'describe' | 'dialogue' | 'brainstorm'>('polish');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Options
  const [polishStyle, setPolishStyle] = useState<'elegant' | 'crisp' | 'emotional' | 'historical' | 'modern'>('elegant');
  const [expandFocus, setExpandFocus] = useState<'depth' | 'sensory' | 'action' | 'tension'>('sensory');
  const [selectedChapterId, setSelectedChapterId] = useState(project.chapters[0]?.id || '');
  const [brainstormCategory, setBrainstormCategory] = useState<'name' | 'twist' | 'climax'>('name');

  const handleRunAI = async () => {
    setIsLoading(true);
    setOutputText('');

    try {
      let result = '';
      if (activeTab === 'polish') {
        result = await requestAIAssist('polish', inputText, undefined, { style: polishStyle });
      } else if (activeTab === 'expand') {
        result = await requestAIAssist('expand', inputText, { treatment: project.logline }, { focus: expandFocus });
      } else if (activeTab === 'describe') {
        result = await requestAIAssist('describe_scene', inputText, { treatment: project.logline });
      } else if (activeTab === 'dialogue') {
        result = await requestAIAssist('dialogue', inputText, {
          characters: project.characters.map(c => `${c.name}: ${c.personality}`).join('; '),
        });
      } else if (activeTab === 'brainstorm') {
        const prompt = {
          name: `กรุณาสุ่ม "ชื่อตัวละครและฉายา" สำหรับนิยายแนว: ${project.genre} จำนวน 10 ชื่อ ทั้งชาย หญิง และชื่อตำแหน่ง พร้อมบอกความหมายอันไพเราะและบุคลิกที่เหมาะกับชื่อ`,
          twist: `กรุณาเสนอ "จุดหักมุม (Plot Twists) ชวนสะพรึงและบีบอารมณ์" จำนวน 5 ข้อ สำหรับนิยายเรื่อง "${project.title}" (เรื่องย่อ: ${project.logline})`,
          climax: `กรุณาออกแบบ "ฉากไคลแมกซ์เผชิญหน้าจุดสูงสุด" สำหรับนิยายเรื่อง "${project.title}" ที่ดึงจุดเด่นของตัวเอกและตัวร้ายมาปะทะกันอย่างดุเดือดและน่าจดจำ`,
        }[brainstormCategory];

        result = await requestAIAssist('expand', prompt);
      }
      setOutputText(result);
    } catch (err: any) {
      alert(`AI ขัดข้อง: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-900 text-stone-100 select-none">
      {/* Top Header Banner */}
      <div className="p-4 md:p-6 border-b border-stone-800 bg-stone-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>สตูดิโอผู้ช่วยนักเขียน AI (AI Novelist Lab)</span>
          </div>
          <h1 className="text-xl font-bold font-serif-thai text-stone-100 mt-1">
            เกลาสำนวน เพิ่มเนื้อหา & คลังจุดประกายวรรณศิลป์
          </h1>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('polish')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'polish' ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>เกลาสำนวน</span>
          </button>

          <button
            onClick={() => setActiveTab('expand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'expand' ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มเนื้อหา / ขยายความ</span>
          </button>

          <button
            onClick={() => setActiveTab('describe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'describe' ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>บรรยายฉาก</span>
          </button>

          <button
            onClick={() => setActiveTab('dialogue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'dialogue' ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>แต่งบทสนทนา</span>
          </button>

          <button
            onClick={() => setActiveTab('brainstorm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'brainstorm' ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>สุ่มไอเดีย & ชื่อตัวละคร</span>
          </button>
        </div>
      </div>

      {/* Main Split Workbench */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-800 p-4 md:p-6 gap-6 overflow-hidden">
        {/* Left Input & Parameters */}
        <div className="flex flex-col h-full space-y-4 overflow-y-auto">
          {/* Controls Bar */}
          <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-3 text-xs">
            {activeTab === 'polish' && (
              <div>
                <label className="block text-stone-400 mb-1.5 font-medium">เลือกสไตล์วรรณศิลป์:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'elegant', label: 'วรรณศิลป์สละสลวย' },
                    { id: 'crisp', label: 'กระชับ ฉับไว คมคาย' },
                    { id: 'emotional', label: 'ดราม่าอารมณ์เข้มข้น' },
                    { id: 'historical', label: 'สำนวนย้อนยุค/โบราณ' },
                    { id: 'modern', label: 'ร่วมสมัยเป็นธรรมชาติ' },
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setPolishStyle(st.id as any)}
                      className={`p-2 rounded-lg text-left text-xs transition-colors border ${
                        polishStyle === st.id
                          ? 'bg-amber-950/50 border-amber-800 text-amber-200 font-medium'
                          : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'expand' && (
              <div>
                <label className="block text-stone-400 mb-1.5 font-medium">จุดที่ต้องการเน้นขยายความ:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sensory', label: 'ประสาทสัมผัสทั้งห้า (แสง กลิ่น เสียง)' },
                    { id: 'depth', label: 'ความรู้สึกลึกซึ้งในใจตัวละคร' },
                    { id: 'action', label: 'ท่าทาง กิริยา และการเคลื่อนไหว' },
                    { id: 'tension', label: 'ความตึงเครียดและเงื่อนงำ' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setExpandFocus(f.id as any)}
                      className={`p-2 rounded-lg text-left text-xs transition-colors border ${
                        expandFocus === f.id
                          ? 'bg-amber-950/50 border-amber-800 text-amber-200 font-medium'
                          : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'brainstorm' && (
              <div>
                <label className="block text-stone-400 mb-1.5 font-medium">เลือกหมวดหมู่ไอเดีย:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBrainstormCategory('name')}
                    className={`p-2 rounded-lg text-xs transition-colors border ${
                      brainstormCategory === 'name' ? 'bg-amber-950/50 border-amber-800 text-amber-200 font-medium' : 'border-stone-800 text-stone-400'
                    }`}
                  >
                    สุ่มชื่อตัวละคร
                  </button>
                  <button
                    onClick={() => setBrainstormCategory('twist')}
                    className={`p-2 rounded-lg text-xs transition-colors border ${
                      brainstormCategory === 'twist' ? 'bg-amber-950/50 border-amber-800 text-amber-200 font-medium' : 'border-stone-800 text-stone-400'
                    }`}
                  >
                    สุ่มจุดหักมุม (Plot Twist)
                  </button>
                  <button
                    onClick={() => setBrainstormCategory('climax')}
                    className={`p-2 rounded-lg text-xs transition-colors border ${
                      brainstormCategory === 'climax' ? 'bg-amber-950/50 border-amber-800 text-amber-200 font-medium' : 'border-stone-800 text-stone-400'
                    }`}
                  >
                    ออกแบบฉากไคลแมกซ์
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="flex-1 flex flex-col space-y-2">
            <span className="text-xs font-semibold text-stone-300">
              {activeTab === 'brainstorm'
                ? 'คำขอเพิ่มเติม (ไม่จำเป็นต้องระบุ):'
                : activeTab === 'describe'
                ? 'ชื่อสถานที่หรือข้อมูลฉากคร่าวๆ:'
                : activeTab === 'dialogue'
                ? 'สถานการณ์หรือตัวละครที่กำลังคุยกัน:'
                : 'ข้อความต้นฉบับ:'}
            </span>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeTab === 'polish'
                  ? 'วางย่อหน้าหรือประโยคที่ต้องการเกลาให้สละสลวย...'
                  : activeTab === 'expand'
                  ? 'วางฉากที่ต้องการให้ AI ขยายความ ดึงประสาทสัมผัส หรือเพิ่มอารมณ์...'
                  : activeTab === 'describe'
                  ? 'ใส่สถานที่ เช่น "เรือนแพริมน้ำยามโพล้เพล้ที่มีฝนตกพรำๆ" ...'
                  : activeTab === 'dialogue'
                  ? 'ระบุคู่สนทนาและสถานการณ์ เช่น "พระเอกจับได้ว่านางเอกแอบขโมยยาพิษไปซ่อน"...'
                  : 'ระบุคำขอเพิ่มเติม เช่น "ต้องการชื่อจีนโบราณที่มีความหมายเกี่ยวกับดอกไม้หรือดวงจันทร์"...'
              }
              rows={12}
              className="w-full flex-1 p-3.5 bg-stone-950/90 border border-stone-800 rounded-xl text-stone-200 text-xs md:text-sm font-sans-thai leading-relaxed focus:outline-none focus:border-amber-400 resize-none shadow-inner"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunAI}
              disabled={isLoading || (!inputText.trim() && activeTab !== 'brainstorm')}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI กำลังรังสรรค์...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ประมวลผลด้วย AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="flex flex-col h-full space-y-4 overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ผลงานวรรณศิลป์ที่รังสรรค์เสร็จสมบูรณ์
            </span>

            {outputText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1 bg-stone-800 rounded-md border border-stone-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 bg-stone-950/90 border border-stone-800 rounded-xl overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-stone-400">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-xs">กำลังคัดสรรถ้อยคำอันไพเราะและเปี่ยมวรรณศิลป์...</p>
              </div>
            ) : outputText ? (
              <div className="text-stone-200 text-xs md:text-sm font-sans-thai leading-relaxed whitespace-pre-wrap">
                {outputText}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 text-xs space-y-2">
                <Wand2 className="w-8 h-8 text-stone-700" />
                <p>เลือกเครื่องมือและใส่ข้อมูลทางด้านซ้ายเพื่อเริ่มรังสรรค์</p>
              </div>
            )}
          </div>

          {/* Quick Insert to Chapter footer */}
          {outputText && (
            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-400">ส่งต่อผลลัพธ์นี้ไปยัง:</span>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="bg-stone-800 border border-stone-700 text-stone-200 rounded px-2.5 py-1 text-xs focus:outline-none"
                >
                  {project.chapters.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => onSendToChapter(selectedChapterId, outputText)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-medium transition-colors"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>แทรกต่อท้ายบทนี้</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
