import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/trash-gallery.ts"),
			name: "trash-gallery",
			fileName: "trash-gallery"
		}
	}
})
