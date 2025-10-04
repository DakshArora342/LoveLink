import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'; // <-- Add this

export default defineConfig({
	base: "/",
	plugins: [
		react(),
		tailwindcss(),
	],
	define: {
		global: 'globalThis', // <-- Fix for 'global is not defined'
	},
	optimizeDeps: {
		include: ['sockjs-client'], // <-- Ensure it's properly bundled
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			plugins: [rollupNodePolyFill()], // <-- Polyfill for Node modules
		},
	},
	server: {
		port: 8080,
	},
});
