/**
 * Utility functions for the application
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Extract email mentions from text
 * Pattern: @email@domain.com
 * @param {string} text - Text to extract mentions from
 * @returns {string[]} - Array of mentioned email addresses
 */
const extractMentions = (text) => {
  const mentionRegex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

export { isValidEmail, extractMentions };
