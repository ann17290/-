import React, { useState } from 'react';
import { NovelProject } from '../../types/novel';
import { 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  Copy, 
  Check, 
  ArrowRight,
  BookOpen,
  Users,
  Compass
} from 'lucide-react';
import { requestAIAssist } from '../../services/aiService';

interface StoryAnalysisViewProps {
  project: NovelProject;
  onJumpToTab?: (tab: string) => void;
}

export const StoryAnalysisView: React.FC<StoryAnalysisViewProps> = ({
  project,
  onJumpToTab,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'logic' | 'character' | 'expansion' | 'pacing' | 'checklist'>('all');
  const [copied, setCopied] = useState(false);
  const [resolvedItems, setResolvedItems] = useState<Record<string, boolean>>({});

  // Fallback initial analysis for instantaneous display
  const defaultAnalysis = `### 1. 🔍 ความสมเหตุสมผลของพล็อตและหลุมพล็อต (Plot Plausibility & Plot Holes)
- **ประเด็นเรื่องเวลาและการชันสูตร**: การที่ลี่หลินสามารถระบุ "เกสรเงาบุปผา" ได้ทันทีในคืนแรกที่พบพระศพนั้น แม้จะแสดงถึงความเก่งกาจ แต่เสี่ยงที่ผู้อ่านจะรู้สึกว่า "บังเอิญเกินไป" แนะนำให้เพิ่มความลังเลของลี่หลินเล็กน้อย หรือให้มีรอยช้ำเฉพาะที่ต้องใช้สมุนไพรทำปฏิกิริยาจึงจะเผยผลึกใส
- **การปรากฏตัวของหยางเฟยหรงในตำหนักใน**: แม่ทัพชายแดนที่ถูกเพ่งเล็ง ไม่ควรเดินเข้าสู่ตำหนักในของพระสนมเอกได้อย่างง่ายดายโดยไม่มีองครักษ์ขัดขวาง ควรระบุว่าเขาใช้ป้ายผ่านทางลับของพระสนม หรือลอบเข้ามาทางอุโมงค์ลับเพื่อความสมเหตุสมผล
- **แรงจูงใจของมหาเสนาบดีจ้าว**: การใช้ยาพิษที่หายากจนชี้เป้ามายังชายแดน แม้จะเป็นการจงใจป้ายสี แต่ก็เสี่ยงทำให้คนสงสัยว่ามีคนจงใจสร้างเรื่อง แนะนำให้เพิ่มว่าจ้าวเหวินเฉิงวางแผนสร้างหลักฐานเท็จในค่ายทหารรองรับไว้แล้ว

### 2. 🎭 การตรวจสอบความย้อนแย้งของตัวละคร (Character Inconsistencies & Contradictions)
- **ไป๋ลี่หลิน (นางเอก)**: ระบุว่ามีปมในใจคือ "ไม่ยอมขอความช่วยเหลือจากผู้อื่นและแบกรับทุกอย่างไว้คนเดียว" แต่ในบทที่ ๒ กลับตัดสินใจยอมร่วมมือกับหยางเฟยหรงอย่างรวดเร็วหลังคุยกันเพียงไม่กี่ประโยค แนะนำให้เพิ่มความหวาดระแวง มีการตั้งเงื่อนไขต่อรองที่รัดกุมกว่านี้ หรือมีจังหวะที่ลี่หลินพยายามลงมือคนเดียวแล้วเกือบพลาด จึงยอมรับข้อตกลง
- **หยางเฟยหรง (พระเอก)**: ปูมหลังเป็น "แม่ทัพผู้ผ่านศึกและไม่ไว้ใจใครง่ายๆ" แต่เมื่อลี่หลินอธิบายทฤษฎีพิษ เขากลับรับฟังและยอมเชื่อใจเร็วไปนิด ควรเพิ่มบททดสอบหรือให้เฟยหรงส่งคนสนิทไปตรวจสอบคำพูดของนางก่อน
- **อาจารย์เฒ่าจิว**: ในฐานะผู้คิดค้นพิษเกสรเงาบุปผา การที่เขายังมีชีวิตอยู่อย่างเปิดเผยในแถบชานเมืองอาจย้อนแย้งกับการที่มหาเสนาบดีตามล่าปิดปาก ควรระบุว่าเขาต้องเปลี่ยนชื่อแซ่และใช้ชีวิตแบบแกล้งเสียสติเพื่อเอาตัวรอด

### 3. 💡 ข้อเสนอแนะสิ่งที่ควรมีในเนื้อหาเพิ่มเติม (Recommended Content & Missing Beats)
- **ฉาก Flashback ความทรงจำของลี่หลินกับบิดา**: ควรแทรกฉากสั้นๆ ในบทที่ ๑ หรือ ๒ ที่ลี่หลินนึกถึงคำสอนของพ่อเรื่องการสังเกตกลิ่นยาพิษ จะช่วยสร้างน้ำหนักทางอารมณ์และทำให้การสืบคดีของนางมีความหมายยิ่งขึ้น
- **การปูความสัมพันธ์เชิงขั้วตรงข้าม (Chemistry & Subtext)**: ก่อนที่ทั้งคู่จะเกิดความรัก ควรเพิ่มฉากที่ทั้งสองมีความคิดเห็นขัดแย้งกันอย่างรุนแรงเรื่อง "กฎหมาย vs ความยุติธรรม" เพื่อให้พัฒนาการของความสัมพันธ์น่าติดตาม
- **มิติของตัวละครรอง (ขันทีเฒ่า/สาวใช้)**: ขันทีเฒ่าที่พาลี่หลินมาที่ห้องบรรทมควรมีบทบาทต่อเนื่อง หรือเป็นหูเป็นตาให้ใครบางคน เพื่อไม่ให้รู้สึกว่าเป็นตัวละครที่ถูกสร้างมาเพื่อพาตัวเอกเข้าฉากแล้วหายไปเฉยๆ

### 4. ⏱️ จังหวะการเล่าเรื่องและความตึงเครียด (Pacing & Emotional Arc)
- **ช่วงต้น (Act 1)**: จังหวะเปิดเรื่องทำได้ดีมาก ดึงดูดความสนใจได้ทันทีด้วยบรรยากาศและศพพระสนม
- **ช่วงกลาง (Act 2)**: ระหว่างบทที่ ๕ ถึง ๗ มีแนวโน้มว่าการสืบสวนจะเน้นการพูดคุยหาเบาะแสมากเกินไป แนะนำให้แทรกฉากการถูกลอบโจมตี หรือการเกือบถูกจับได้ในหอจดหมายเหตุเพื่อเร่งชีพจรความตึงเครียด
- **ช่วงจุดกึ่งกลาง (Midpoint)**: จุดงานล่าสัตว์หลวงเป็นจุดเปลี่ยนที่ดีมาก แต่ต้องระวังอย่าให้การเฉลยแผนการของตัวร้ายทำผ่านบทพูดยืดยาว ควรให้ตัวเอกค้นพบด้วยการกระทำ

### 5. 📋 แผนการปรับปรุงสำหรับนักเขียน (Actionable Revision Checklist)
1. **[เร่งด่วน]** ปรับแก้ฉากบทที่ ๒ ให้ลี่หลินและเฟยหรงมีแรงเสียดทาน (Friction) มากขึ้น ไม่ยอมลงรอยกันทันที
2. **[โครงเรื่อง]** เพิ่มคำอธิบายว่าหยางเฟยหรงลอบเข้าตำหนักในมาได้อย่างไรโดยไม่ถูกทหารยามล้อมจับ
3. **[อารมณ์]** แทรกฉากจำลองการฝนใบยาของพ่อในอดีตลงในบทที่ ๑ ตอนที่ลี่หลินตรวจสอบเข็มเงิน
4. **[เวิลด์บิลดิ้ง]** บรรยายถึงผลกระทบทางการเมืองของแคว้น หากองค์ชายแปดถูกจับกุม จะเกิดสงครามชายแดนทันทีเพื่อเพิ่มเดิมพัน (High Stakes)`;

  const currentDisplay = analysisText || defaultAnalysis;

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Build comprehensive context
      const chaptersSummary = project.chapters.map(ch => 
        `- ${ch.title}: ${ch.summary || ch.content.slice(0, 150)}... (POV: ${ch.povCharacterId || 'ไม่ระบุ'})`
      ).join('\n');

      const charactersSummary = project.characters.map(c => 
        `- ${c.name} (${c.roleLabel}): บุคลิก=${c.personality}, เป้าหมาย=${c.goal}, จุดอ่อน/ปม=${c.coreFlaw}, ประวัติ=${c.backstory}`
      ).join('\n');

      const beatsSummary = project.storyBeats.map(b => 
        `- [${b.act}] ${b.title} (${b.timing}): ${b.description}`
      ).join('\n');

      const locSummary = project.locations.map(l => 
        `- ${l.name} (${l.type}): ${l.atmosphere}, กฎ=${l.rulesOrMagic}`
      ).join('\n');

      const treatmentPayload = `${project.title}
ล็อกไลน์: ${project.logline}
แก่นเรื่อง: ${project.theme}
แนวเรื่อง: ${project.genre}
---
จุดเรื่องสำคัญ (Story Beats):
${beatsSummary}
---
โครงเรื่องรายบท:
${chaptersSummary}`;

      const result = await requestAIAssist('analyze_story', project.title, {
        treatment: treatmentPayload,
        characters: charactersSummary,
        scene: locSummary,
      });

      setAnalysisText(result);
    } catch (err: any) {
      alert(`การวิเคราะห์โดย AI ขัดข้อง: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleResolved = (key: string) => {
    setResolvedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-900 text-stone-100 select-none">
      {/* Top Banner */}
      <div className="p-4 md:p-6 border-b border-stone-800 bg-stone-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>ศูนย์วิเคราะห์พล็อต & ตรวจจับความย้อนแย้ง (AI Story & Plot Doctor)</span>
          </div>
          <h1 className="text-xl font-bold font-serif-thai text-stone-100 mt-1">
            วิเคราะห์ความสมเหตุสมผล ตรวจสอบหลุมพล็อต & ความย้อนแย้งของตัวละคร
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            สแกนลึกทั้งล็อกไลน์ 3-Act Beats รายละเอียดฉาก และความสอดคล้องของการตัดสินใจของตัวละคร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI กำลังวิเคราะห์ทั้งเรื่อง...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>รันการวิเคราะห์โครงเรื่องใหม่</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกบทวิเคราะห์'}</span>
          </button>
        </div>
      </div>

      {/* 4 Feature Badges Summary */}
      <div className="p-4 bg-stone-950/40 border-b border-stone-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0 text-xs">
        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-amber-950/60 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-200">ตรวจสอบหลุมพล็อต</div>
            <div className="text-[11px] text-stone-400">หาความไม่สมเหตุสมผล</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-rose-950/60 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-200">ตรวจความย้อนแย้ง</div>
            <div className="text-[11px] text-stone-400">พฤติกรรมขัดนิสัยตัวละคร</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-sky-950/60 text-sky-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-200">สิ่งที่ควรมีเพิ่มเติม</div>
            <div className="text-[11px] text-stone-400">ฉากที่ขาดและเบาะแส</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-emerald-950/60 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-200">แผนปรับปรุงงานเขียน</div>
            <div className="text-[11px] text-stone-400">ลำดับขั้นตอนแก้ต้นฉบับ</div>
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Quick Context Card */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-amber-400 font-semibold uppercase">โครงการที่กำลังวิเคราะห์:</span>
              <h3 className="font-bold text-base text-stone-100 font-serif-thai">{project.title}</h3>
              <p className="text-stone-400 line-clamp-1">{project.logline}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-300 border border-stone-800">
                {project.chapters.length} บท
              </span>
              <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-300 border border-stone-800">
                {project.characters.length} ตัวละคร
              </span>
              <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-300 border border-stone-800">
                {project.storyBeats.length} Story Beats
              </span>
            </div>
          </div>

          {/* Analysis Report Card */}
          <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div className="flex items-center gap-2 text-stone-200 font-semibold font-serif-thai text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>รายงานบทวิเคราะห์เชิงลึกโดยบรรณาธิการ AI (Comprehensive Story Audit)</span>
              </div>
              <span className="text-[11px] text-stone-500">
                วิเคราะห์ด้วยโมเดล Gemini 3.8 Flash
              </span>
            </div>

            {/* Markdown Styled Output */}
            <div className="prose prose-invert max-w-none text-stone-200 text-xs md:text-sm leading-relaxed font-sans-thai space-y-4">
              {currentDisplay.split('### ').map((section, idx) => {
                if (!section.trim()) return null;
                const lines = section.split('\n');
                const title = lines[0];
                const content = lines.slice(1).join('\n');

                return (
                  <div key={idx} className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-3">
                    <h3 className="font-bold text-sm md:text-base text-amber-300 font-serif-thai border-b border-stone-800 pb-2">
                      {title}
                    </h3>
                    <div className="whitespace-pre-wrap text-stone-300 font-sans-thai leading-relaxed space-y-2">
                      {content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Navigation Footer */}
            <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-stone-400">
                ต้องการนำข้อเสนอแนะนี้ไปปรับใช้ในส่วนใดของโครงการ?
              </span>
              <div className="flex items-center gap-2">
                {onJumpToTab && (
                  <>
                    <button
                      onClick={() => onJumpToTab('treatment')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>ไปแก้ทรีทเม้นต์</span>
                    </button>
                    <button
                      onClick={() => onJumpToTab('characters')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>ไปแก้ข้อมูลตัวละคร</span>
                    </button>
                    <button
                      onClick={() => onJumpToTab('editor')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold transition-colors"
                    >
                      <span>ไปเขียนแก้ไขในบท</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
