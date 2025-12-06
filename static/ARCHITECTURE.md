# null² アーキテクチャ

## システム構成

```
┌─────────────────────────────────────┐
│         フロントエンド               │
│  (HTML/CSS/JavaScript)              │
│                                     │
│  - LINE風UI                         │
│  - nostr-login統合                  │
│  - 直接リレー接続（WebSocket）       │
└──────────────┬──────────────────────┘
               │
               │ HTTP (静的ファイルのみ)
               │
┌──────────────▼──────────────────────┐
│         Goバックエンド               │
│  (cmd/main.go)                      │
│                                     │
│  - HTTPサーバー（静的ファイル配信）  │
│  - 認証なし（フロントエンドで処理）  │
└─────────────────────────────────────┘

               WebSocket (直接接続)
               │
┌──────────────▼──────────────────────┐
│         Nostrリレー                  │
│                                     │
│  - wss://yabu.me                    │
│                                     │
└─────────────────────────────────────┘

               ┌──────────────────────┐
               │   nostr-login        │
               │                      │
               │  - NIP-07 (拡張)     │
               │  - NIP-46 (Connect)  │
               │  - ローカル署名      │
               └──────────────────────┘
```

## ディレクトリ構造

```
null-web/
├── cmd/
│   └── main.go           # メインアプリケーション（静的ファイル配信のみ）
├── static/
│   ├── css/
│   │   └── style.css     # LINE風スタイル
│   ├── js/
│   │   └── app.js        # フロントエンドロジック + Nostr通信
│   └── img/
│       └── default-avatar.svg
├── templates/
│   └── index.html        # メインHTML（nostr-login統合）
├── go.mod
├── Makefile
├── README.md
└── ドキュメント類
```

## データフロー

### ログインの流れ

```
1. ユーザーが「ログイン」ボタンをクリック
   └→ nostr-login UIを起動
      └→ ユーザーがログイン方法を選択
         ├→ Nostr Connect (NIP-46)
         │  └→ bunkerで承認
         │     └→ window.nostrが利用可能に
         │
         ├→ ブラウザ拡張 (NIP-07)
         │  └→ 拡張で承認
         │     └→ window.nostrが利用可能に
         │
         └→ ローカル署名
            └→ 秘密鍵を入力
               └→ ブラウザに保存
                  └→ window.nostrが利用可能に

2. nlAuthイベント発火
   └→ app.jsでpubkeyを取得
      └→ プロフィールを読み込み
         └→ UIを更新
```

### 投稿の流れ

```
1. ユーザー入力
   └→ JavaScript (app.js)
      └→ window.nostr.signEvent()
         └→ イベントに署名
            └→ WebSocketでyabu.meに直接送信
               └→ OK/NOTICEを受信
                  └→ タイムライン再読み込み
```

### タイムライン取得の流れ

```
1. タブ切り替えまたはページロード
   └→ JavaScript (app.js)
      └→ WebSocketでyabu.meに接続
         └→ REQメッセージ送信
            └→ EVENTメッセージ受信
               └→ 作者情報を別途取得
                  └→ DOM更新
```

### プロフィール編集の流れ

```
1. ユーザーがフォーム入力
   └→ JavaScript (app.js)
      └→ kind 0イベント作成
         └→ window.nostr.signEvent()
            └→ イベントに署名
               └→ WebSocketでyabu.meに送信
                  └→ プロフィール再読み込み
```

## 主要コンポーネント

### 1. Goバックエンド (cmd/main.go)

**役割：**
- 静的ファイルの配信のみ
- 認証処理なし
- Nostr通信なし

**主な関数：**
- `main()` - サーバーの初期化と起動
- `handleIndex()` - index.htmlを返す

### 2. フロントエンド (static/js/app.js)

**役割：**
- すべてのNostr通信
- 認証状態管理
- UI状態管理
- リレーとの直接通信

**主な関数：**
- `initAuth()` - nostr-login初期化
- `onLogin()` - ログイン処理
- `publishToRelay()` - イベント公開
- `fetchTimelineFromRelay()` - タイムライン取得
- `fetchProfileFromRelay()` - プロフィール取得

### 3. nostr-login統合

**機能：**
- NIP-07 (ブラウザ拡張)対応
- NIP-46 (Nostr Connect)対応
- ローカル署名対応
- window.nostr APIの提供

**イベント：**
- `nlAuth` - 認証状態変更
- `nlLaunch` - UIを起動
- `nlLogout` - ログアウト

### 4. スタイル (static/css/style.css)

**デザイン原則：**
- LINE風の配色（緑 #00B900）
- シンプルで読みやすい
- アニメーション最小限
- モバイルファースト

## Nostr実装

### 対応NIP

- **NIP-01**: Basic protocol flow
- **NIP-07**: window.nostr capability
- **NIP-46**: Nostr Connect
- Kind 0: プロフィール
- Kind 1: テキスト投稿
- Kind 6: リポスト
- Kind 7: いいね

### イベント種別

| Kind | 用途 | 実装状況 |
|------|------|----------|
| 0 | プロフィール | ✅ |
| 1 | テキスト投稿 | ✅ |
| 6 | リポスト | ✅ |
| 7 | いいね | ✅ |
| 9734-9735 | Zap | 📅 |

### リレー通信

すべてフロントエンドからWebSocketで直接通信：

```javascript
const ws = new WebSocket('wss://yabu.me');

// イベント公開
ws.send(JSON.stringify(['EVENT', signedEvent]));

// イベント取得
ws.send(JSON.stringify(['REQ', subscriptionId, filter]));

// レスポンス受信
ws.onmessage = (event) => {
  const [type, ...data] = JSON.parse(event.data);
  // EVENT, OK, NOTICE等を処理
};
```

## セキュリティ

### 秘密鍵の管理
- **Nostr Connect**: 秘密鍵はbunkerで管理（最も安全）
- **ブラウザ拡張**: 秘密鍵は拡張で管理（安全）
- **ローカル署名**: 秘密鍵はブラウザのlocalStorageに保存（注意が必要）

### サーバー側
- 秘密鍵を一切扱わない
- 認証処理なし
- 静的ファイル配信のみ

### クライアント側
- nostr-loginによる安全な認証
- window.nostr APIで署名
- リレーとの直接通信

## パフォーマンス最適化

### フロントエンド
- アニメーション最小限
- DOM操作の最適化
- WebSocket接続の再利用
- イベントキャッシュ（将来的に）

### ネットワーク
- 単一リレー接続（yabu.me）
- 必要なイベントのみ取得
- フィルタの最適化

## 今後の拡張

### Phase 1（現在）
- [x] nostr-login統合
- [x] 基本的なタイムライン
- [x] 投稿機能
- [x] プロフィール編集
- [x] いいね・リポスト

### Phase 2
- [ ] Amber対応（Android）
- [ ] NWC統合
- [ ] Zap送信
- [ ] リレー選択UI

### Phase 3
- [ ] NIP-17 DM実装
- [ ] 通知機能
- [ ] 画像アップロード
- [ ] 検索機能

### Phase 4
- [ ] PWA対応
- [ ] オフライン機能
- [ ] マルチアカウント
- [ ] マルチリレー対応

## 設計の利点

### シンプル
- バックエンドは静的ファイル配信のみ
- 設定ファイル不要
- 依存関係なし

### 安全
- 秘密鍵をサーバーに送信しない
- nostr-loginによる安全な認証
- 複数の認証方法をサポート

### 拡張性
- フロントエンドのみで機能追加可能
- リレーの追加が容易
- 他のNostrアプリとの互換性
