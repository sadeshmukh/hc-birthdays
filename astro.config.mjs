// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

export default defineConfig({
	output: "server",
	security: {
		checkOrigin: false,
	},
	server: {
		host: "0.0.0.0",
		port: 4321,
	},
	vite: {
		plugins: [tailwindcss()],
	},
	adapter: node({
		mode: "standalone",
	}),
});
