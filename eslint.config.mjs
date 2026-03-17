import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            globals: {
                ...globals.browser,
                Swiper: "readonly",
                Swal: "readonly",
                Chart: "readonly"
            },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            }
        },
        rules: {
            // ── CALIDAD DE CÓDIGO ──
            "no-debugger": "error",
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "no-duplicate-imports": "error",
            "no-unreachable": "error",
            "no-empty": "error",
            "no-extra-boolean-cast": "error",

            // ── BUENAS PRÁCTICAS ──
            "eqeqeq": ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
            "prefer-arrow-callback": "error",
            "func-style": ["error", "expression"],
            "no-param-reassign": "warn",
            "default-case": "error",
            "no-fallthrough": "error",
            "no-return-assign": "error",
            "no-sequences": "error",
            "no-throw-literal": "error",
            "radix": "error",
            "yoda": "error",

            // ── VARIABLES ──
            "no-shadow": "warn",

            // ── ASYNC/AWAIT ──
            "no-async-promise-executor": "error",
            "require-await": "error",
            "no-await-in-loop": "warn",
            "no-promise-executor-return": "error",

            // ── SEGURIDAD ──
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",
            "no-script-url": "error",

            // ── ESTILO Y CONSISTENCIA ──
            "indent": ["error", 4],
            "semi": ["error", "always"],
            "comma-dangle": ["error", "never"],
            "eol-last": ["error", "always"],
            "no-trailing-spaces": "error",
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "keyword-spacing": ["error", { before: true, after: true }],
            "space-infix-ops": "error",
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "arrow-spacing": ["error", { before: true, after: true }]
        }
    }
]);
