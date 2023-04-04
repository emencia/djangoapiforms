import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/forms.es.js',
      format: 'esm'
    },
    {
      file: 'dist/forms.min.js',
      format: 'iife',
      name: '$useForms',
      plugins: [terser()]
    }],
  plugins: [
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ],
};