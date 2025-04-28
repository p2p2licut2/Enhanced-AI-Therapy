import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Validează complexitatea parolei conform cerințelor de securitate
 * @param {string} password - Parola de validat
 * @returns {Object} - Rezultatul validării și mesaje de eroare
 */
export function validatePasswordComplexity(password) {
  const validation = {
    isValid: false,
    length: password.length >= 10,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    message: '',
  };
  
  validation.isValid = 
    validation.length && 
    validation.hasUppercase && 
    validation.hasLowercase && 
    validation.hasDigit && 
    validation.hasSpecial;
  
  if (!validation.isValid) {
    if (!validation.length) {
      validation.message = 'Parola trebuie să aibă cel puțin 10 caractere';
    } else if (!validation.hasUppercase) {
      validation.message = 'Parola trebuie să conțină cel puțin o literă mare';
    } else if (!validation.hasLowercase) {
      validation.message = 'Parola trebuie să conțină cel puțin o literă mică';
    } else if (!validation.hasDigit) {
      validation.message = 'Parola trebuie să conțină cel puțin o cifră';
    } else if (!validation.hasSpecial) {
      validation.message = 'Parola trebuie să conțină cel puțin un caracter special';
    }
  }
  
  return validation;
}

/**
 * Generează o parolă aleatorie cu complexitate ridicată
 * @param {number} length - Lungimea parolei (minim 10)
 * @returns {string} - Parola generată
 */
export function generateSecurePassword(length = 16) {
  const actualLength = Math.max(length, 10); // Asigură minim 10 caractere
  
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  // Asigură cel puțin un caracter din fiecare categorie
  let password = '';
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += digits.charAt(Math.floor(Math.random() * digits.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Completează cu caractere aleatorii din toate categoriile
  const allChars = upperChars + lowerChars + digits + specialChars;
  for (let i = 4; i < actualLength; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Amestecă caracterele pentru a evita un pattern predictibil
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Generează un hash pentru parolă folosind bcrypt
 * @param {string} password - Parola în text clar
 * @returns {Promise<string>} - Hash-ul generat
 */
export async function hashPassword(password) {
  const saltRounds = 12; // Număr de iterații pentru algoritm
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compară o parolă în text clar cu un hash stocat
 * @param {string} password - Parola în text clar
 * @param {string} hashedPassword - Hash-ul stocat
 * @returns {Promise<boolean>} - True dacă parola se potrivește
 */
export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generează un token criptografic sigur
 * @param {number} length - Lungimea token-ului în bytes
 * @returns {string} - Token-ul generat în format hexadecimal
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Verifică dacă un token este încă valid (nu a expirat)
 * @param {Date} expiryDate - Data de expirare a token-ului
 * @returns {boolean} - True dacă token-ul este încă valid
 */
export function isTokenValid(expiryDate) {
  return new Date() < expiryDate;
}

/**
 * Normalizează un email (lowercase, trim, etc.)
 * @param {string} email - Email-ul de normalizat
 * @returns {string} - Email-ul normalizat
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}