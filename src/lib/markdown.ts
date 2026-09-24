import { Marked, marked } from 'marked';

marked.setOptions({
	gfm: true,
	breaks: false
});

export function renderMarkdown(markdown: string): string {
	return marked.parse(markdown, { async: false });
}

// 타임라인 미리보기는 본문 전체가 글 페이지로 가는 링크라, 본문 속 링크는 글자만 남긴다
// (링크 안에 링크를 넣을 수 없다). 원래 링크는 글 페이지에서 살아 있다.
const withoutLinks = new Marked({ gfm: true, breaks: false }).use({
	renderer: {
		link({ tokens }) {
			return this.parser.parseInline(tokens);
		}
	}
});

export function renderPreviewMarkdown(markdown: string): string {
	return withoutLinks.parse(markdown, { async: false });
}
