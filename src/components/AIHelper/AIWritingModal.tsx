import React, { useState } from 'react';
import { NovelProject } from '../../types/novel';
import { 
  Sparkles, 
  X, 
  Loader2, 
  Check, 
  Copy, 
  Plus, 
  RefreshCw,
  Wand2,
  FileText,
  MessageSquare,
  Compass,
  ArrowRight
} from 'lucide-react';
import { requestAIAssist, AIOptions } from '../../services/aiService';

interface AIWritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  project: NovelProject;
  currentChapterId: string;
  onApplyText: (newText: string, mode: 'replace' | 'append') => void;
}

export type AIToolMode = 'polish' | 'expand' | 'describe_scene' | 'continue' | 'dialogue';

export const AIWritingModal: React.FC<AIWritingModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  project,
  currentChapterId,
  onApplyText,
}) => {
  const [mode, setMode] = useState<AIToolMode>('polish');
  const [inputText, setInputText] = useState(selectedText);
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Options
  const [polishStyle, setPolishStyle] = useState<'elegant' | 'crisp' | 'emotional' | 'historical' | 'modern'>('elegant');
  const [expandFocus, setExpandFocus] = useState<'depth' | 'sensory' | 'action' | 'tension'>('sensory');
  const [continueDirection, setContinueDirection] = useState('');
  const [dialogueConflict, setDialogueConflict] = useState('มีความลับและแรงกดดันทางอารมณ์ซ่อนเร้น');

  React.useEffect(() => {
    if (selectedText) {
      setInputText(selectedText);
    }
  }, [selectedText]);

  if (!isOpen) return null;

  const currentChapter = project.chapters.find(c => c.id === currentChapterId);

  const handleGenerate = async () => {
    if (!inputText.trim() && mode !== 'continue') {
      setError('กรุณาใส่ข้อความต้นฉบับหรือเลือกข้อความที่ต้องการดำเนินการ');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      // Build context
      const charSummary = project.characters.map(c => `${c.name} (${c.roleLabel}): ${c.personality}`).join('; ');
      const loc = project.locations.find(l => l.id === currentChapter?.locationId);
      const locSummary = loc ? `${loc.name} (${loc.atmosphere})` : 'ไม่ระบุ';

      const options: AIOptions = {
        style: polishStyle,
        focus: expandFocus,
        direction: continueDirection,
        conflict: dialogueConflict,
      };

      const result = await requestAIAssist(
        mode,
        inputText || currentChapter?.content?.slice(-1000) || '',
        {
          treatment: currentChapter?.summary || project.logline,
          characters: charSummary,
          scene: locSummary,
        },
        options
      );

      setOutputText(result);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผล AI');
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-100 font-serif-thai text-base">ผู้ช่วยนักเขียนอัจฉริยะ (AI Writing Co-pilot)</h2>
              <p className="text-xs text-stone-400">เกลาสำนวน เพิ่มเนื้อหา บรรยายฉาก และเขียนต่ออย่างกลมกลืน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-stone-800/80 bg-stone-950/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setMode('polish')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'polish'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>เกลาสำนวน</span>
          </button>

          <button
            onClick={() => setMode('expand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'expand'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มเนื้อหา / ขยายความ</span>
          </button>

          <button
            onClick={() => setMode('describe_scene')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'describe_scene'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>บรรยายฉาก & ประสาทสัมผัส</span>
          </button>

          <button
            onClick={() => setMode('continue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'continue'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>เขียนต่อจากจุดนี้</span>
          </button>

          <button
            onClick={() => setMode('dialogue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'dialogue'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>แต่งบทสนทนา</span>
          </button>
        </div>

        {/* Dynamic Controls based on selected mode */}
        <div className="px-5 py-2.5 bg-stone-950/20 border-b border-stone-800/60 flex flex-wrap items-center gap-3 text-xs">
          {mode === 'polish' && (
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">สไตล์สำนวน:</span>
              <select
                value={polishStyle}
                onChange={(e) => setPolishStyle(e.target.value as any)}
                className="bg-stone-800 border border-stone-700 text-stone-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="elegant">วรรณศิลป์สละสลวย (ภาพพจน์ คล้องจอง ไพเราะ)</option>
                <option value="crisp">กระชับ ฉับไว คมคาย (ตัดคำฟุ่มเฟือย)</option>
                <option value="emotional">ดราม่าเข้มข้น (บีบคั้น ถ่ายทอดมิติภายใน)</option>
                <option value="historical">ย้อนยุค/พีเรียด/กำลังภายใน (สำนวนโบราณสง่างาม)</option>
                <option value="modern">ร่วมสมัย เป็นธรรมชาติ (ลื่นไหล บทสนทนาสมจริง)</option>
              </select>
            </div>
          )}

          {mode === 'expand' && (
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">จุดที่เน้นขยาย:</span>
              <select
                value={expandFocus}
                onChange={(e) => setExpandFocus(e.target.value as any)}
                className="bg-stone-800 border border-stone-700 text-stone-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="sensory">ประสาทสัมผัสทั้งห้า (แสง เสียง กลิ่น อุณหภูมิ)</option>
                <option value="depth">ความนึกคิดและจิตใจตัวละคร (Internal Monologue)</option>
                <option value="action">ท่าทาง อากัปกิริยา และการเคลื่อนไหว</option>
                <option value="tension">ความตึงเครียด ความหวาดระแวง และปมปริศนา</option>
              </select>
            </div>
          )}

          {mode === 'continue' && (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-400 font-medium whitespace-nowrap">ทิศทางที่ต้องการ:</span>
              <input
                type="text"
                value={continueDirection}
                onChange={(e) => setContinueDirection(e.target.value)}
                placeholder="เช่น เผชิญหน้ากับศัตรู, เผยความลับในใจ, มีคนแอบฟังอยู่..."
                className="flex-1 bg-stone-800 border border-stone-700 text-stone-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {mode === 'dialogue' && (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-400 font-medium whitespace-nowrap">อารมณ์/ความขัดแย้ง:</span>
              <input
                type="text"
                value={dialogueConflict}
                onChange={(e) => setDialogueConflict(e.target.value)}
                placeholder="เช่น ปิดบังความจริง, ประชดประชัน, สารภาพรักแต่ติดพันธะ..."
                className="flex-1 bg-stone-800 border border-stone-700 text-stone-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Body Split Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-800 p-5 gap-5 overflow-y-auto">
          {/* Input Panel */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-medium text-stone-300">
                {mode === 'continue' ? 'ข้อความหรือฉากนำทางก่อนหน้า:' : 'ข้อความต้นฉบับ:'}
              </span>
              <button
                onClick={() => setInputText('')}
                className="text-stone-500 hover:text-stone-300 text-[11px]"
              >
                ล้างข้อความ
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'continue'
                  ? 'ใส่ประโยคหรือย่อหน้าล่าสุดที่ต้องการให้ AI เขียนต่อ...'
                  : mode === 'describe_scene'
                  ? 'ใส่ชื่อสถานที่หรือบรรยากาศคร่าวๆ ที่ต้องการให้ AI รังสรรค์คำบรรยาย...'
                  : 'วางข้อความที่ต้องการเกลาสำนวนหรือเพิ่มเนื้อหา...'
              }
              rows={12}
              className="w-full flex-1 p-3 bg-stone-950/80 border border-stone-800 rounded-lg text-stone-200 text-xs md:text-sm leading-relaxed font-sans-thai focus:outline-none focus:border-amber-500/70 resize-none"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-medium text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ผลลัพธ์จาก AI:
              </span>
              {outputText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              )}
            </div>

            <div className="relative flex-1 p-3 bg-stone-950/80 border border-stone-800 rounded-lg overflow-y-auto min-h-[220px]">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-stone-950/90 text-stone-400">
                  <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                  <p className="text-xs">AI กำลังรังสรรค์วรรณศิลป์...</p>
                </div>
              ) : outputText ? (
                <div className="text-stone-200 text-xs md:text-sm leading-relaxed font-sans-thai whitespace-pre-wrap">
                  {outputText}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-600 text-xs space-y-1">
                  <Wand2 className="w-6 h-6 text-stone-700" />
                  <span>กดปุ่ม "รังสรรค์ด้วย AI" เพื่อเริ่มประมวลผล</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-5 py-2 bg-rose-950/60 border-t border-rose-900/60 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="text-xs text-stone-500 hidden sm:block">
            ขับเคลื่อนด้วยโมเดล Gemini 3.8 Flash เพื่อวรรณศิลป์ภาษาไทย
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>รังสรรค์ด้วย AI</span>
            </button>

            {outputText && (
              <>
                <button
                  onClick={() => {
                    onApplyText(outputText, 'replace');
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
                >
                  แทนที่ข้อความที่เลือก
                </button>
                <button
                  onClick={() => {
                    onApplyText(outputText, 'append');
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/60 rounded-lg transition-colors"
                >
                  แทรกต่อท้าย
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
