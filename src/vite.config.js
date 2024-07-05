import { normalizePath } from 'vite'
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    if (command === "serve") {
        return {
            // dev specific config
        };
    } else {
        // command === 'build'

        return {
            base: "/checkers/",
            build: {
                emptyOutDir: true,
                outDir: "../_site",
            },
            plugins: [
                viteStaticCopy({
                    targets: [
                        {
                            src: normalizePath("assets/board/*"),
                            dest: "./assets/board",
                        },
                        {
                            src: normalizePath("assets/menu/*"),
                            dest: "./assets/menu",
                        },
                    ],
                }),
            ],
        };
    }
});
