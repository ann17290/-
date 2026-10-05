import React, { useState, useMemo } from 'react';
import { NovelProject, BookTypesettingConfig, Chapter } from '../../types/novel';
import { 
  BookOpen, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Eye, 
  Sparkles, 
  FileText, 
  Layers, 
  Check, 
  Download,
  Palette,
  Maximize2,
  Bookmark
} from 'lucide-react';

interface BookTypesettingViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
}

export const BookTypesettingView: React.FC<BookTypesettingViewProps> = ({
  project,
  onUpdateProject,
}) => {
  // Typesetting settings with defaults
  const [config, setConfig] = useState<BookTypesettingConfig>({
    paperSize: project.typesettingConfig?.paperSize || 'A5',
    paperTone: project.typesettingConfig?.paperTone || 'cream',
    fontFamily: project.typesettingConfig?.fontFamily || 'serif',
    fontSizePt: project.typesettingConfig?.fontSizePt || 15,
    lineSpacing: project.typesettingConfig?.lineSpacing || 1.6,
    firstLineIndentCm: project.typesettingConfig?.firstLineIndentCm || 0.9,
    gutterMarginMm: project.typesettingConfig?.gutterMarginMm || 22,
    outerMarginMm: project.typesettingConfig?.outerMarginMm || 16,
    topMarginMm: project.typesettingConfig?.topMarginMm || 20,
    bottomMarginMm: project.typesettingConfig?.bottomMarginMm || 20,
    showRunningHeader: project.typesettingConfig?.showRunningHeader !== false,
    showRunningFooter: project.typesettingConfig?.showRunningFooter !== false,
    showDropCaps: project.typesettingConfig?.showDropCaps !== false,
    showOrnaments: project.typesettingConfig?.showOrnaments !== false,
    chapterStartSide: project.typesettingConfig?.chapterStartSide || 'recto',
  });

  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0); // 0 = Cover/Title, etc.
  const [viewMode, setViewMode] = useState<'spread' | 'continuous'>('spread');

  // Update config
  const updateConfig = (newConf: Partial<BookTypesettingConfig>) => {
    const updated = { ...config, ...newConf };
    setConfig(updated);
    onUpdateProject({
      ...project,
      typesettingConfig: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Generate All Formatted Pages of the Book
  interface BookPage {
    id: string;
    type: 'cover' | 'half_title' | 'title' | 'copyright' | 'dedication' | 'preface' | 'toc' | 'cast' | 'chapter' | 'about_author' | 'back_cover';
    pageNumber?: number;
    title?: string;
    chapterOrder?: number;
    paragraphs?: string[];
    isRecto: boolean; // Odd page (Right)
    isVerso: boolean; // Even page (Left)
  }

  const pages = useMemo(() => {
    const list: BookPage[] = [];

    // 1. Cover
    list.push({
      id: 'cover',
      type: 'cover',
      isRecto: true,
      isVerso: false,
    });

    // 2. Blank or Half-title
    list.push({
      id: 'half_title',
      type: 'half_title',
      isRecto: false,
      isVerso: true,
    });

    // 3. Title Page
    list.push({
      id: 'title',
      type: 'title',
      isRecto: true,
      isVerso: false,
    });

    // 4. Copyright Page (CIP / ISBN)
    list.push({
      id: 'copyright',
      type: 'copyright',
      pageNumber: 4,
      isRecto: false,
      isVerso: true,
    });

    // 5. Dedication
    if (project.dedication) {
      list.push({
        id: 'dedication',
        type: 'dedication',
        pageNumber: 5,
        isRecto: true,
        isVerso: false,
      });
    }

    // 6. Preface
    if (project.authorPreface) {
      list.push({
        id: 'preface',
        type: 'preface',
        pageNumber: list.length + 1,
        isRecto: list.length % 2 === 0,
        isVerso: list.length % 2 === 1,
      });
    }

    // 7. Table of Contents
    list.push({
      id: 'toc',
      type: 'toc',
      pageNumber: list.length + 1,
      isRecto: list.length % 2 === 0,
      isVerso: list.length % 2 === 1,
    });

    // 8. Dramatis Personae (Cast of Characters)
    list.push({
      id: 'cast',
      type: 'cast',
      pageNumber: list.length + 1,
      isRecto: list.length % 2 === 0,
      isVerso: list.length % 2 === 1,
    });

    // 9. Main Chapters
    let curPageNum = list.length + 1;
    project.chapters.forEach((ch, idx) => {
      // Split chapter content into chunks of ~350 words per page to simulate realistic page flow
      const rawParas = ch.content
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      // Simple paginate algorithm (~2-3 paras per page)
      const parasPerPage = 3;
      for (let pIdx = 0; pIdx < rawParas.length; pIdx += parasPerPage) {
        const pageParas = rawParas.slice(pIdx, pIdx + parasPerPage);
        const isFirstPageOfChapter = pIdx === 0;

        // If recto chapter start, and current page is verso, pad a blank page
        if (isFirstPageOfChapter && config.chapterStartSide === 'recto' && list.length % 2 === 1) {
          list.push({
            id: `blank-${ch.id}`,
            type: 'chapter',
            pageNumber: curPageNum++,
            isRecto: false,
            isVerso: true,
            paragraphs: [],
          });
        }

        const isRecto = list.length % 2 === 0;
        list.push({
          id: `ch-${ch.id}-p-${pIdx}`,
          type: 'chapter',
          pageNumber: curPageNum++,
          title: ch.title,
          chapterOrder: ch.order,
          paragraphs: pageParas,
          isRecto: isRecto,
          isVerso: !isRecto,
        });
      }
    });

    // 10. About Author
    list.push({
      id: 'about_author',
      type: 'about_author',
      pageNumber: curPageNum++,
      isRecto: list.length % 2 === 0,
      isVerso: list.length % 2 === 1,
    });

    // 11. Back Cover
    list.push({
      id: 'back_cover',
      type: 'back_cover',
      isRecto: false,
      isVerso: true,
    });

    return list;
  }, [project, config]);

  // Total spreads (pairs of pages: 0-1, 2-3, 4-5...)
  const totalSpreads = Math.ceil(pages.length / 2);
  const leftPage = pages[currentSpreadIndex * 2];
  const rightPage = pages[currentSpreadIndex * 2 + 1];

  // Paper Tone CSS
  const getPaperToneStyle = () => {
    if (config.paperTone === 'cream') {
      return {
        background: '#FAF6EE',
        color: '#24201C',
        borderColor: '#E6DECE',
      };
    }
    if (config.paperTone === 'vintage') {
      return {
        background: '#F4E8D1',
        color: '#2B241C',
        borderColor: '#DFCBB0',
      };
    }
    return {
      background: '#FFFFFF',
      color: '#1A1A1A',
      borderColor: '#E5E5E5',
    };
  };

  const paperStyle = getPaperToneStyle();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-950 text-stone-100 select-none">
      {/* Typesetting Header Toolbar (Hidden when printing) */}
      <div className="print:hidden h-14 border-b border-stone-800 bg-stone-950/95 backdrop-blur px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-stone-100 font-serif-thai">
              สตูดิโอจัดรูปเล่มนิยายมาตรฐาน (Novel Typesetting & Book Formatter)
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-stone-400">
              <span>ขนาด: <strong>{config.paperSize}</strong> (148 × 210 มม.)</span>
              <span>·</span>
              <span>กระดาษ: <strong>{config.paperTone === 'cream' ? 'กรีนรีดถนอมสายตา' : config.paperTone === 'vintage' ? 'วินเทจคลาสสิก' : 'ขาวปอนด์'}</strong></span>
              <span>·</span>
              <span>รวม {pages.length} หน้า ({totalSpreads} หน้าคู่)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('spread')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'spread' ? 'bg-stone-800 text-amber-300 font-medium' : 'text-stone-400'
              }`}
            >
              เปิดสองหน้าคู่ (Spread)
            </button>
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'continuous' ? 'bg-stone-800 text-amber-300 font-medium' : 'text-stone-400'
              }`}
            >
              เลื่อนเรียงหน้า (All Pages)
            </button>
          </div>

          {/* Settings Drawer Button */}
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showConfigDrawer
                ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ตั้งค่ารูปเล่ม & ฟอนต์</span>
          </button>

          {/* Print Ready Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
            title="สั่งพิมพ์หรือบันทึกเป็น PDF ขนาด A5 สำหรับส่งโรงพิมพ์"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ / ส่งออก PDF โรงพิมพ์</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Book Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto items-center p-4 md:p-8 bg-stone-900/90 print:bg-white print:p-0">
          {viewMode === 'spread' ? (
            /* Two-Page Spread View (Realistic Novel Book) */
            <div className="flex flex-col items-center justify-center my-auto print:my-0 space-y-4">
              <div className="flex items-stretch justify-center shadow-2xl rounded-sm overflow-hidden border border-stone-800/80 bg-stone-950 print:border-none print:shadow-none">
                {/* Left Page (Verso) */}
                <div
                  style={{
                    width: '380px',
                    height: '540px',
                    background: paperStyle.background,
                    color: paperStyle.color,
                    fontFamily: config.fontFamily === 'serif' ? 'var(--font-thai-serif)' : 'var(--font-thai-sans)',
                    fontSize: `${config.fontSizePt}px`,
                    lineHeight: config.lineSpacing,
                  }}
                  className="relative p-7 flex flex-col justify-between border-r border-stone-300/40 shadow-inner overflow-hidden select-text print:w-full print:h-screen print:p-8 print:border-none"
                >
                  {/* Spine Crease Gradient on Right edge of left page */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-stone-900/10 to-transparent pointer-events-none" />

                  {/* Running Header (Left: Book Title) */}
                  {config.showRunningHeader && leftPage && leftPage.type === 'chapter' && (
                    <div className="text-[10px] tracking-wider text-stone-500 uppercase border-b border-stone-300/40 pb-1 mb-3 text-left">
                      {project.title}
                    </div>
                  )}

                  {/* Left Page Content */}
                  <div className="flex-1 overflow-hidden">
                    {renderPageContent(leftPage, project, config)}
                  </div>

                  {/* Running Footer (Left: Outer Page Number) */}
                  {config.showRunningFooter && leftPage && leftPage.pageNumber && (
                    <div className="text-[10px] text-stone-500 font-mono mt-3 text-left pt-1 border-t border-stone-200/40">
                      {leftPage.pageNumber}
                    </div>
                  )}
                </div>

                {/* Right Page (Recto) */}
                <div
                  style={{
                    width: '380px',
                    height: '540px',
                    background: paperStyle.background,
                    color: paperStyle.color,
                    fontFamily: config.fontFamily === 'serif' ? 'var(--font-thai-serif)' : 'var(--font-thai-sans)',
                    fontSize: `${config.fontSizePt}px`,
                    lineHeight: config.lineSpacing,
                  }}
                  className="relative p-7 flex flex-col justify-between shadow-inner overflow-hidden select-text print:w-full print:h-screen print:p-8"
                >
                  {/* Spine Crease Gradient on Left edge of right page */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-900/10 to-transparent pointer-events-none" />

                  {/* Running Header (Right: Current Chapter) */}
                  {config.showRunningHeader && rightPage && rightPage.type === 'chapter' && (
                    <div className="text-[10px] tracking-wider text-stone-500 uppercase border-b border-stone-300/40 pb-1 mb-3 text-right">
                      {rightPage.title || project.title}
                    </div>
                  )}

                  {/* Right Page Content */}
                  <div className="flex-1 overflow-hidden">
                    {renderPageContent(rightPage, project, config)}
                  </div>

                  {/* Running Footer (Right: Outer Page Number) */}
                  {config.showRunningFooter && rightPage && rightPage.pageNumber && (
                    <div className="text-[10px] text-stone-500 font-mono mt-3 text-right pt-1 border-t border-stone-200/40">
                      {rightPage.pageNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Spread Controls Navigation Bar */}
              <div className="print:hidden flex items-center justify-between w-full max-w-xl bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-300 backdrop-blur">
                <button
                  onClick={() => setCurrentSpreadIndex(i => Math.max(0, i - 1))}
                  disabled={currentSpreadIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>หน้าก่อนหน้า</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="font-medium font-mono text-stone-400">
                    หน้าคู่ที่ {currentSpreadIndex + 1} / {totalSpreads}
                  </span>
                  <select
                    value={currentSpreadIndex}
                    onChange={(e) => setCurrentSpreadIndex(Number(e.target.value))}
                    className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-2 py-1 focus:outline-none"
                  >
                    {Array.from({ length: totalSpreads }).map((_, idx) => {
                      const l = pages[idx * 2];
                      const r = pages[idx * 2 + 1];
                      const label = l?.title || l?.type || r?.title || r?.type || `หน้า ${idx * 2 + 1}`;
                      return (
                        <option key={idx} value={idx}>
                          คู่ที่ {idx + 1}: {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => setCurrentSpreadIndex(i => Math.min(totalSpreads - 1, i + 1))}
                  disabled={currentSpreadIndex >= totalSpreads - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 transition-colors"
                >
                  <span>หน้าถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Continuous Sheet View (Shows all pages vertically) */
            <div className="w-full max-w-2xl space-y-8 my-4 print:space-y-0 print:my-0">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    minHeight: '620px',
                    background: paperStyle.background,
                    color: paperStyle.color,
                    fontFamily: config.fontFamily === 'serif' ? 'var(--font-thai-serif)' : 'var(--font-thai-sans)',
                    fontSize: `${config.fontSizePt}px`,
                    lineHeight: config.lineSpacing,
                  }}
                  className="p-10 rounded-sm shadow-xl border border-stone-300/40 relative flex flex-col justify-between print:min-h-screen print:shadow-none print:border-none print:rounded-none print:p-8 print:break-after-page"
                >
                  {/* Running Header */}
                  {config.showRunningHeader && p.type === 'chapter' && (
                    <div className={`text-[11px] text-stone-400 uppercase border-b border-stone-200/50 pb-1.5 mb-4 ${p.isRecto ? 'text-right' : 'text-left'}`}>
                      {p.isRecto ? p.title : project.title}
                    </div>
                  )}

                  <div className="flex-1">
                    {renderPageContent(p, project, config)}
                  </div>

                  {/* Running Footer */}
                  {config.showRunningFooter && p.pageNumber && (
                    <div className={`text-[11px] text-stone-400 font-mono mt-4 pt-1.5 border-t border-stone-200/50 ${p.isRecto ? 'text-right' : 'text-left'}`}>
                      {p.pageNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Drawer on the Right */}
        {showConfigDrawer && (
          <aside className="w-80 md:w-88 border-l border-stone-800 bg-stone-950 p-4 overflow-y-auto space-y-5 text-xs text-stone-200 shrink-0 z-30 select-none">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 font-semibold font-serif-thai text-sm text-stone-100">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>การตั้งค่ารูปเล่ม & ฟอนต์</span>
              </div>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            {/* Paper Size & Dimensions */}
            <div className="space-y-2">
              <label className="font-semibold text-amber-400">ขนาดรูปเล่มหนังสือ:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['A5', 'B6', 'Pocket'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => updateConfig({ paperSize: size })}
                    className={`py-2 px-1 text-center rounded-lg border transition-colors ${
                      config.paperSize === size
                        ? 'bg-amber-950/60 border-amber-800 text-amber-300 font-semibold'
                        : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div>{size}</div>
                    <div className="text-[10px] text-stone-500">
                      {size === 'A5' ? '148×210มม.' : size === 'B6' ? '128×182มม.' : '5×7.25นิ้ว'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Tone */}
            <div className="space-y-2">
              <label className="font-semibold text-amber-400">สีกระดาษเนื้อในเล่ม:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cream', label: 'กรีนรีดครีม', desc: 'ถนอมสายตา' },
                  { id: 'white', label: 'ปอนด์ขาว', desc: 'ขาวบริสุทธิ์' },
                  { id: 'vintage', label: 'วินเทจ', desc: 'คลาสสิกโบราณ' },
                ].map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => updateConfig({ paperTone: tone.id as any })}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      config.paperTone === tone.id
                        ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                        : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="font-semibold text-stone-200">{tone.label}</div>
                    <div className="text-[10px] text-stone-500">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Font Family */}
            <div className="space-y-3 pt-2 border-t border-stone-800/80">
              <label className="font-semibold text-amber-400">ฟอนต์วรรณกรรม:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateConfig({ fontFamily: 'serif' })}
                  className={`p-2.5 rounded-lg border font-serif-thai text-left transition-colors ${
                    config.fontFamily === 'serif'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300 font-semibold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-sm">มีเชิง (Serif)</div>
                  <div className="text-[10px] text-stone-500">Noto Serif Thai</div>
                </button>
                <button
                  onClick={() => updateConfig({ fontFamily: 'sans' })}
                  className={`p-2.5 rounded-lg border font-sans-thai text-left transition-colors ${
                    config.fontFamily === 'sans'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300 font-semibold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-sm">ไร้เชิง (Sans)</div>
                  <div className="text-[10px] text-stone-500">Sarabun Thai</div>
                </button>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-stone-300">
                  <span>ขนาดตัวอักษรเนื้อหา:</span>
                  <span className="font-mono text-amber-400">{config.fontSizePt} pt</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[13, 14, 15, 16].map(pt => (
                    <button
                      key={pt}
                      onClick={() => updateConfig({ fontSizePt: pt as any })}
                      className={`py-1.5 rounded border text-center transition-colors ${
                        config.fontSizePt === pt
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {pt} pt
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Spacing */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-stone-300">
                  <span>ระยะห่างบรรทัด (Line Spacing):</span>
                  <span className="font-mono text-amber-400">{config.lineSpacing}x</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1.4, 1.6, 1.8].map(lh => (
                    <button
                      key={lh}
                      onClick={() => updateConfig({ lineSpacing: lh as any })}
                      className={`py-1.5 rounded border text-center transition-colors ${
                        config.lineSpacing === lh
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Layout Rules */}
            <div className="space-y-3 pt-2 border-t border-stone-800/80">
              <label className="font-semibold text-amber-400">องค์ประกอบสิ่งพิมพ์:</label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer">
                <span>หัวบทขึ้นหน้าขวาเสมอ (Recto Start)</span>
                <input
                  type="checkbox"
                  checked={config.chapterStartSide === 'recto'}
                  onChange={(e) => updateConfig({ chapterStartSide: e.target.checked ? 'recto' : 'any' })}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer">
                <span>ตัวอักษรขึ้นต้นตัวใหญ่ (Drop Caps)</span>
                <input
                  type="checkbox"
                  checked={config.showDropCaps}
                  onChange={(e) => updateConfig({ showDropCaps: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer">
                <span>ลายประดับหัวบท (Literary Ornaments)</span>
                <input
                  type="checkbox"
                  checked={config.showOrnaments}
                  onChange={(e) => updateConfig({ showOrnaments: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer">
                <span>แสดงชื่อเรื่อง/ชื่อบทที่หัวกระดาษ</span>
                <input
                  type="checkbox"
                  checked={config.showRunningHeader}
                  onChange={(e) => updateConfig({ showRunningHeader: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer">
                <span>แสดงเลขหน้าที่ท้ายกระดาษ</span>
                <input
                  type="checkbox"
                  checked={config.showRunningFooter}
                  onChange={(e) => updateConfig({ showRunningFooter: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

/**
 * Helper to render individual book pages accurately
 */
function renderPageContent(
  page: any,
  project: NovelProject,
  config: BookTypesettingConfig
) {
  if (!page) {
    return (
      <div className="h-full flex items-center justify-center text-stone-300 text-xs italic">
        (หน้าว่างสำหรับเข้าเล่ม)
      </div>
    );
  }

  // 1. Cover
  if (page.type === 'cover') {
    return (
      <div className="h-full flex flex-col justify-between items-center text-center p-6 border-4 border-amber-900/20 bg-gradient-to-b from-stone-900/5 via-amber-950/10 to-stone-900/10 rounded-sm">
        <div className="space-y-2 pt-4">
          <span className="text-[10px] tracking-widest text-amber-800 uppercase font-sans">
            — นวนิยายฉบับสมบูรณ์ —
          </span>
          <div className="w-12 h-0.5 bg-amber-800/40 mx-auto mt-1" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold font-serif-thai text-stone-900 tracking-tight leading-snug">
            {project.title}
          </h1>
          <p className="text-xs text-stone-600 font-sans-thai max-w-[240px] mx-auto italic">
            "{project.logline}"
          </p>
        </div>

        <div className="space-y-1 pb-4">
          <span className="text-xs text-stone-500">ประพันธ์โดย</span>
          <div className="text-base font-semibold font-serif-thai text-stone-800">{project.author}</div>
          <span className="text-[10px] text-stone-500">{project.publisher || 'สำนักพิมพ์นาวานี'}</span>
        </div>
      </div>
    );
  }

  // 2. Title Page
  if (page.type === 'title') {
    return (
      <div className="h-full flex flex-col justify-between items-center text-center p-6">
        <div className="pt-8">
          <h2 className="text-xl font-bold font-serif-thai text-stone-900">{project.title}</h2>
          <div className="text-xs text-stone-500 mt-1">{project.genre}</div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-sm font-semibold font-serif-thai text-stone-800">{project.author}</div>
          <div className="text-[10px] text-stone-400">{project.publicationYear || '๒๕๖๙'}</div>
        </div>

        <div className="text-[10px] text-stone-500 pb-4">
          {project.publisher || 'สำนักพิมพ์นาวานีบุ๊คส์'}
        </div>
      </div>
    );
  }

  // 3. Copyright Page
  if (page.type === 'copyright') {
    return (
      <div className="h-full flex flex-col justify-end p-4 text-[10px] text-stone-600 space-y-3 font-sans-thai leading-relaxed">
        <div className="space-y-1 border-t border-stone-300 pt-3">
          <div className="font-semibold text-stone-800">{project.title}</div>
          <div>ผู้เขียน: {project.author}</div>
          <div>พิมพ์ครั้งที่ ๑: {project.publicationYear || 'พ.ศ. ๒๕๖๙'}</div>
          <div>ISBN: {project.isbn || '978-616-XXXX-XX-X'}</div>
          <div>จัดพิมพ์และเผยแพร่โดย: {project.publisher || 'สำนักพิมพ์นาวานีบุ๊คส์'}</div>
        </div>
        <div className="text-[9px] text-stone-500 leading-normal">
          สงวนลิขสิทธิ์ตามพระราชบัญญัติลิขสิทธิ์ พ.ศ. ๒๕๓๗ และที่แก้ไขเพิ่มเติม ห้ามมิให้ผู้ใดคัดลอก ทำซ้ำ ดัดแปลง หรือนำส่วนหนึ่งส่วนใดของหนังสือเล่มนี้ไปเผยแพร่โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากเจ้าของลิขสิทธิ์
        </div>
      </div>
    );
  }

  // 4. Dedication
  if (page.type === 'dedication') {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="space-y-3 max-w-[260px]">
          <span className="text-[11px] text-stone-400 italic">คำอุทิศ</span>
          <p className="text-xs text-stone-700 font-serif-thai italic leading-relaxed">
            {project.dedication || 'แด่ผู้อ่านทุกท่าน'}
          </p>
        </div>
      </div>
    );
  }

  // 5. Author Preface
  if (page.type === 'preface') {
    return (
      <div className="h-full flex flex-col p-4 space-y-4">
        <div className="text-center space-y-1 border-b border-stone-200 pb-2">
          <h3 className="font-bold text-sm font-serif-thai text-stone-900">คำนำนักเขียน</h3>
          <div className="text-[10px] text-stone-400">❖ ❖ ❖</div>
        </div>
        <div className="text-xs leading-relaxed text-stone-700 whitespace-pre-wrap font-sans-thai text-justify">
          {project.authorPreface}
        </div>
      </div>
    );
  }

  // 6. Table of Contents
  if (page.type === 'toc') {
    return (
      <div className="h-full flex flex-col p-4 space-y-4">
        <div className="text-center space-y-1 border-b border-stone-200 pb-2">
          <h3 className="font-bold text-sm font-serif-thai text-stone-900">สารบัญ (Contents)</h3>
          <div className="text-[10px] text-stone-400">✦ ✦ ✦</div>
        </div>
        <div className="space-y-2 text-xs font-sans-thai">
          {project.chapters.map((ch, idx) => (
            <div key={ch.id} className="flex items-center justify-between border-b border-stone-200/50 pb-1">
              <span className="font-medium text-stone-800 truncate max-w-[220px]">{ch.title}</span>
              <span className="font-mono text-stone-400 text-[11px]">{idx * 3 + 9}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-b border-stone-200/50 pb-1 pt-2">
            <span className="text-stone-600">เกี่ยวกับผู้เขียน</span>
            <span className="font-mono text-stone-400 text-[11px]">{project.chapters.length * 3 + 10}</span>
          </div>
        </div>
      </div>
    );
  }

  // 7. Dramatis Personae (Cast)
  if (page.type === 'cast') {
    return (
      <div className="h-full flex flex-col p-4 space-y-3">
        <div className="text-center space-y-1 border-b border-stone-200 pb-2">
          <h3 className="font-bold text-sm font-serif-thai text-stone-900">ตัวละครสำคัญ</h3>
          <div className="text-[10px] text-stone-400">❖ ❖ ❖</div>
        </div>
        <div className="space-y-2.5 overflow-hidden text-xs">
          {project.characters.slice(0, 4).map(char => (
            <div key={char.id} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">{char.name}</span>
                <span className="text-[10px] text-stone-500">{char.roleLabel}</span>
              </div>
              <p className="text-[10px] text-stone-600 line-clamp-2 leading-tight">
                {char.personality}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. Main Chapter Content
  if (page.type === 'chapter') {
    const isFirstPage = page.paragraphs && page.paragraphs.length > 0 && page.title;
    return (
      <div className="h-full flex flex-col justify-between text-justify">
        <div className="space-y-3">
          {/* Chapter Heading with Ornaments on the opening page */}
          {isFirstPage && (
            <div className="text-center space-y-2 pt-2 pb-4">
              {config.showOrnaments && (
                <div className="text-stone-400 text-xs tracking-widest">❖ ✦ ❖</div>
              )}
              <h2 className="text-base font-bold font-serif-thai text-stone-900 tracking-tight">
                {page.title}
              </h2>
              <div className="w-10 h-0.5 bg-stone-300 mx-auto" />
            </div>
          )}

          {/* Paragraphs */}
          <div className="space-y-3 font-sans-thai">
            {page.paragraphs?.map((p: string, pIdx: number) => {
              const isFirstParagraph = isFirstPage && pIdx === 0;

              return (
                <p
                  key={pIdx}
                  style={{
                    textIndent: isFirstParagraph && config.showDropCaps ? '0' : `${config.firstLineIndentCm}cm`,
                  }}
                  className="leading-relaxed text-stone-800"
                >
                  {isFirstParagraph && config.showDropCaps && p.length > 0 ? (
                    <>
                      <span className="float-left text-3xl font-bold font-serif-thai text-stone-900 leading-none mr-2 mt-1">
                        {p[0]}
                      </span>
                      {p.slice(1)}
                    </>
                  ) : (
                    p
                  )}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 9. About Author
  if (page.type === 'about_author') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
        <div className="w-16 h-16 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-xl text-stone-700 font-serif-thai">
          {project.author[0]}
        </div>
        <h3 className="font-bold text-sm font-serif-thai text-stone-900">{project.author}</h3>
        <p className="text-xs text-stone-600 leading-relaxed font-sans-thai max-w-[240px]">
          {project.authorBio || 'นักเขียนนวนิยายผู้รักในการสร้างสรรค์โลกและตัวละครอันมีชีวิต'}
        </p>
      </div>
    );
  }

  // 10. Back Cover
  if (page.type === 'back_cover') {
    return (
      <div className="h-full flex flex-col justify-between p-6 border-4 border-amber-900/20 bg-stone-100 rounded-sm text-stone-800">
        <div className="space-y-3 pt-4">
          <div className="text-[10px] text-amber-800 tracking-wider uppercase font-semibold text-center">
            {project.title}
          </div>
          <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap font-sans-thai text-justify">
            {project.backCoverBlurb || project.synopsis}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-300 pt-3 text-[10px] text-stone-500">
          <div>
            <div>หมวด: นวนิยาย / วรรณกรรม</div>
            <div>ราคา ๓๒๐ บาท</div>
          </div>
          <div className="text-right font-mono">
            <div>ISBN {project.isbn || '978-616-XXXX-XX-X'}</div>
            <div className="tracking-widest">||||| | |||| |||||</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
