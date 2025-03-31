/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Options } from "tsup";
import { defineConfig } from "tsup";

const config: Options[] = defineConfig([
  {
    name: "markdown",
    clean: true,
    entry: {
      index: "./src/index.ts",
    },
    outDir: "./dist",
    bundle: true,
    dts: true,
    format: "esm",
  },
]) as Options[];

export default config;
