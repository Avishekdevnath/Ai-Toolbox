export const generateSecurePassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Ensure at least one character from each required type
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length)); // At least 1 uppercase
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length)); // At least 1 lowercase
  password += numbers.charAt(Math.floor(Math.random() * numbers.length)); // At least 1 number
  password += symbols.charAt(Math.floor(Math.random() * symbols.length)); // At least 1 symbol
  
  // Fill the rest with random characters
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 3) return { label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-100' };
  if (score < 5) return { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  if (score < 6) return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-100' };
  return { label: 'Very Strong', color: 'text-green-700', bgColor: 'bg-green-100' };
}; 