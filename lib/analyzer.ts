import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import { AnalysisResult, AnalysisError, Severity } from '@/types';

// Limit: 102KB (Gmail clipping limit)
const SIZE_LIMIT = 102 * 1024;

export async function analyzeHtml(html: string): Promise<AnalysisResult> {
    const errors: AnalysisError[] = [];
    const start = Date.now();

    // 1. Size Check
    const sizeInBytes = Buffer.byteLength(html, 'utf8');
    if (sizeInBytes > SIZE_LIMIT) {
        errors.push({
            id: 'size-limit',
            severity: 'critical',
            message: `HTML size (${(sizeInBytes / 1024).toFixed(2)}KB) exceeds Gmail's 102KB limit. content may be clipped.`,
        });
    }

    // Load Cheerio
    const $ = cheerio.load(html);

    // 2. Image Verification
    const images: { src: string; alt: string; width?: string; height?: string }[] = [];
    $('img').each((i, el) => {
        const src = $(el).attr('src') || '';
        const alt = $(el).attr('alt');
        const width = $(el).attr('width');
        const height = $(el).attr('height');

        images.push({ src, alt: alt || '', width, height });

        if (alt === undefined || alt === null) {
            errors.push({
                id: `img-no-alt-${i}`,
                severity: 'critical',
                message: 'Image tag is missing "alt" attribute.',
                tag: `<img src="${src.substring(0, 30)}..." ...>`,
            });
        } else if (alt.trim() === '') {
            errors.push({
                id: `img-empty-alt-${i}`,
                severity: 'warning',
                message: 'Image "alt" attribute is empty. Ensure this is intentional (e.g., decorative image).',
                tag: `<img src="${src.substring(0, 30)}..." alt="">`,
            });
        }
    });

    // 3. Link Verification (Extraction)
    const links: { href: string; text: string; status?: number }[] = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim() || '[Image/No Text]';
        links.push({ href, text });

        if (!href) {
            errors.push({
                id: `link-no-href-${i}`,
                severity: 'critical',
                message: 'Anchor tag is missing "href" attribute or is empty.',
                tag: `<a>${text.substring(0, 20)}...</a>`
            });
        }
    });

    // 4. Character Encoding Check (ISO-2022-JP / Shift_JIS compatibility)
    // We check if the string can be encoded to ISO-2022-JP without loss.
    // Method: Encode to ISO-2022-JP, then decode back. If different, we might have issues (though iconv-lite might handle replacements).
    // Better: Check for specific incompatible characters if known, or try to encode and catch errors?
    // iconv-lite usually replaces unrepresentable chars with '?'

    // A simple heuristic: try to encode. If we see replacement characters for things that weren't there, it's an issue.
    // However, identifying *which* character is hard.
    // Instead, let's scan for common forbidden characters / machine dependent characters.
    // JIS X 0208 level.
    // Common issues: ①, Ⅱ, ㈱, 髙, etc.

    const forbiddenChars = /[①-⑳Ⅰ-Ⅹ㍉-㍻㍼-㍿㈱-㏍]/;
    if (forbiddenChars.test(html)) {
        // Find matches for better reporting
        const matches = html.match(forbiddenChars);
        if (matches) {
            errors.push({
                id: 'forbidden-chars',
                severity: 'critical',
                message: `Detected potentially incompatible characters (Machine-dependent characters): ${matches[0]}...`,
                snippet: matches[0]
            });
        }
    }


    // Scoring Calculation
    // Base 100
    // Critical: -20
    // Warning: -5
    let score = 100;
    errors.forEach(e => {
        if (e.severity === 'critical') score -= 20;
        if (e.severity === 'warning') score -= 5;
    });
    if (score < 0) score = 0;

    return {
        score,
        sizeInBytes,
        errors,
        images,
        links
    };
}
