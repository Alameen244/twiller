// Random password generator: uppercase and lowercase letters ONLY
// (no numbers, no special characters)
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Bytes at or above this value are skipped, so every letter is equally likely
// (256 is not divisible by 52, so a plain "% 52" would favour some letters).
const BYTE_LIMIT = 256 - (256 % LETTERS.length);

const randomLetters = (length) => {
  const result = [];
  while (result.length < length) {
    const bytes = new Uint8Array(length * 2);
    crypto.getRandomValues(bytes); // cryptographically secure, unlike Math.random()
    for (const byte of bytes) {
      if (byte < BYTE_LIMIT && result.length < length) {
        result.push(LETTERS[byte % LETTERS.length]);
      }
    }
  }
  return result.join('');
};

// Default 16 characters. The backend requires at least 8.
export const generateLettersPassword = (length = 16) => {
  const size = Math.max(length, 8);
  let password;
  // the result contains both an uppercase and a lowercase letter.
  do {
    password = randomLetters(size);
  } while (!/[A-Z]/.test(password) || !/[a-z]/.test(password));
  return password;
};
