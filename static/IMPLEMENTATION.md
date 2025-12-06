# null² 実装サマリー

## 🎉 実装完了機能

### 1. nostr-login統合 ✅

**実装内容:**
- nostr-loginスクリプトをHTMLに追加
- nlAuthイベントリスナーで認証状態を管理
- window.nostr APIを使用してイベント署名

**サポートするログイン方法:**
- ✅ ブラウザ拡張機能（nos2x, Alby, Flamingo等）
- ✅ Nostr Connect (NIP-46) - nsec.app等
- ✅ Amber（Android Signer）
- ✅ 読み取り専用ログイン
- ✅ アカウント切り替え

**コード:**
```html
<!-- templates/index.html -->
<script 
    src="https://www.unpkg.com/nostr-login@latest/dist/unpkg.js"
    data-perms="sign_event:1,sign_event:0"
    data-theme="default"
    data-methods="connect,extension,local"
></script>
```

```javascript
// static/js/app.js
document.addEventListener('nlAuth', handleNostrLogin);

async function handleNostrLogin(e) {
    if (e.detail.type === 'login' || e.detail.type === 'signup') {
        const pubkey = await window.nostr.getPublicKey();
        currentUser = { pubkey, npub: npubEncode(pubkey) };
        // ...
    }
}
```

### 2. wss://yabu.me投稿 ✅

**実装内容:**
- SimpleRelayPoolクラスでWebSocket管理
- 投稿イベント（kind 1）をyabu.meに送信
- プロフィールイベント（kind 0）をyabu.meに送信

**コード:**
```javascript
// 投稿処理
async function handlePost() {
    const event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: content,
        pubkey: currentUser.pubkey
    };
    
    const signedEvent = await window.nostr.signEvent(event);
    await relayPool.publish(signedEvent);
}
```

### 3. プロフィール編集 ✅

**実装内容:**
- kind 0イベントを作成
- JSON形式でプロフィールデータを送信
- yabu.meリレーに公開

**コード:**
```javascript
// プロフィール更新
const profileData = {
    name: name,
    about: about,
    picture: picture
};

const event = {
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(profileData),
    pubkey: currentUser.pubkey
};

const signedEvent = await window.nostr.signEvent(event);
await relayPool.publish(signedEvent);
```

### 4. タイムライン表示 ✅

**実装内容:**
- yabu.meからkind 1イベントを取得
- 作者プロフィール（kind 0）も同時取得
- 時間順にソートして表示

**コード:**
```javascript
// タイムライン読み込み
const sub = relayPool.subscribe([{
    kinds: [1],
    limit: 50
}], {
    onEvent: (event) => events.push(event),
    onEose: () => {
        // プロフィール取得と表示
    }
});
```

## 🏗️ アーキテクチャ

### リレー通信フロー

```
ユーザー操作
    ↓
JavaScript (app.js)
    ↓
window.nostr.signEvent()
    ↓
SimpleRelayPool
    ↓
WebSocket
    ↓
wss://yabu.me
```

### 投稿フロー

```
1. ユーザーがテキスト入力
2. 「投稿」ボタンクリック
3. handlePost() 実行
4. Nostrイベント作成（kind 1）
5. window.nostr.signEvent() で署名
6. relayPool.publish() でyabu.meに送信
7. 投稿完了
8. タイムライン再読み込み
```

### プロフィール編集フロー

```
1. ユーザーがプロフィール入力
2. 「保存」ボタンクリック
3. プロフィールイベント作成（kind 0）
4. window.nostr.signEvent() で署名
5. relayPool.publish() でyabu.meに送信
6. プロフィール更新完了
7. プロフィール再読み込み
```

## 📁 主要ファイル

### static/js/app.js
- **役割**: フロントエンドロジック
- **主要クラス**: SimpleRelayPool
- **主要関数**:
  - `handleNostrLogin()` - ログイン処理
  - `handlePost()` - 投稿処理
  - `loadTimeline()` - タイムライン読み込み
  - `loadProfile()` - プロフィール読み込み

### templates/index.html
- **役割**: UIテンプレート
- **特徴**:
  - nostr-loginスクリプト読み込み
  - 4つのタブ（ホーム、トーク、タイムライン、おさいふ）
  - モーダルダイアログ

### static/css/style.css
- **役割**: LINE風スタイル
- **特徴**:
  - LINE Green (#00B900)
  - シンプルなレイアウト
  - アニメーション最小限

## 🔐 セキュリティ

### 秘密鍵の管理
- ❌ アプリ内に秘密鍵を保存しない
- ✅ window.nostr経由で署名のみ実行
- ✅ nostr-loginが安全な方法でログイン管理
- ✅ Amberが秘密鍵を安全に管理（Android）

### 通信
- ✅ WebSocket over TLS（wss://）
- ✅ リレーとの通信のみ
- ✅ サーバーに秘密情報を送信しない

## 🚀 使用方法

### 開発環境

```bash
cd null-web
go run cmd/main.go
```

### 本番環境

```bash
go build -o null-web cmd/main.go
./null-web
```

### Docker（将来的に）

```bash
docker build -t null-web .
docker run -p 8080:8080 null-web
```

## 📊 対応NIP

- ✅ NIP-01: Basic protocol
- ✅ NIP-07: window.nostr
- ✅ NIP-46: Nostr Connect（nostr-login経由）
- ✅ NIP-55: Android Signer（Amber）
- 🚧 NIP-17: DM（開発中）
- 🚧 NIP-47: NWC（開発中）
- 🚧 NIP-57: Zap（開発中）

## 🎯 今後の実装予定

### 優先度: 高
- [ ] いいね機能（kind 7）
- [ ] リポスト機能（kind 6）
- [ ] リアルタイム更新

### 優先度: 中
- [ ] NIP-17 DM
- [ ] NWC統合
- [ ] Zap送信

### 優先度: 低
- [ ] 画像アップロード
- [ ] 検索機能
- [ ] 通知機能

## 📝 メモ

### nostr-loginの利点
1. 複数のログイン方法を一括サポート
2. UI/UXが統一されている
3. アカウント切り替えが簡単
4. セキュリティがしっかりしている

### yabu.meの利点
1. 日本のコミュニティリレー
2. 日本語コンテンツが豊富
3. 低レイテンシ（日本からのアクセス）
4. 安定した運用

### SimpleRelayPoolの特徴
1. 軽量な実装
2. 依存関係なし
3. WebSocket直接使用
4. 必要最小限の機能

---

**実装者**: mattn（Nostr開発者）スタイル  
**実装日**: 2025-12-06  
**バージョン**: v0.2.0
