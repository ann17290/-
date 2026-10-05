import { SpellCheckIssue } from '../types/novel';

// Common Thai Misspelled Words Dictionary
export const COMMON_THAI_ERRORS: Record<string, { correct: string; reason: string }> = {
  'กระเพรา': { correct: 'กะเพรา', reason: 'คำว่า กะเพรา ไม่มี ร ควบกล้ำ' },
  'กะเพาะ': { correct: 'กระเพาะ', reason: 'อวัยวะภายในต้องมี ร ควบกล้ำ (กระเพาะ)' },
  'กะทะ': { correct: 'กระทะ', reason: 'ภาชนะทำอาหารต้องมี ร ควบกล้ำ (กระทะ)' },
  'กระพริบ': { correct: 'กะพริบ', reason: 'กะพริบตา ไม่มี ร ควบกล้ำที่คำว่า กะ' },
  'กระโหลก': { correct: 'กะโหลก', reason: 'กะโหลกศีรษะ ไม่มี ร ควบกล้ำที่คำว่า กะ' },
  'อนุญาติ': { correct: 'อนุญาต', reason: 'อนุญาต ไม่ต้องมีสระอิ (ญาติ ที่มีสระอิต้องเป็นเครือญาติ)' },
  'นะค่ะ': { correct: 'นะคะ', reason: 'คำว่า "นะ" ไม่ใช้รูปวรรณยุกต์เอกคู่กับ "ค่ะ" ต้องเขียนว่า "นะคะ"' },
  'สังเกตุ': { correct: 'สังเกต', reason: 'สังเกต ไม่มีสระอุ ที่ ต' },
  'ผูกพันธ์': { correct: 'ผูกพัน', reason: 'ความผูกพัน ไม่มี ธ์ (พันธุ์ ที่มี ธุ์ หมายถึง พืชพันธุ์)' },
  'ลายเซ็นต์': { correct: 'ลายเซ็น', reason: 'ลายเซ็น ไม่มี ต การันต์' },
  'เซ็นต์ชื่อ': { correct: 'เซ็นชื่อ', reason: 'เซ็นชื่อ ไม่ต้องมี ต การันต์' },
  'โอกาศ': { correct: 'โอกาส', reason: 'โอกาส สะกดด้วย ส เสือ' },
  'กระทันหัน': { correct: 'กะทันหัน', reason: 'กะทันหัน ไม่มี ร ควบกล้ำที่คำว่า กะ' },
  'สัมนา': { correct: 'สัมมนา', reason: 'สัมมนา ต้องมี ม ม้า 2 ตัว' },
  'ปรากฎ': { correct: 'ปรากฏ', reason: 'ปรากฏ สะกดด้วย ฏ ปฏัก' },
  'หลงไหล': { correct: 'หลงใหล', reason: 'หลงใหล ใช้สระไอไม้ม้วน (ใ)' },
  'คลีนิก': { correct: 'คลินิก', reason: 'ราชบัณฑิตยสภาสะกดว่า คลินิก (สระอิ)' },
  'ไอศครีม': { correct: 'ไอศกรีม', reason: 'คำทับศัพท์ทางการเขียน ไอศกรีม (ก ไก่)' },
  'ซีรี่ส์': { correct: 'ซีรีส์', reason: 'ซีรีส์ ไม่ต้องใส่ไม้เอก' },
  'ปราถนา': { correct: 'ปรารถนา', reason: 'ปรารถนา มี ร เรือ ก่อน ถ ถุง' },
  'พิธีรีตรอง': { correct: 'พิธีรีตอง', reason: 'พิธีรีตอง ไม่มี ร ควบกล้ำที่คำว่า ตอง' },
  'ศรีษะ': { correct: 'ศีรษะ', reason: 'ศีรษะ สระอีอยู่บน ศ ศาลา' },
  'มุขดา': { correct: 'มุกดา', reason: 'มุกดา สะกดด้วย ก ไก่' },
  'มุขตลก': { correct: 'มุกตลก', reason: 'มุกตลก สะกดด้วย ก ไก่' },
  'รสชาด': { correct: 'รสชาติ', reason: 'รสชาติ สะกดด้วย ต เต่า สระอิ' },
  'รังเกลียด': { correct: 'รังเกียจ', reason: 'รังเกียจ สะกดด้วย จ จาน' },
  'อิริยาบท': { correct: 'อิริยาบถ', reason: 'อิริยาบถ สะกดด้วย ถ ถุง' },
  'ผลัดวันประกันพรุ่ง': { correct: 'ผัดวันประกันพรุ่ง', reason: 'ผัดวันประกันพรุ่ง ใช้ ผัด (ไม่มี ล ลิง)' },
  'พิธีพิถัน': { correct: 'พิถีพิถัน', reason: 'พิถีพิถัน ใช้ ถ ถุง ทั้งสองพยางค์' },
  'เวทย์มนต์': { correct: 'เวทมนตร์', reason: 'เวทมนตร์ ใช้ ท ทหาร และ ตร์' },
  'เวทมนต์': { correct: 'เวทมนตร์', reason: 'เวทมนตร์ ถูกต้องตามพจนานุกรมต้องมี ร การันต์ด้วย' },
  'ทนุถนอม': { correct: 'ทะนุถนอม', reason: 'ทะนุถนอม มีสระอะที่ ทะ' },
  'กาละเทศะ': { correct: 'กาลเทศะ', reason: 'กาลเทศะ ไม่มีสระอะที่ กาล' },
  'ประนาม': { correct: 'ประณาม', reason: 'ประณาม ใช้ ณ เณร' },
  'เอนกประสงค์': { correct: 'อเนกประสงค์', reason: 'อเนกประสงค์ ใช้ อ อ่าง สระเอ ตามหลัง' },
  'โลกาภิวัฒน์': { correct: 'โลกาภิวัตน์', reason: 'โลกาภิวัตน์ ใช้ ต เต่า น หนู การันต์' },
  'ปาฏิหารย์': { correct: 'ปาฏิหาริย์', reason: 'ปาฏิหาริย์ มีสระอิ บน ร เรือ' },
  'เบญจเพศ': { correct: 'เบญจเพส', reason: 'เบญจเพส (อายุ 25 ปี) ใช้ ส เสือ' },
  'ลายมือชื่อ': { correct: 'ลายเซ็น', reason: 'คำนิยมในวรรณกรรมมักใช้ ลายเซ็น หรือ ลายมือ' },
  'หงอยเหงา': { correct: 'หงอยเหงา', reason: 'เขียนถูกต้องแล้ว' },
};

