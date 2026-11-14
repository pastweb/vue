import { defineConfig } from 'tsdown';
import { preserveDirectives } from 'rollup-plugin-preserve-directives';

/**
 * Align with @pastweb/react:
 * - dual ESM + CJS
 * - unbundle
 * - exports.all → package.json exports with import/require
 */
export default defineConfig({
  platform: 'neutral',
  clean: true,
  entry: 'src/**/*.ts',
  format: ['esm', 'cjs'],
  fromVite: true,
  dts: { vue: true },
  sourcemap: true,
  unbundle: true,
  deps: {
    neverBundle: ['vue', /^vue\//, 'pinia', '@pastweb/tools'],
  },
  plugins: [
    preserveDirectives({
      include: ['use client', 'use server'],
    }),
  ],
  exports: {
    all: true,
  },
});
