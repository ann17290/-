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
    let msg = errorData.error;
    if (typeof msg === 'object') {
      msg = msg.message || JSON.stringify(msg);
    }
    if (typeof msg === 'string') {
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error?.message) msg = parsed.error.message;
      } catch {}
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        msg = 'ขณะนี้เซิร์ฟเวอร์ AI มีผู้ใช้งานหนาแน่นชั่วคราว (High Demand) กรุณากดปุ่มลองใหม่อีกครั้ง';
      }
    }
    throw new Error(msg || `เซิร์ฟเวอร์เกิดข้อผิดพลาดสถานะ ${response.status}`);
  }

  const data = await response.json();
  return data.result || '';
}
