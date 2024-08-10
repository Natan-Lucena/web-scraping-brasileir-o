export default function isValidPhone(phone: string): boolean {
  return /^\d{9}$/.test(phone);
}
