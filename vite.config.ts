import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages에서 프로젝트 페이지 경로를 맞추기 위해
  // Actions에서 BASE_PATH 환경변수를 주입합니다. (예: /repo-name/)
  base: '/',
})


