import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', '.wrangler/**', '.tanstack/**', 'src/routeTree.gen.ts', 'src/worker-configuration.d.ts'] },
  js.configs.recommended,
  tseslint.configs.recommended,
);
