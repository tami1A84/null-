# null² セットアップガイド

## 必要なもの

- Go 1.21以上
- モダンなブラウザ（Chrome, Firefox, Safari等）
- Nostrアカウント（なければ作成できます）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/tami1A84/null-web.git
cd null-web
```

### 2. サーバーの起動

**設定ファイル不要！**

```bash
# 起動
make run
```

または

```bash
go run cmd/main.go
```

### 3. ブラウザでアクセス

```
http://localhost:8080
```

### 4. ログイン

画面右上の「ログイン」ボタンをクリックして、お好きな方法でログインしてください。

## ログイン方法の詳細

### 🌐 Nostr Connect（推奨）

**最も安全な方法**

1. 「Connect with Nostr」を選択
2. nsec.app等のbunkerを選択
3. QRコードをスキャンまたはリンクをクリック
4. bunker側で接続を承認

**推奨bunker:**
- [nsec.app](https://nsec.app) - 最も人気
- その他のNIP-46対応サービス

### 🔌 ブラウザ拡張

**ブラウザに拡張がインストール済みの場合**

1. 「Sign in with Extension」を選択
2. 拡張で接続を承認

**対応拡張:**
- [nos2x](https://github.com/fiatjaf/nos2x) - Chrome/Firefox
- [Alby](https://getalby.com) - Lightning + Nostr
- その他のNIP-07対応拡張

### 🔑 ローカル署名

**秘密鍵を直接入力（注意が必要）**

1. 「Sign in with Secret Key」を選択
2. nsec秘密鍵を入力
3. ブラウザに保存

**注意**: 秘密鍵はブラウザのlocalStorageに保存されます。信頼できるデバイスでのみ使用してください。

## 使い方

### タイムラインの閲覧

1. 「タイムライン」タブをクリック
2. yabu.meリレーの最新投稿が表示されます

### 投稿する

1. 「タイムライン」タブを開く
2. 上部のテキストボックスに入力
3. 「投稿」ボタンをクリック
4. yabu.meリレーに送信されます

### プロフィール編集

1. 「ホーム」タブを開く
2. 「編集」ボタンをクリック
3. 名前、自己紹介、アイコンURLを入力
4. 「保存」ボタンをクリック
5. yabu.meリレーに送信されます

### いいね・リポスト

各投稿の下部にあるボタンをクリック:
- 👍 いいね
- 🔁 リポスト

## トラブルシューティング

### ログインできない

**ブラウザ拡張が検出されない:**
- 拡張が有効になっているか確認
- ページをリロード
- 別のログイン方法を試す

**Nostr Connectが動作しない:**
- bunkerサービスが動作しているか確認
- QRコードを再度読み込む
- ブラウザのコンソールでエラーを確認（F12キー）

### 投稿が表示されない

```bash
# ブラウザのコンソールを開く（F12キー）
# Console タブでエラーを確認

# yabu.meリレーの接続を確認
# WebSocket接続エラーがないか確認
```

### ポート8080が使用中

```bash
# 別のポートで起動
PORT=3000 make run
```

または

```bash
PORT=3000 go run cmd/main.go
```

### プロフィールが更新されない

1. 少し待ってからページをリロード
2. リレーに接続できているか確認
3. ブラウザのコンソールでエラーを確認

## カスタマイズ

### ログイン方法を制限

`templates/index.html`の`<script>`タグを編集:

```html
<script 
    src="https://www.unpkg.com/nostr-login@latest/dist/unpkg.js"
    data-methods="connect,extension"  <!-- localを削除 -->
></script>
```

### テーマを変更

```html
<script 
    src="..."
    data-theme="ocean"  <!-- ocean, lemonade, purple -->
></script>
```

利用可能なテーマ:
- `default` - デフォルト
- `ocean` - 青系
- `lemonade` - 黄色系
- `purple` - 紫系

### 権限を指定

```html
<script 
    src="..."
    data-perms="sign_event:1,sign_event:0,sign_event:6,sign_event:7"
></script>
```

## デプロイ

### ローカルで実行

```bash
make build
./null-web
```

### systemdサービスとして実行

`/etc/systemd/system/null-web.service`:

```ini
[Unit]
Description=null² Nostr Web Client
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/null-web
ExecStart=/opt/null-web/null-web
Restart=always
Environment="PORT=8080"

[Install]
WantedBy=multi-user.target
```

有効化:

```bash
sudo systemctl enable null-web
sudo systemctl start null-web
```

### nginxでリバースプロキシ

```nginx
server {
    listen 80;
    server_name null.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## よくある質問

### Q: 設定ファイルは必要ですか？

A: いいえ、不要です。nostr-loginがすべて処理します。

### Q: 秘密鍵はどこに保存されますか？

A: ログイン方法によって異なります:
- Nostr Connect: bunkerサービスに保存
- ブラウザ拡張: 拡張機能内に保存
- ローカル署名: ブラウザのlocalStorageに保存

### Q: Amberは使えますか？

A: 現在開発中です。将来のバージョンで対応予定です。

### Q: 複数のリレーに投稿できますか？

A: 現在はyabu.meのみです。将来のバージョンでマルチリレー対応予定です。

### Q: オフラインで使えますか？

A: 現在は未対応です。PWA対応で将来実装予定です。

## サポート

- GitHub Issues: [https://github.com/tami1A84/null-web/issues](https://github.com/tami1A84/null-web/issues)
- Nostr: Nostrで開発者を見つけてください

## ライセンス

MIT
