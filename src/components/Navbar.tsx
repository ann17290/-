import React from 'react';
import { 
  PenTool, 
  ScrollText, 
  Users, 
  Compass, 
  Network, 
  Sparkles, 
  Download, 
  Sun, 
  Moon, 
  BookOpen,
  RotateCcw,
  Brain,
  Printer,
  FolderInput,
  Lightbulb
} from 'lucide-react';
import { EditorTheme } from '../types/novel';

export type ActiveTab = 'editor' | 'treatment' | 'characters' | 'analysis' | 'typesetting' | 'settings' | 'diagram' | 'ai_tools';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: EditorTheme;
  setTheme: (theme: EditorTheme) => void;
  onOpenExport: () => void;
  onOpenSmartImport?: () => void;
  onOpenQuickNotes?: () => void;
  quickNotesCount?: number;
  onResetSample: () => void;
  novelTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenExport,
  onOpenSmartImport,
  onOpenQuickNotes,
  quickNotesCount = 0,
  onResetSample,
  novelTitle,
}) => {
  return (
    <header className="h-14 border-b border-stone-800 bg-stone-950/95 backdrop-blur px-4 flex items-center justify-between shrink-0 z-30 select-none print:hidden">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setActiveTab('editor'); }}
          className="flex items-center gap-2.5 text-stone-100 hover:text-amber-400 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md shadow-amber-950/50 group-hover:scale-105 transition-transform">
            <PenTool className="w-4 h-4 text-amber-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-amber-100 font-serif-thai">Nawani Studio</span>
            <span className="text-[10px] text-stone-400 truncate max-w-[120px] md:max-w-[180px]" title={novelTitle}>
              {novelTitle}
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 md:gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'editor'
              ? 'bg-stone-800 text-amber-300 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>เขียนนิยาย & ตรวจคำ</span>
        </button>

        <button
          onClick={() => setActiveTab('treatment')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'treatment'
              ? 'bg-stone-800 text-amber-300 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>ทรีทเม้นต์ & พล็อต</span>
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'analysis'
              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60 shadow-sm'
              : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900'
          }`}
          title="วิเคราะห์ความสมเหตุสมผล หลุมพล็อต และความย้อนแย้งของตัวละครด้วย AI"
        >
          <Brain className="w-3.5 h-3.5 text-amber-400" />
          <span>วิเคราะห์พล็อต AI</span>
        </button>

        <button
          onClick={() => setActiveTab('typesetting')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'typesetting'
              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60 shadow-sm'
              : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900'
          }`}
          title="จัดรูปเล่มนิยายมาตรฐาน A5 ปก สารบัญ หน้าคู่-คี่ ส่งโรงพิมพ์"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>จัดรูปเล่มหนังสือ A5</span>
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'characters'
              ? 'bg-stone-800 text-amber-300 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ตัวละคร</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'bg-stone-800 text-amber-300 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>ฉาก & โลก</span>
        </button>

        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'diagram'
              ? 'bg-stone-800 text-amber-300 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">แผนผังความสัมพันธ์</span>
          <span className="xl:hidden">แผนผัง</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_tools')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'ai_tools'
              ? 'bg-stone-800 text-amber-300 shadow-sm'
              : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>เกลาสำนวน</span>
        </button>
      </nav>

      {/* Zone 3: Actions & Theme Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme Toggle */}
        <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800">
          <button
            onClick={() => setTheme('dark')}
            title="ธีมมืด (Midnight)"
            className={`p-1 rounded text-xs transition-colors ${
              theme === 'dark' ? 'bg-stone-800 text-amber-400 shadow-sm' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('sepia')}
            title="ธีมสมุดข่อย (Sepia Parchment)"
            className={`p-1 rounded text-xs transition-colors ${
              theme === 'sepia' ? 'bg-stone-800 text-amber-500 shadow-sm' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('light')}
            title="ธีมสว่าง (Paper Light)"
            className={`p-1 rounded text-xs transition-colors ${
              theme === 'light' ? 'bg-stone-800 text-amber-400 shadow-sm' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onResetSample}
          title="โหลดข้อมูลนิยายตัวอย่าง (บัลลังก์เงาบุปผา) กลับคืนมาใหม่"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-stone-300 hover:text-amber-200 hover:bg-stone-900 rounded-lg border border-stone-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">ตัวอย่างนิยาย</span>
        </button>

        {onOpenQuickNotes && (
          <button
            onClick={onOpenQuickNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200 bg-amber-950/70 hover:bg-amber-900 border border-amber-800/60 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            title="เปิดคลังไอเดีย & โน้ตด่วน (Quick Notes) - จดแรงบันดาลใจกระจัดกระจาย แปะแท็ก เชื่อมโยงตัวละครและบท"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span className="hidden sm:inline">โน้ตด่วน</span>
            {quickNotesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {quickNotesCount}
              </span>
            )}
          </button>
        )}

        {onOpenSmartImport && (
          <button
            onClick={onOpenSmartImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-800/60 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            title="นำเข้าโครงเรื่องหรือต้นฉบับแล้วให้ AI แยกย่อยและโยงสู่ทุกหัวข้อทันที"
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">นำเข้า & โยงข้อมูล AI</span>
          </button>
        )}

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          title="นำออก / ส่งออกนิยาย: Word (.doc), TXT, Markdown, พิมพ์รูปเล่ม PDF, หรือ Backup JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>นำออก / ส่งออก</span>
        </button>
      </div>
    </header>
  );
};
