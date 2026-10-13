/**
 * Pronounces Chinese text using browser's SpeechSynthesis API.
 * Supports both Cantonese (zh-HK) and Mandarin (zh-CN) for Hong Kong primary students.
 */

export type ChineseDialect = 'zh-HK' | 'zh-CN';

export function speakChinese(text: string, lang: ChineseDialect = 'zh-HK'): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text: remove blanks like "____"
    const cleaned = text.replace(/_+/g, ' 什麼 ').trim();
    if (!cleaned) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for primary school students

    // Look for matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').includes(lang.toLowerCase())) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('zh'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
