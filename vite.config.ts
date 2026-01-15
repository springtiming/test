import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 使用相对路径，适配 Wallpaper Engine
  base: './',
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保大文件不被内联，保持独立
    assetsInlineLimit: 0,
    // 确保所有资源都被正确复制
    rollupOptions: {
      output: {
        // 保持资源文件结构
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  // 确保 public 目录被正确处理
  publicDir: 'public',
})
