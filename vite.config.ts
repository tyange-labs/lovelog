import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	// vitest는 기본적으로 solid-js의 SSR 진입점을 잡아 컴포넌트가 반응하지 않는다.
	// browser 컨디션을 강제해 브라우저 빌드를 쓰게 한다.
	resolve: { tsconfigPaths: true, conditions: ['browser'] },
	plugins: [solid({ hot: false }), tailwindcss()],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{ts,tsx}']
	}
});