/**
 * Calculates detailed writing statistics for Thai & multilingual text.
 */
export function calculateTextStats(text: string) {
  if (!text || text.trim() === '') {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      estimatedPages: 0,
    };
  }

  const rawLength = text.length;
  const noSpacesLength = text.replace(/\s/g, '').length;
  
  // Approximate Thai words:
  // In Thai publishing, word count is estimated through syllable/character density
  // (average Thai word is ~4.2 characters excluding tone marks) + standard latin word separation
  const latinWords = (text.match(/[a-zA-Z0-9_-]+/g) || []).length;
  const thaiTextOnly = text.replace(/[a-zA-Z0-9_\s]/g, '');
  // Thai characters without combining vowels and tone marks for word estimation
  const thaiBaseChars = thaiTextOnly.replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, '').length;
  const thaiWordsEstimated = Math.ceil(thaiBaseChars / 3.4);
  const totalWords = Math.max(1, thaiWordsEstimated + latinWords);

  // Paragraphs
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0).length;

  // Reading time (approx 200 words per minute for Thai fiction)
  const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

  // Estimated standard Thai novel paperback pages (A5 size, 16pt font, ~350 words or 1,100 characters per page)
  const estimatedPages = Number((totalWords / 350).toFixed(1));

  return {
    words: totalWords,
    characters: rawLength,
    charactersNoSpaces: noSpacesLength,
    paragraphs: paragraphs || 1,
    readingTimeMinutes,
    estimatedPages: estimatedPages < 0.1 ? 0.1 : estimatedPages,
  };
}

/**
 * Checks text for common Thai spelling mistakes, repeated words, and typography rules.
 */
export function checkThaiSpelling(text: string): SpellCheckIssue[] {
  const issues: SpellCheckIssue[] = [];
  if (!text) return issues;

  // 1. Common Thai Misspelling Lookup
  for (const [wrongWord, info] of Object.entries(COMMON_THAI_ERRORS)) {
    if (wrongWord === info.correct) continue;

    let searchIndex = 0;
    while (searchIndex < text.length) {
      const foundIdx = text.indexOf(wrongWord, searchIndex);
      if (foundIdx === -1) break;

      issues.push({
        id: `spelling-${foundIdx}-${wrongWord}`,
        word: wrongWord,
        suggested: info.correct,
        reason: info.reason,
        type: 'spelling',
        index: foundIdx,
        length: wrongWord.length,
      });

      searchIndex = foundIdx + wrongWord.length;
    }
  }

  // 2. Consecutive Repeated Words (คำซ้ำติดกัน เช่น "และ และ", "เขา เขา")
  const wordsWithIndex: { word: string; index: number }[] = [];
  // Tokenize thai phrases or spaces
  const regex = /([ก-๙a-zA-Z]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    wordsWithIndex.push({
      word: match[1],
      index: match.index,
    });
  }

  for (let i = 0; i < wordsWithIndex.length - 1; i++) {
    const current = wordsWithIndex[i];
    const next = wordsWithIndex[i + 1];

    if (current.word === next.word && current.word.length >= 2) {
      // Check distance: only if separated by space
      const gap = text.substring(current.index + current.word.length, next.index);
      if (/^\s+$/.test(gap)) {
        issues.push({
          id: `repetition-${current.index}-${current.word}`,
          word: `${current.word} ${next.word}`,
          suggested: current.word,
          reason: `พบคำซ้ำติดกัน ("${current.word}") อาจเป็นข้อผิดพลาดจากการพิมพ์ซ้ำ`,
          type: 'repetition',
          index: current.index,
          length: next.index + next.word.length - current.index,
        });
      }
    }
  }

  // 3. Maiyamok (ๆ) Spacing Check (หลักภาษาไทย ไม้ยมกควรเคาะวรรคหน้าและหลัง)
  const maiyamokRegex = /([^ \n])ๆ|ๆ([^ \n.,!?\"\'\)])/g;
  let maiMatch;
  while ((maiMatch = maiyamokRegex.exec(text)) !== null) {
    const index = maiMatch.index;
    issues.push({
      id: `spacing-maiyamok-${index}`,
      word: maiMatch[0],
      suggested: maiMatch[0].replace('ๆ', ' ๆ '),
      reason: 'ตามหลักวรรณศิลป์และการพิมพ์ไทย ไม้ยมก (ๆ) ควรเคาะวรรคทั้งหน้าและหลัง',
      type: 'spacing',
      index: index,
      length: maiMatch[0].length,
    });
  }

  // Sort issues by index
  return issues.sort((a, b) => a.index - b.index);
}
