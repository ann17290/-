export interface AIOptions {
  style?: 'elegant' | 'crisp' | 'emotional' | 'historical' | 'modern';
  focus?: 'depth' | 'sensory' | 'action' | 'tension' | string;
  timeOfDay?: string;
  mood?: string;
  direction?: string;
  conflict?: string;
}

export interface AIContext {
  treatment?: string;
  characters?: string;
  scene?: string;
}

export async function requestAIAssist(
  action: 'polish' | 'expand' | 'describe_scene' | 'continue' | 'dialogue' | 'proofread' | 'analyze_story' | 'parse_and_link' | 'expand_note',
  text: string,
  context?: AIContext,
  options?: AIOptions
): Promise<string> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      text,
      context,
      options,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `เซิร์ฟเวอร์เกิดข้อผิดพลาดสถานะ ${response.status}`);
  }

  const data = await response.json();
  return data.result || '';
}
