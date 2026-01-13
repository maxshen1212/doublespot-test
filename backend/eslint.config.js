// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      "prisma/migrations/**",
    ],
  },

  // JS 基本規則
  js.configs.recommended,

  // TypeScript 規則（不做 type-check，速度快）
  ...tseslint.configs.recommended,
  prettier,
];
