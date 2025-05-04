import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'dracula-soft',
      wrap: true,
      langs: [],
      transformers: [{
        pre(node) {
          node.properties.className = [...(node.properties.className || []), 'code-block'];
          return node;
        },
        code(node) {
          node.properties.className = [...(node.properties.className || []), 'code'];
          return node;
        }
      }]
    }
  }
});