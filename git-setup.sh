#!/bin/bash
# stream-cs — 개인 GitHub(kangara2580) 전용. 영호님(youngho940701-eng) 원격 추가 금지.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

GITHUB_USER="kangara2580"
REPO_NAME="stream-cs"
REMOTE_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"

echo "🎮 stream-cs — ${GITHUB_USER} 전용 GitHub 설정"
echo ""

if [[ ! -d .git ]]; then
  git init
  git config --local user.name "${GITHUB_USER}"
  git config --local user.email "${GITHUB_USER}@users.noreply.github.com"
  echo "✅ git 초기화 (이 폴더만)"
fi

# 영호님/다른 원격이 붙어 있으면 제거
for bad in youngho-github youngho youngho940701-eng; do
  if git remote get-url "$bad" &>/dev/null; then
    git remote remove "$bad"
    echo "🗑️  제거됨: remote ${bad}"
  fi
done

if git remote get-url origin &>/dev/null; then
  current="$(git remote get-url origin)"
  if [[ "$current" != "$REMOTE_URL" ]] && [[ "$current" != *"${GITHUB_USER}/${REPO_NAME}"* ]]; then
    echo "⚠️  origin이 다른 저장소를 가리킵니다: $current"
    echo "    개인 계정만 쓰려면: git remote set-url origin $REMOTE_URL"
  fi
else
  git remote add origin "$REMOTE_URL"
  echo "✅ origin → $REMOTE_URL"
fi

git branch -M main 2>/dev/null || true

if ! git rev-parse HEAD &>/dev/null; then
  git add public/index.html README.md .gitignore git-setup.sh middleware.ts app/ package.json
  git commit -m "🎉 Initial commit: StreamContent Server MVP UI

- 단일 HTML 프로토타입 (5개 페이지 통합)
- 노란색 테마 + 크로스플랫폼 스트리머 SaaS UI
- 다음 단계: Next.js + Supabase"
  echo "✅ 첫 커밋 완료"
fi

echo ""
echo "📌 GitHub에서 새 레포를 만드세요 (본인 계정만):"
echo "   https://github.com/new"
echo "   Repository name: ${REPO_NAME}"
echo "   Owner: ${GITHUB_USER}"
echo "   ⚠️  youngho940701-eng / digital-dna-aeya 와 연동하지 마세요"
echo ""
echo "레포 생성 후:"
echo "   git push -u origin main"
echo ""
echo "SSH 키: ~/.ssh/id_ed25519_dna (이미 github.com에 등록되어 있어야 함)"
