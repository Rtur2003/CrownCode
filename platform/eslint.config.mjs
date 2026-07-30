// Next 16'da `next lint` kaldirildi; ESLint 9 flat config kullanilir.
// Kurallar eski .eslintrc.json'dan bire bir tasindi.
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'next-env.d.ts',
    '**/*.config.js',
  ]),

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Testler ve scriptler: konsol cikti ve any daha serbest
  {
    files: ['__tests__/**', 'scripts/**', 'jest.setup.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Node build scriptleri: CJS require mesru
  {
    files: ['scripts/**/*.{js,cjs,mjs}'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },

  // Dekoratif WebGL parcacik alani: rastgelelik kasitli ve bilesen
  // `dynamic(..., { ssr: false })` ile yukleniyor, yani hydration riski yok.
  // Determinizm istemek gorsel amaci bozardi.
  {
    files: ['components/CrownDreams/GoldenParticles.tsx'],
    rules: { 'react-hooks/purity': 'off' },
  },

  // Service worker: tarayici worker ortami, React/Next kurallari gecmez
  {
    files: ['public/sw.js'],
    languageOptions: { globals: { self: 'readonly', caches: 'readonly', clients: 'readonly' } },
    rules: { 'no-console': 'off' },
  },
])
