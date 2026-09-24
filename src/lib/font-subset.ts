type Range = [number, number];

// "U+0020-007E, U+AC00, U+1F??" 같은 CSS unicode-range 값을 [시작, 끝] 목록으로 바꾼다.
export function parseUnicodeRange(value: string): Range[] {
	return value
		.split(',')
		.map((part) => part.trim().replace(/^u\+/i, ''))
		.filter(Boolean)
		.map((part): Range => {
			if (part.includes('?')) {
				return [
					Number.parseInt(part.replaceAll('?', '0'), 16),
					Number.parseInt(part.replaceAll('?', 'F'), 16)
				];
			}
			const [start, end = start] = part.split('-');
			return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
		});
}

export function coversAny(ranges: Range[], codePoints: Iterable<number>): boolean {
	for (const point of codePoints) {
		if (ranges.some(([start, end]) => point >= start && point <= end)) {
			return true;
		}
	}
	return false;
}

function familyOf(rule: CSSFontFaceRule): string {
	return rule.style.getPropertyValue('font-family').replaceAll(/["']/g, '').trim();
}

// 스타일시트의 상대 경로 url()을 절대 주소로 바꾼다 — 뽑아낸 규칙은 원래 시트 밖에서 읽힌다.
function absolutize(cssText: string, base: string): string {
	return cssText.replaceAll(/url\((["']?)([^"')]+)\1\)/g, (_match, _quote, url: string) => {
		return url.startsWith('data:') ? `url(${url})` : `url("${new URL(url, base).href}")`;
	});
}

export function readAsDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => resolve(String(reader.result)));
		reader.addEventListener('error', () => reject(reader.error));
		reader.readAsDataURL(blob);
	});
}

// 같은 조각을 다시 찍을 때 또 받지 않도록 Promise째로 둔다.
const fontDataCache = new Map<string, Promise<string>>();

function fontAsDataUrl(url: string): Promise<string> {
	let cached = fontDataCache.get(url);
	if (!cached) {
		cached = fetch(url, { mode: 'cors' })
			.then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
			.then(readAsDataUrl);
		cached.catch(() => fontDataCache.delete(url));
		fontDataCache.set(url, cached);
	}
	return cached;
}

async function inlineUrls(cssText: string): Promise<string> {
	const urls = [...cssText.matchAll(/url\("([^"]+)"\)/g)]
		.map((match) => match[1])
		.filter((url) => !url.startsWith('data:'));
	// 못 받은 조각은 원래 주소로 남아 그 글자만 시스템 글꼴로 떨어진다.
	const inlined = await Promise.all(urls.map((url) => fontAsDataUrl(url).catch(() => url)));
	return urls.reduce((result, url, index) => result.replace(url, inlined[index]), cssText);
}

// 카드에 실제로 쓰인 글자를 덮는 @font-face만 골라, 글꼴 파일을 data URL로 박아 넣은 CSS로
// 돌려준다. 찍은 결과는 SVG 이미지로 그려져 바깥 글꼴 파일을 읽지 못하므로 박아 넣어야 한다.
// 한글 웹폰트는 unicode-range로 수십~수백 조각으로 나뉘어 있어서 쓰인 조각만 받는다.
export async function embeddedFontCss(text: string, families: string[]): Promise<string> {
	const codePoints = new Set([...text].map((ch) => ch.codePointAt(0) ?? 0));
	const wanted = new Set(families);
	const rules: string[] = [];

	for (const sheet of document.styleSheets) {
		let cssRules: CSSRuleList;
		try {
			cssRules = sheet.cssRules;
		} catch {
			continue;
		}
		const base = sheet.href ?? document.baseURI;
		for (const rule of cssRules) {
			if (!(rule instanceof CSSFontFaceRule) || !wanted.has(familyOf(rule))) {
				continue;
			}
			const range = rule.style.getPropertyValue('unicode-range');
			if (range && !coversAny(parseUnicodeRange(range), codePoints)) {
				continue;
			}
			rules.push(absolutize(rule.cssText, base));
		}
	}

	return (await Promise.all(rules.map(inlineUrls))).join('\n');
}
