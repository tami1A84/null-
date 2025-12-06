# null² - LINE風Nostr Webアプリ

<div align="center">

**nostr-login & Amber対応のLINE風Nostr Webクライアント**

[🚀 クイックスタート](QUICKSTART.md) | [📖 セットアップ](SETUP.md) | [🏗️ アーキテクチャ](ARCHITECTURE.md) | [📝 TODO](TODO.md)

</div>

---

## ✨ 特徴

- 🔐 **複数のログイン方法** - nostr-login & Amber対応
  - ブラウザ拡張機能（nos2x, Alby等）
  - Nostr Connect (NIP-46)
  - Amber（Android）
  - 読み取り専用ログイン
  - アカウント切り替え

- 🎨 **LINE風UI** - 馴染みのあるインターフェース
- ⚡ **軽量・高速** - アニメーション最小限、テキストベース
- 📱 **レスポンシブ** - モバイル・デスクトップ対応
- 🌐 **yabu.me統合** - wss://yabu.meリレーに直接投稿

## 🔐 ログイン方法

### 1. ブラウザ拡張機能
nos2x、Alby、flamingo等のNostr拡張機能でログイン

### 2. Nostr Connect (NIP-46)
nsec.app、Nostrキーストアアプリでリモートログイン

### 3. Amber（Android）
Androidデバイスで安全に秘密鍵を管理

### 4. 読み取り専用
npubだけでタイムライン閲覧

## 🎯 主な機能

### ✅ 実装済み

**ホームタブ**
- プロフィール表示
- プロフィール編集（yabu.meに送信）
- アイコン、名前、自己紹介の設定

**タイムラインタブ**
- yabu.meリレーからタイムライン取得
- エアリプ投稿（yabu.meに送信）
- プロフィール画像付き表示
- リアルタイム投稿

**認証**
- nostr-login統合
- 複数ログイン方法サポート
- セッション管理

## 🚀 クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/tami1A84/null-web.git
cd null-web

# 起動
go run cmd/main.go

# ブラウザで開く
open http://localhost:8080
```

ログインして投稿してみましょう！

## 🏗️ 技術スタック

- **Go** - バックエンド
- **Pure JavaScript** - フロントエンド
- **nostr-login** - 認証
- **yabu.me** - Nostrリレー

## 📖 詳細ドキュメント

- [QUICKSTART.md](QUICKSTART.md) - 5分で始める
- [SETUP.md](SETUP.md) - 詳細セットアップ
- [ARCHITECTURE.md](ARCHITECTURE.md) - アーキテクチャ
- [TODO.md](TODO.md) - ロードマップ

## ⚖️ ライセンス

MIT License

## 🙏 クレジット

- [algia](https://github.com/mattn/algia) - mattn
- [nostr-login](https://github.com/nostrband/nostr-login) - nostrband
- [Amber](https://github.com/greenart7c3/Amber) - greenart7c3
- LINE Seed Sans JP - LINE Corporation
- yabu.me - 日本のNostrコミュニティ

---

Made with ❤️ for Nostr 🇯🇵
