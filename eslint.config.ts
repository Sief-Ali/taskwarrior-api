import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import pluginJs from '@eslint/js';

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  // Apply JavaScript recommended rules
  pluginJs.configs.recommended,
  {
    rules: {
        "no-unused-vars": "warn",
        "no-undef": "error"
    }
  },
  {
    ignores: ["dist/", "node_modules/", "build/", "tsconfig.json"]
  },
  {
    files: ["**/*.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ]
    }
  },
  {
    files: ["test/**/*.cjs"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
]);
