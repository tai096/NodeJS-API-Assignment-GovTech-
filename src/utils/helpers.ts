/**
 * Utility functions for the application
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Extract email mentions from text
 * Pattern: @email@domain.com
 */
export const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]);
    }

    return mentions;
};
