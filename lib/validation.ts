export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Пароль кемінде 8 таңбадан тұруы керек.';
  if (!/[A-ZӘҒҚҢӨҰҮҺІ]/.test(password)) return 'Парольде кемінде бір бас әріп болуы керек.';
  if (!/[0-9]/.test(password)) return 'Парольде кемінде бір сан болуы керек.';
  return null;
}
