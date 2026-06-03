#!/bin/bash

# ============================================
# 스트림컨텐츠 서버 — 깃허브 초기 설정 스크립트
# 이 파일을 StreamContent-Server 폴더에서 실행하세요
# 사용법: chmod +x git-setup.sh && ./git-setup.sh
# ============================================

echo "🎮 StreamContent Server GitHub 설정 시작..."
echo ""

# 1. git 초기화
git init
echo "✅ git 초기화 완료"

# 2. 모든 파일 스테이징
git add .
echo "✅ 파일 스테이징 완료"

# 3. 첫 커밋
git commit -m "🎉 Initial commit: StreamContent Server MVP UI

- 단일 HTML 프로토타입 (5개 페이지 통합)
- 노란색 테마 + 귀여운 UX 디자인
- 크로스플랫폼 지원 (치지직/SOOP/틱톡/팝콘TV/Prism)
- 폭탄 룰렛 / 출석체크 / AI 밸런스 게임 UI
- 수익 계산기 포함
- 다음 단계: Next.js + Supabase 마이그레이션"

echo "✅ 첫 커밋 완료"
echo ""
echo "⚠️  이제 GitHub에서 새 레포지토리를 만들고 아래 명령어를 실행하세요:"
echo ""
echo "  git remote add origin https://github.com/YOUR_USERNAME/StreamContent-Server.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "🚀 완료! 이제 Cursor/Claude/Codex 어디서든 클론해서 작업할 수 있어요."
echo ""
echo "  # 다른 곳에서 클론하려면:"
echo "  git clone https://github.com/YOUR_USERNAME/StreamContent-Server.git"
