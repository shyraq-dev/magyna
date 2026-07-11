// Қарапайым автоматты сүзгі: балағат сөздер тізіміне сәйкес келген
// сөздерді жұлдызшамен ауыстырады. Толық емес тізім — жоба иесі
// өз тілдік нормаларына сай толықтыра алады.

const BLOCKLIST = [
  'ебан', 'сука', 'блять', 'хуй', 'пизд', 'бляд', 'мудак',
  // қазақша балағат сөздердің негізгі түбірлерін осында толықтырыңыз
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKLIST.some((word) => lower.includes(word));
}

export function filterProfanity(text: string): string {
  let result = text;
  for (const word of BLOCKLIST) {
    const re = new RegExp(word, 'gi');
    result = result.replace(re, (match) => '*'.repeat(match.length));
  }
  return result;
}
