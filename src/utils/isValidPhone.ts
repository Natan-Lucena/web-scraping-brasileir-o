export default function isValidPhone(phone: string): boolean {
  const cleanedPhone = phone.replace(/[\s-]/g, '');
  return /^\d{13}$/.test(cleanedPhone);
}
