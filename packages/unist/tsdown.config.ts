import { defineConfig, type UserConfig, type UserConfigFn } from "tsdown";

const config: UserConfig | UserConfigFn = defineConfig({
  name: "unist",
  entry: {
    index: "./src/index.ts",
    mdast: "./src/mdast/index.ts",
  },
  outDir: "./dist",
  dts: true,
  format: "esm",
});

export default config;
