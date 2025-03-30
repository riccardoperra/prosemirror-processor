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

import { tanstackConfig } from "@tanstack/config/eslint";
import unusedImports from "eslint-plugin-unused-imports";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tanstackConfig,
  {
    name: "tanstack/temp",
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-case-declarations": "off",
      "no-shadow": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "unused-imports/no-unused-imports": "warn",
    },
  },
];
