import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

console.log('PRIVATE_DYNAMIC', process.env.PRIVATE_DYNAMIC);
console.log('PUBLIC_DYNAMIC', process.env.PUBLIC_DYNAMIC);

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	build: {
		commonjsOptions: {
			include: [/@repo\/ui/, /node_modules/]
		}
	}
});
