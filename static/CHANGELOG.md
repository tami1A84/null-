# CHANGELOG

## v0.2.0 - 2025-12-06

### 🎉 新機能

**nostr-login & Amber対応**
- nostr-loginライブラリを統合
- 複数のログイン方法をサポート：
  - ブラウザ拡張機能（nos2x, Alby, Flamingo等）
  - Nostr Connect (NIP-46)
  - Amber（Android Signer）
  - 読み取り専用ログイン
  - アカウント切り替え機能

**wss://yabu.me直接投稿**
- タイムライン投稿をyabu.meリレーに直接送信
- プロフィール編集をyabu.meリレーに直接送信
- リアルタイムタイムライン表示

**UI改善**
- ヘッダーにログイン/ログアウトボタンを追加
- ログイン状態に応じたUI表示
- プロフィール画像の表示対応

### 🔧 技術的変更

**フロントエンド**
- SimpleRelayPool実装（WebSocketベース）
- nlAuthイベント処理でログイン管理
- window.nostr APIを使用した署名処理
- yabu.meリレーとの直接通信

**バックエンド**
- 設定ファイル読み込みを削除（フロントエンドのみで動作）
- 静的ファイルサーバーとして機能

### 📝 ドキュメント

- README更新（nostr-login & Amber対応を明記）
- QUICKSTART更新（ログイン方法の詳細説明）
- 各種ドキュメントの整備

### 🐛 バグ修正

- プロフィール画像の表示エラー処理
- HTMLエスケープ処理の改善
- タイムラインの時間表示修正

---

## v0.1.0 - 2025-12-06

### 🎉 初回リリース

**基本機能**
- LINE風UI
- タブナビゲーション（ホーム、トーク、タイムライン、おさいふ）
- タイムライン表示
- プロフィール表示

**技術スタック**
- Go バックエンド
- Pure JavaScript フロントエンド
- LINE Seed Sans JPフォント

**ドキュメント**
- README
- SETUP
- ARCHITECTURE
- TODO
- QUICKSTART
- LICENSE

---

## 今後の予定

### v0.3.0
- [ ] いいね機能（kind 7）
- [ ] リポスト機能（kind 6）
- [ ] リアルタイム更新（WebSocket）

### v0.4.0
- [ ] NIP-17 DM機能
- [ ] DM暗号化/復号化

### v0.5.0
- [ ] NWC統合
- [ ] Zap送信機能
- [ ] Lightning Invoice表示

### v1.0.0
- [ ] PWA対応
- [ ] オフライン機能
- [ ] マルチリレー対応
- [ ] 通知機能
