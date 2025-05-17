import { defineConfig, type UserConfig, type UserConfigFn } from "tsdown";

const config: UserConfig | UserConfigFn = defineConfig({
  name: "markdown",
  entry: ["src/index.ts"],
  outDir: "./dist",
  dts: true,
  format: "esm",
});

export default config;
