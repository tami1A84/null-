#!/bin/bash

# GitHubにプッシュするためのコマンド集

echo "=== null² GitHub Push Commands ==="
echo ""
echo "📁 現在のディレクトリ: $(pwd)"
echo ""

# 1. ステータス確認
echo "1️⃣ Git状態を確認:"
echo "   git status"
echo ""

# 2. リモート確認
echo "2️⃣ リモートリポジトリを確認:"
echo "   git remote -v"
echo ""

# 3. ブランチをmainに変更（オプション）
echo "3️⃣ ブランチをmainに変更（オプション）:"
echo "   git branch -M main"
echo ""

# 4. プッシュ（master）
echo "4️⃣ プッシュ（masterブランチ）:"
echo "   git push -u origin master"
echo ""

# 5. プッシュ（main）
echo "5️⃣ プッシュ（mainブランチ）:"
echo "   git push -u origin main"
echo ""

echo "📝 認証情報:"
echo "   ユーザー名: tami1A84"
echo "   パスワード: <GitHubパーソナルアクセストークン>"
echo ""

echo "🔗 リポジトリURL:"
echo "   https://github.com/tami1A84/null-"
echo ""

echo "📚 詳細は PUSH_GUIDE.md を参照してください"
