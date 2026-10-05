import React, { useState } from 'react';
import { NovelProject, Chapter } from '../types/novel';
import { 
  Download, 
  Upload, 
  FileText, 
  Code, 
  FileSpreadsheet, 
  X, 
  Check, 
  Copy,
  Printer,
  FileCode,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onImportProject: (imported: NovelProject) => void;
  onOpenTypesetting?: () => void;
}

export type ExportFormat = 'word' | 'txt' | 'md' | 'bible' | 'json' | 'print';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onImportProject,
  onOpenTypesetting,
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('word');
  const [chapterScope, setChapterScope] = useState<'all' | 'custom'>('all');
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(
    project.chapters.map(c => c.id)
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetChapters = chapterScope === 'all'
    ? project.chapters
    : project.chapters.filter(c => selectedChapterIds.includes(c.id));

  // Toggle chapter in selection
  const handleToggleChapter = (chId: string) => {
    setSelectedChapterIds(prev => 
      prev.includes(chId)
        ? prev.filter(id => id !== chId)
        : [...prev, chId]
    );
  };

  // Generate plain text
  const generateManuscriptText = () => {
    let output = `${project.title}\nผู้แต่ง: ${project.author}\nแนวเรื่อง: ${project.genre}\n\n`;
    output += `แก่นเรื่อง: ${project.theme}\n`;
    output += `ล็อกไลน์: ${project.logline}\n\n`;
    output += `=========================================================\n\n`;

    targetChapters.forEach((ch) => {
      output += `${ch.title}\n\n`;
      output += `${ch.content}\n\n`;
      output += `---------------------------------------------------------\n\n`;
    });

    return output;
  };

  // Generate Markdown
  const generateMarkdown = () => {
    let md = `# ${project.title}\n\n`;
    md += `**ผู้แต่ง:** ${project.author}  \n`;
    md += `**แนวเรื่อง:** ${project.genre}  \n`;
    md += `**แก่นเรื่อง:** ${project.theme}  \n\n`;
    md += `> ${project.logline}\n\n---\n\n`;

    targetChapters.forEach((ch) => {
      md += `## ${ch.title}\n\n`;
      md += `${ch.content}\n\n---\n\n`;
    });

    return md;
  };

  // Generate Word Document (HTML compatible with MS Word)
  const generateWordHtml = () => {
    const chaptersHtml = targetChapters.map((ch) => `
      <div style="page-break-before: always; margin-top: 24pt;">
        <h2 style="font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 24pt; font-family: 'TH Sarabun New', 'Noto Serif Thai', serif;">${ch.title}</h2>
        ${ch.content.split('\n\n').map(p => `
          <p style="text-indent: 0.9cm; margin-bottom: 6pt; line-height: 1.6; text-align: justify; font-size: 15pt; font-family: 'TH Sarabun New', 'Noto Serif Thai', serif;">
            ${p.replace(/\n/g, '<br/>')}
          </p>
        `).join('')}
      </div>
    `).join('');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${project.title}</title>
        <style>
          @page {
            size: 14.8cm 21.0cm; /* A5 */
            margin: 2.0cm 2.0cm 2.0cm 2.2cm;
          }
          body {
            font-family: 'TH Sarabun New', 'Sarabun', 'Noto Serif Thai', serif;
            font-size: 15pt;
            line-height: 1.6;
            color: #000;
          }
          h1 {
            font-size: 24pt;
            text-align: center;
            margin-top: 40pt;
            margin-bottom: 12pt;
          }
          .meta {
            text-align: center;
            font-size: 13pt;
            color: #555;
            margin-bottom: 40pt;
          }
          .logline {
            font-style: italic;
            text-align: center;
            margin: 20pt auto;
            max-width: 80%;
            border-top: 1pt solid #ccc;
            border-bottom: 1pt solid #ccc;
            padding: 10pt 0;
          }
        </style>
      </head>
      <body>
        <h1>${project.title}</h1>
        <div class="meta">
          <p>โดย: <strong>${project.author}</strong></p>
          <p>แนวเรื่อง: ${project.genre}</p>
          <p>แก่นเรื่อง: ${project.theme}</p>
        </div>
        <div class="logline">
          "${project.logline}"
        </div>
        ${chaptersHtml}
      </body>
      </html>
    `;
  };

  // Generate Story Bible (World, Characters, Beats, Quick Notes)
  const generateStoryBible = () => {
    let bible = `# คัมภีร์ข้อมูลนิยาย (Story Bible): ${project.title}\n\n`;
    bible += `**ผู้แต่ง:** ${project.author}\n`;
    bible += `**แนวเรื่อง:** ${project.genre}\n`;
    bible += `**แก่นเรื่อง (Theme):** ${project.theme}\n`;
    bible += `**น้ำเสียง (Tone):** ${project.tone}\n`;
    bible += `**ล็อกไลน์:** ${project.logline}\n\n`;
    bible += `**เรื่องย่อภาพรวม (Synopsis):**\n${project.synopsis}\n\n`;
    bible += `=========================================================\n\n`;

    bible += `## 👥 ข้อมูลตัวละครทั้งหมด (${project.characters.length})\n\n`;
    project.characters.forEach(char => {
      bible += `### ${char.name} ${char.alias ? `(${char.alias})` : ''}\n`;
      bible += `- **บทบาท:** ${char.roleLabel} (${char.role})\n`;
      bible += `- **อายุ/เพศ:** ${char.age || '-'} / ${char.gender || '-'}\n`;
      bible += `- **บุคลิกนิสัย:** ${char.personality}\n`;
      bible += `- **เป้าหมายสูงสุด:** ${char.goal}\n`;
      bible += `- **ปมในใจ/จุดอ่อน:** ${char.coreFlaw}\n`;
      bible += `- **ปูมหลัง:** ${char.backstory}\n`;
      if (char.speechHabits) bible += `- **สำนวนคำพูด:** ${char.speechHabits}\n`;
      bible += `\n`;
    });

    bible += `=========================================================\n\n`;
    bible += `## 🏰 สถานที่ & เวิลด์บิลดิ้ง (${project.locations.length})\n\n`;
    project.locations.forEach(loc => {
      bible += `### ${loc.name} (${loc.type})\n`;
      bible += `- **บรรยากาศ:** ${loc.atmosphere}\n`;
      bible += `- **ภาพที่เห็น:** ${loc.visualSensory}\n`;
      bible += `- **เสียงแวดล้อม:** ${loc.audioSensory}\n`;
      bible += `- **กลิ่นอาย:** ${loc.scentSensory}\n`;
      bible += `- **ประวัติศาสตร์/กฎเกณฑ์:** ${loc.historyLore || loc.rulesOrMagic}\n\n`;
    });

    if (project.quickNotes && project.quickNotes.length > 0) {
      bible += `=========================================================\n\n`;
      bible += `## 💡 คลังโน้ตด่วน & ไอเดียกระจัดกระจาย (${project.quickNotes.length})\n\n`;
      project.quickNotes.forEach((n, idx) => {
        bible += `### ไอเดียที่ ${idx + 1} ${n.pinned ? '📌 [ปักหมุด]' : ''}\n`;
        bible += `${n.content}\n`;
        if (n.tags?.length) bible += `**แท็ก:** ${n.tags.map(t => `#${t}`).join(', ')}\n`;
        bible += `\n`;
      });
    }

    return bible;
  };

  const handleDownloadFile = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    const safeTitle = project.title.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9_-]/g, '_');

    if (exportFormat === 'word') {
      content = generateWordHtml();
      filename = `${safeTitle}.doc`;
      mimeType = 'application/msword';
    } else if (exportFormat === 'json') {
      content = JSON.stringify(project, null, 2);
      filename = `${safeTitle}_backup.json`;
      mimeType = 'application/json';
    } else if (exportFormat === 'md') {
      content = generateMarkdown();
      filename = `${safeTitle}.md`;
      mimeType = 'text/markdown';
    } else if (exportFormat === 'bible') {
      content = generateStoryBible();
      filename = `${safeTitle}_StoryBible.md`;
      mimeType = 'text/markdown';
    } else {
      content = generateManuscriptText();
      filename = `${safeTitle}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    let text = '';
    if (exportFormat === 'md') text = generateMarkdown();
    else if (exportFormat === 'bible') text = generateStoryBible();
    else if (exportFormat === 'json') text = JSON.stringify(project, null, 2);
    else text = generateManuscriptText();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.title && Array.isArray(json.chapters)) {
          onImportProject(json);
          alert('นำเข้าโครงการนิยายสำเร็จ!');
          onClose();
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้องตามโครงสร้าง Nawani Studio');
        }
      } catch (err: any) {
        alert(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    if (onOpenTypesetting) {
      onOpenTypesetting();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl p-5 md:p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-stone-100 font-serif-thai">
                นำออก / ส่งออกต้นฉบับ & สำรองข้อมูล (Export)
              </h3>
              <p className="text-xs text-stone-400 font-sans-thai">
                ดาวน์โหลดผลงานนิยายของคุณในรูปแบบ Word, Text, Markdown, คัมภีร์ข้อมูล หรือสั่งพิมพ์รูปเล่ม
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Cards */}
        <div className="space-y-2 text-xs">
          <label className="text-stone-300 font-medium">เลือกรูปแบบไฟล์ที่ต้องการนำออก:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'word', label: 'Microsoft Word (.doc)', desc: 'จัดหน้าไทย ย่อหน้า 0.9cm พร้อมส่ง สนพ.', icon: FileText, highlight: true },
              { id: 'txt', label: 'ข้อความบริสุทธิ์ (.txt)', desc: 'ก็อปปี้ลงเว็บ ReadAWrite, Dek-D ง่ายดาย', icon: FileText },
              { id: 'md', label: 'Markdown (.md)', desc: 'มีหัวข้อ # และแบ่งบทเรียบร้อย', icon: FileCode },
              { id: 'bible', label: 'คัมภีร์นิยาย (Story Bible)', desc: 'ตัวละคร ฉาก โครงเรื่อง และโน้ตด่วน', icon: Layers },
              { id: 'print', label: 'จัดรูปเล่มหนังสือ A5 / PDF', desc: 'หน้าคู่-คี่ สารบัญ เลขหน้า สั่งพิมพ์', icon: BookOpen },
              { id: 'json', label: 'สำรองทั้งโครงการ (.json)', desc: 'Backup ครบทุกข้อมูลสำหรับเปิดใหม่', icon: Code },
            ].map(fmt => {
              const Icon = fmt.icon;
              const isSelected = exportFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id as any)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200 ring-1 ring-amber-500/50 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                    <span className="font-semibold text-stone-200">{fmt.label}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 leading-normal">{fmt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter Scope Selector */}
        {exportFormat !== 'json' && exportFormat !== 'bible' && (
          <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-300">ขอบเขตเนื้อหาที่ต้องการนำออก:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChapterScope('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    chapterScope === 'all'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/70'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  ทั้งเรื่อง ({project.chapters.length} บท)
                </button>
                <button
                  type="button"
                  onClick={() => setChapterScope('custom')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    chapterScope === 'custom'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/70'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  เลือกเฉพาะบางบท
                </button>
              </div>
            </div>

            {chapterScope === 'custom' && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                {project.chapters.map(ch => {
                  const isChecked = selectedChapterIds.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleToggleChapter(ch.id)}
                      className={`px-2 py-1 rounded-md text-[11px] transition-colors truncate max-w-[180px] flex items-center gap-1 ${
                        isChecked
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/80 font-medium'
                          : 'bg-stone-900 text-stone-500 border border-stone-800'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span className="truncate">{ch.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Preview snippet */}
        <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs space-y-1.5 font-mono text-stone-300 max-h-40 overflow-y-auto">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-sans flex items-center justify-between">
            <span>ตัวอย่างข้อมูล ({exportFormat.toUpperCase()}):</span>
            <span className="text-stone-600 font-mono">
              {targetChapters.length} บท · ประมาณ{' '}
              {targetChapters.reduce((acc, c) => acc + (c.content?.length || 0), 0).toLocaleString()} ตัวอักษร
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-sans-thai text-stone-300 text-xs leading-relaxed">
            {exportFormat === 'json'
              ? JSON.stringify({ title: project.title, chaptersCount: project.chapters.length, charactersCount: project.characters.length, quickNotesCount: project.quickNotes?.length || 0 }, null, 2)
              : exportFormat === 'word'
              ? `[รูปแบบ Microsoft Word (.doc) พร้อมย่อหน้า 0.9cm และตั้งค่าหน้า A5]\n\n${project.title}\nโดย: ${project.author}\n\n${targetChapters[0]?.title}\n${targetChapters[0]?.content.slice(0, 200)}...`
              : exportFormat === 'bible'
              ? generateStoryBible().slice(0, 400) + '...'
              : exportFormat === 'md'
              ? generateMarkdown().slice(0, 400) + '...'
              : generateManuscriptText().slice(0, 400) + '...'}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Import JSON button */}
          <div>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl cursor-pointer border border-stone-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-stone-400" />
              <span>นำเข้าไฟล์สำรอง (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {exportFormat !== 'json' && exportFormat !== 'print' && (
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
                title="คัดลอกข้อความลงคลิปบอร์ด"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
              </button>
            )}

            {exportFormat === 'print' ? (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ไปที่เมนูจัดรูปเล่มหนังสือ A5 & พิมพ์</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดไฟล์ ({exportFormat === 'word' ? '.doc' : exportFormat === 'json' ? '.json' : exportFormat === 'md' ? '.md' : '.txt'})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
