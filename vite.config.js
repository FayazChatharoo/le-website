import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'LEWebsite',                 // exposé en window.LEWebsite si besoin
      formats: ['iife'],
      fileName: () => 'le-website.iife.js'
    }
  }
});


