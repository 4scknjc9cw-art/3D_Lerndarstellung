import { defineConfig } from 'vite';

// GitHub Pages liefert die App unter /<repo-name>/ aus, nicht unter der Wurzel.
// Ohne diesen Pfad findet die Seite online ihre eigenen Dateien nicht.
export default defineConfig({
  base: '/3D_Lerndarstellung/',
});
