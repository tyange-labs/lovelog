export type Theme = 'light' | 'dark';

// index.html의 인라인 스크립트도 같은 키를 읽어 첫 화면부터 저장된 테마로 그린다.
export const THEME_STORAGE_KEY = 'lovelog-theme';

export function currentTheme(): Theme {
	const chosen = document.documentElement.dataset.theme;
	if (chosen === 'light' || chosen === 'dark') {
		return chosen;
	}
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// 저장이 막힌 브라우저에선 이번 방문에만 적용된다.
	}
}
