import { defineConfig } from 'vitest/config';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		tanstackRouter({ target: 'react', autoCodeSplitting: true }),
		viteReact(),
		tailwindcss()
	],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{ts,tsx}']
	}
});
