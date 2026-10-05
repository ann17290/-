export type EditorTheme = 'dark' | 'sepia' | 'light';
export type EditorFont = 'serif' | 'sans';

export interface Character {
  id: string;
  name: string;
  alias?: string;
  role: 'protagonist' | 'deuteragonist' | 'antagonist' | 'supporting' | 'mentor' | 'comic_relief';
  roleLabel: string;
  age?: string;
  gender?: string;
  appearance: string;
  personality: string;
  goal: string;
  coreFlaw: string;
  backstory: string;
  speechHabits: string;
  color: string;
  avatarIcon: string;
}

export interface CharacterRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: string; // e.g. "คนรัก", "ศัตรูคู่อาฆาต", "พี่น้อง", "ลูกศิษย์"
  sentiment: 'positive' | 'negative' | 'neutral' | 'complex';
  description?: string;
}

export interface SettingLocation {
  id: string;
  name: string;
  type: string; // e.g. "วังหลวง", "ป่าโบราณ", "สำนักศึกษา", "เรือนลับ"
  atmosphere: string;
  visualSensory: string;
  audioSensory: string;
  scentSensory: string;
  tactileSensory: string;
  historyLore: string;
  rulesOrMagic: string;
}

export interface StoryBeat {
  id: string;
  act: 'Act 1' | 'Act 2' | 'Act 3';
  title: string;
  timing: string; // e.g. "บทนำ 0-10%", "จุดกึ่งกลาง 50%"
  description: string;
  chapterTarget?: string;
  completed: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  content: string;
  summary?: string;
  povCharacterId?: string;
  locationId?: string;
  targetWords: number;
  status: 'draft' | 'polishing' | 'completed';
  notes?: string;
}

export interface DiagramNode {
  id: string;
  title: string;
  type: 'character' | 'event' | 'location';
  x: number;
  y: number;
  characterId?: string;
  description?: string;
  color?: string;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'complex';
}

export interface BookTypesettingConfig {
  paperSize: 'A5' | 'B6' | 'Pocket';
  paperTone: 'cream' | 'white' | 'vintage';
  fontFamily: 'serif' | 'sans';
  fontSizePt: 13 | 14 | 15 | 16;
  lineSpacing: 1.4 | 1.6 | 1.8;
  firstLineIndentCm: number;
  gutterMarginMm: number;
  outerMarginMm: number;
  topMarginMm: number;
  bottomMarginMm: number;
  showRunningHeader: boolean;
  showRunningFooter: boolean;
  showDropCaps: boolean;
  showOrnaments: boolean;
  chapterStartSide: 'recto' | 'any'; // 'recto' means chapters always begin on right-hand page
}

export interface QuickNote {
  id: string;
  content: string;
  color: 'amber' | 'sky' | 'emerald' | 'rose' | 'purple';
  tags: string[]; // Free tags e.g. "บทสนทนาเด็ด", "ปริศนายาพิษ"
  characterIds?: string[]; // Linked character IDs
  chapterIds?: string[]; // Linked chapter IDs
  locationIds?: string[]; // Linked location IDs
  pinned?: boolean;
  createdAt: string;
}

export interface NovelProject {
  id: string;
  title: string;
  author: string;
  genre: string;
  logline: string;
  synopsis: string;
  theme: string;
  tone: string;
  publisher?: string;
  isbn?: string;
  publicationYear?: string;
  dedication?: string;
  authorPreface?: string;
  backCoverBlurb?: string;
  authorBio?: string;
  typesettingConfig?: Partial<BookTypesettingConfig>;
  chapters: Chapter[];
  characters: Character[];
  relationships: CharacterRelationship[];
  locations: SettingLocation[];
  storyBeats: StoryBeat[];
  diagramNodes: DiagramNode[];
  diagramEdges: DiagramEdge[];
  quickNotes?: QuickNote[];
  updatedAt: string;
}

export interface SpellCheckIssue {
  id: string;
  word: string;
  suggested: string;
  reason: string;
  type: 'spelling' | 'repetition' | 'spacing' | 'punctuation';
  index: number;
  length: number;
}
