const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Email немесе құпия сөз қате.",
  "Email not confirmed": "Email расталмаған. Поштаңызды тексеріңіз.",
  "User already registered": "Бұл email-мен тіркелгі бар. Кіріп көріңіз.",
  "A user with this email address has already been registered":
    "Бұл email бойынша тіркелгі бар. Кіріп көріңіз.",
  "Password should be at least 6 characters":
    "Құпия сөз кем дегенде 6 таңбадан тұруы керек.",
  "Signup requires a valid password":
    "Жарамды құпия сөз енгізіңіз.",
  "Token has expired or is invalid":
    "Сілтеменің мерзімі өтіп кеткен немесе жарамсыз.",
  "Unable to validate email address: invalid format":
    "Email пішімі дұрыс емес.",
  "For security purposes, you can only request this after":
    "Қауіпсіздік үшін, кейін қайталаңыз.",
  "Email rate limit exceeded":
    "Тым жиі сұраныс жіберілді. Кейін қайталаңыз.",
  "only an email address or phone number should be provided on signup":
    "Тіркелу үшін тек email немесе телефон нөмірі қажет.",
  "New password should be different from the old password":
    "Жаңа құпия сөз ескісінен өзгеше болуы керек.",
  "User not found": "Пайдаланушы табылмады.",
};

export function toKazakhError(msg: string): string {
  for (const [en, kz] of Object.entries(ERROR_MAP)) {
    if (msg.includes(en)) return kz;
  }
  // Fall back to the original message — better than silence.
  return msg;
}
