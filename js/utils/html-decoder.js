export function decodeHtmlEntities(text) {
    if (!text) return text;
    // We can use the browser's DOM parser to accurately decode entities
    // without maintaining a massive regex dictionary.
    
    // In a test environment (Node without DOM), fallback to simple regex
    if (typeof document === 'undefined') {
        return text
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }

    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
