import xss from 'xss';

export const sanitize = (input) => {
    if (!input) return '';
    
    // Convert to string if not already
    const str = String(input);
    
    // Remove any HTML tags and sanitize
    return xss(str.trim());
}; 