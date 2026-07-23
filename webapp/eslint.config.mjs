import { defineConfig } from "eslint/config";
import pluginSecurity from "eslint-plugin-security";

export default defineConfig([
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest"
    },
    plugins: {
      security: pluginSecurity
    },
    rules: {
      ...pluginSecurity.configs.recommended.rules
    }
  }
]);
