import React, { useState } from 'react';
import { SpellCheckIssue } from '../../types/novel';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { requestAIAssist } from '../../services/aiService';

interface ProofreadDrawerProps {
  issues: SpellCheckIssue[];
  content: string;
  onFixIssue: (issue: SpellCheckIssue) => void;
  onFixAllSpelling: () => void;
  onApplyAIRevision: (newContent: string) => void;
  onClose?: () => void;
}

export const ProofreadDrawer: React.FC<ProofreadDrawerProps> = ({
  issues,
  content,
  onFixIssue,
  onFixAllSpelling,
  onApplyAIRevision,
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const spellingIssues = issues.filter(i => i.type === 'spelling');
  const repetitionIssues = issues.filter(i => i.type === 'repetition');
  const spacingIssues = issues.filter(i => i.type === 'spacing');

  const handleDeepAIProofread = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const result = await requestAIAssist('proofread', content);
      setAiReport(result);
    } catch (err: any) {
      alert(`การตรวจทานโดย AI ขัดข้อง: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyAiReport = () => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-stone-900 border-l border-stone-800 text-stone-200 w-80 md:w-96 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-sm text-stone-100 font-serif-thai">ศูนย์พิสูจน์อักษร & วรรณศิลป์</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <span>พบ {issues.length} จุด</span>
        </div>
      </div>

      {/* Tabs / Quick Actions */}
      <div className="p-3 border-b border-stone-800/80 bg-stone-950/40 flex items-center justify-between gap-2">
        <button
          onClick={onFixAllSpelling}
          disabled={spellingIssues.length === 0}
          className="flex-1 py-1.5 px-2 text-xs font-medium text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/50 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none text-center truncate"
        >
          แก้ไขคำผิดทั้งหมด ({spellingIssues.length})
        </button>

        <button
          onClick={handleDeepAIProofread}
          disabled={isAiLoading || !content.trim()}
          className="flex-1 py-1.5 px-2 text-xs font-medium text-stone-100 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          {isAiLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>AI กำลังตรวจ...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ตรวจเชิงลึก AI</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* AI Deep Analysis Section if available */}
        {aiReport && (
          <div className="bg-stone-950 border border-amber-800/40 rounded-lg p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-amber-300 font-semibold border-b border-stone-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                รายงานตรวจทานโดย AI
              </span>
              <button
                onClick={copyAiReport}
                className="text-stone-400 hover:text-stone-200 flex items-center gap-1 text-[11px]"
              >
                {copiedReport ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedReport ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
            <div className="text-stone-300 leading-relaxed font-sans-thai whitespace-pre-wrap max-h-72 overflow-y-auto pr-1">
              {aiReport}
            </div>
          </div>
        )}

        {/* Issue list */}
        {issues.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto" />
            <p className="text-sm text-stone-400 font-medium">ยังไม่พบคำสะกดผิดทั่วไปในข้อความ</p>
            <p className="text-xs text-stone-500">ระบบตรวจสอบคำมักเขียนผิด คำซ้ำ และการเว้นวรรคไม้ยมกเรียลไทม์</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {spellingIssues.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                  คำที่มักเขียนผิด ({spellingIssues.length})
                </span>
                {spellingIssues.map(issue => (
                  <div
                    key={issue.id}
                    className="p-2.5 rounded-lg bg-stone-950/70 border border-rose-900/40 hover:border-rose-700/60 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-rose-400 font-medium">{issue.word}</span>
                        <ArrowRight className="w-3 h-3 text-stone-500" />
                        <span className="text-emerald-400 font-semibold">{issue.suggested}</span>
                      </div>
                      <button
                        onClick={() => onFixIssue(issue)}
                        className="px-2 py-0.5 rounded bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-medium transition-colors"
                      >
                        แก้คำนี้
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-normal">{issue.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {repetitionIssues.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  คำซ้ำซ้อนติดกัน ({repetitionIssues.length})
                </span>
                {repetitionIssues.map(issue => (
                  <div
                    key={issue.id}
                    className="p-2.5 rounded-lg bg-stone-950/70 border border-amber-900/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-300 font-medium">{issue.word}</span>
                      <button
                        onClick={() => onFixIssue(issue)}
                        className="px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 text-[11px] font-medium transition-colors"
                      >
                        ตัดเหลือคำเดียว
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400">{issue.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {spacingIssues.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                  วรรคตอน & ไม้ยมก ({spacingIssues.length})
                </span>
                {spacingIssues.map(issue => (
                  <div
                    key={issue.id}
                    className="p-2.5 rounded-lg bg-stone-950/70 border border-sky-900/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400">{issue.word}</span>
                        <ArrowRight className="w-3 h-3 text-stone-500" />
                        <span className="text-sky-300 font-medium">"{issue.suggested}"</span>
                      </div>
                      <button
                        onClick={() => onFixIssue(issue)}
                        className="px-2 py-0.5 rounded bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[11px] font-medium transition-colors"
                      >
                        เว้นวรรค
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400">{issue.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/60 text-[11px] text-stone-500 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-stone-400" />
        <span>พจนานุกรมอ้างอิงหลักการสะกดภาษาไทยและวรรณศิลป์การประพันธ์</span>
      </div>
    </div>
  );
};
