# Nostr Line App

LINE風のシンプルなNostr Webアプリケーション

## 特徴

- 📱 LINE風のシンプルで使いやすいUI
- ⚡ 軽量・高速（アニメーション最小限）
- 🎨 LINE Seedフォント使用
- 🔐 Nostrプロトコル対応

## 機能

### 下部固定タブ

1. **🏠 ホーム**
   - プロフィール表示・編集
   - 自分の投稿一覧

2. **💬 トーク**
   - NIP-17 DM機能（準備中）

3. **📰 タイムライン**
   - yabu.meリレーからのフィード取得
   - エアリプ専用（リプライなし）
   - 👍 いいね
   - 🔁 リツイート
   - ⚡ Zap

4. **👛 おさいふ**
   - NWC（Nostr Wallet Connect）対応

## 起動方法

```bash
# 開発環境で起動
go run main.go

# ビルドして起動
go build -o nostr-line-app
./nostr-line-app
```

ブラウザで `http://localhost:8080` を開く

## 技術スタック

- **バックエンド**: Go 1.21+
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **プロトコル**: Nostr
- **フォント**: LINE Seed JP

## プロジェクト構成

```
nostr-line-app/
├── main.go              # Goサーバー
├── go.mod               # Go modules
├── templates/
│   └── index.html       # メインHTMLテンプレート
└── static/
    ├── css/
    │   └── style.css    # スタイルシート
    └── js/
        ├── nostr.js     # Nostr基本機能
        └── app.js       # アプリケーションロジック
```

## algiaとの関係

このアプリケーションは、mattnさんの[algia](https://github.com/mattn/algia)のCLIクライアントをベースに、Webアプリケーション版として開発されました。algiaの基本的なNostr操作の考え方を参考にしつつ、LINE風のUIで誰でも使いやすいアプリを目指しています。

## 今後の実装予定

- [ ] NIP-17 DM機能の完全実装
- [ ] NWC統合による実際のZap送信
- [ ] プロフィール画像のアップロード
- [ ] secp256k1による適切な署名実装
- [ ] より多くのリレー対応
- [ ] 投稿機能の追加
- [ ] 通知機能

## ライセンス

MIT

## 作者

Nostr開発者・Go言語スペシャリスト
