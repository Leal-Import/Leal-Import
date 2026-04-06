import { describe, test, expect } from 'vitest';
import { sanitizeHTMLInput, sanitizeURLParam, sanitizeURLNumber, isHTMLSafe, escapeHTML } from './sanitizer.js';

describe('sanitizer utilities', () => {
    describe('sanitizeHTMLInput', () => {
        test('escapes script-like html', () => {
            expect(sanitizeHTMLInput('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
        });

        test('escapes img onerror attack', () => {
            const malicious = '<img src=x onerror="alert(1)">';
            const result = sanitizeHTMLInput(malicious);
            // Everything is escaped, so no raw HTML tags or attributes remain
            expect(result).not.toContain('<img');
            expect(result).toContain('&lt;');
        });

        test('escapes svg onclick attack', () => {
            const malicious = '<svg onclick="alert(1)">';
            const result = sanitizeHTMLInput(malicious);
            expect(result).not.toContain('<svg');
            expect(result).toContain('&lt;');
        });

        test('handles null and undefined safely', () => {
            expect(sanitizeHTMLInput(null)).toBe('');
            expect(sanitizeHTMLInput(undefined)).toBe('');
        });

        test('handles non-string types', () => {
            expect(sanitizeHTMLInput(123)).toBe('');
            expect(sanitizeHTMLInput({})).toBe('');
            expect(sanitizeHTMLInput([])).toBe('');
        });

        test('preserves safe text', () => {
            expect(sanitizeHTMLInput('Hola Mundo')).toBe('Hola Mundo');
            expect(sanitizeHTMLInput('123-456')).toBe('123-456');
        });

        test('escapes dangerous chars', () => {
            expect(sanitizeHTMLInput('<>&')).toBe('&lt;&gt;&amp;');
            expect(sanitizeHTMLInput('<')).toBe('&lt;');
            expect(sanitizeHTMLInput('>')).toBe('&gt;');
            expect(sanitizeHTMLInput('&')).toBe('&amp;');
        });
    });

    describe('sanitizeURLParam', () => {
        test('trims and sanitizes string', () => {
            expect(sanitizeURLParam('  hola  ')).toBe('hola');
            expect(sanitizeURLParam('  <script>  ')).toContain('&lt;');
        });

        test('returns default for empty string', () => {
            expect(sanitizeURLParam('', 'def')).toBe('def');
            expect(sanitizeURLParam('   ', 'default')).toBe('default');
        });

        test('returns default for null/undefined', () => {
            expect(sanitizeURLParam(null, 'def')).toBe('def');
            expect(sanitizeURLParam(undefined, 'def')).toBe('def');
        });

        test('escapes XSS in URL param', () => {
            const xss = '<script>alert("XSS")</script>';
            const result = sanitizeURLParam(xss, 'safe');
            expect(result).not.toContain('<script>');
            expect(result).toContain('&lt;');
        });

        test('handles special characters in names', () => {
            const name = 'O\'Brien & Co. <Ltd>';
            const result = sanitizeURLParam(name, 'default');
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        test('returns empty string by default when no default provided', () => {
            expect(sanitizeURLParam('')).toBe('');
            expect(sanitizeURLParam(null)).toBe('');
        });
    });

    describe('sanitizeURLNumber', () => {
        test('converts string to number', () => {
            expect(sanitizeURLNumber('123')).toBe(123);
            expect(sanitizeURLNumber('45.67')).toBe(45.67);
        });

        test('returns default for invalid number', () => {
            expect(sanitizeURLNumber('abc', 42)).toBe(42);
            expect(sanitizeURLNumber('xyz', 99)).toBe(99);
        });

        test('parses leading digits in string', () => {
            // parseFloat extracts leading digits: '12abc' -> 12 which is valid
            expect(sanitizeURLNumber('12abc')).toBe(12);
        });

        test('handles negative numbers', () => {
            expect(sanitizeURLNumber('-100')).toBe(-100);
            expect(sanitizeURLNumber('-45.5')).toBe(-45.5);
        });

        test('handles zero', () => {
            expect(sanitizeURLNumber('0')).toBe(0);
            expect(sanitizeURLNumber('0.0')).toBe(0);
        });

        test('returns default for null/undefined', () => {
            expect(sanitizeURLNumber(null, 50)).toBe(50);
            expect(sanitizeURLNumber(undefined, 50)).toBe(50);
        });

        test('uses 0 as default if not provided', () => {
            expect(sanitizeURLNumber('bad')).toBe(0);
            expect(sanitizeURLNumber(null)).toBe(0);
        });

        test('handles scientific notation', () => {
            expect(sanitizeURLNumber('1e3')).toBe(1000);
            expect(sanitizeURLNumber('1e-2')).toBe(0.01);
        });

        test('returns default for Infinity', () => {
            expect(sanitizeURLNumber('Infinity', 10)).toBe(10);
        });
    });

    describe('isHTMLSafe', () => {
        test('blocks angle brackets', () => {
            expect(isHTMLSafe('<div>')).toBe(false);
            expect(isHTMLSafe('hello<world')).toBe(false);
            expect(isHTMLSafe('test>test')).toBe(false);
        });

        test('blocks double quotes', () => {
            expect(isHTMLSafe('He said "hello"')).toBe(false);
        });

        test('blocks single quotes', () => {
            expect(isHTMLSafe("It's a test")).toBe(false);
        });

        test('blocks ampersand', () => {
            expect(isHTMLSafe('Tom & Jerry')).toBe(false);
        });

        test('allows safe text', () => {
            expect(isHTMLSafe('safe text')).toBe(true);
            expect(isHTMLSafe('123-456')).toBe(true);
            expect(isHTMLSafe('email@example.com')).toBe(true);
        });

        test('handles null/undefined as safe', () => {
            expect(isHTMLSafe(null)).toBe(true);
            expect(isHTMLSafe(undefined)).toBe(true);
        });

        test('handles empty string as safe', () => {
            expect(isHTMLSafe('')).toBe(true);
        });

        test('detects common HTML entities', () => {
            expect(isHTMLSafe('&nbsp;')).toBe(false);
            expect(isHTMLSafe('&lt;')).toBe(false);
        });
    });

    describe('escapeHTML', () => {
        test('escapes ampersand', () => {
            expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
        });

        test('escapes angle brackets', () => {
            expect(escapeHTML('<div>content</div>')).toBe('&lt;div&gt;content&lt;/div&gt;');
        });

        test('escapes quotes', () => {
            expect(escapeHTML('He said "hello"')).toBe('He said &quot;hello&quot;');
        });

        test('escapes single quotes', () => {
            expect(escapeHTML("It's fine")).toBe('It&#39;s fine');
        });

        test('escapes all dangerous chars together', () => {
            expect(escapeHTML('<script>alert("XSS")</script>')).toBe(
                '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
            );
        });

        test('preserves safe text', () => {
            expect(escapeHTML('Hello World 123')).toBe('Hello World 123');
        });

        test('handles null/undefined', () => {
            expect(escapeHTML(null)).toBe('');
            expect(escapeHTML(undefined)).toBe('');
        });

        test('handles numbers', () => {
            expect(escapeHTML(123)).toBe('123');
            expect(escapeHTML(45.67)).toBe('45.67');
        });

        test('handles empty string', () => {
            expect(escapeHTML('')).toBe('');
        });

        test('handles mixed content', () => {
            expect(escapeHTML("O'Brien & Co. <Ltd>")).toBe(
                "O&#39;Brien &amp; Co. &lt;Ltd&gt;"
            );
        });
    });

    describe('integration tests', () => {
        test('sanitizeURLParam uses sanitizeHTMLInput internally', () => {
            const xss = '<img src=x onerror=alert(1)>';
            const result = sanitizeURLParam(xss);
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        test('escapeHTML and sanitizeHTMLInput handle different cases', () => {
            const input = '<div class="test">';
            const escaped = escapeHTML(input);
            const sanitized = sanitizeHTMLInput(input);
            // Both should prevent execution but may differ in formatting
            expect(escaped).not.toContain('<div');
            expect(sanitized).not.toContain('<div');
        });

        test('isHTMLSafe complements sanitization', () => {
            const unsafeInput = 'Hello <world>';
            expect(isHTMLSafe(unsafeInput)).toBe(false);
            const sanitized = sanitizeHTMLInput(unsafeInput);
            // After sanitization, it should be safe to display
            expect(sanitized).toContain('&lt;');
        });
    });
});
