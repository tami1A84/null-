# 開発メモ

## 現在の実装状況

### ✅ 実装済み
- LINE風のUI/UXデザイン
- 下部固定タブナビゲーション（ホーム、トーク、タイムライン、おさいふ）
- LINE Seedフォントの適用
- 軽量・高速な設計（アニメーション最小限）
- yabu.meリレーからのタイムライン取得
- いいね、リツイート、Zapボタン
- ローカルストレージでのキー管理
- プロフィール表示・簡易編集

### ⚠️ 簡易実装（改善が必要）
- Nostr署名機能（現在はダミー実装）
  - 実際のsecp256k1署名が必要
  - noble-secp256k1やnostr-toolsの導入を推奨
- NIP-17 DM機能（準備中）
- NWC統合（接続UIのみ）

## 次のステップ

### 優先度：高
1. **secp256k1署名の実装**
   ```javascript
   // noble-secp256k1を使用
   import * as secp256k1 from '@noble/secp256k1'
   ```

2. **nostr-toolsの統合**
   ```bash
   npm install nostr-tools
   ```

3. **イベント投稿機能の追加**
   - 投稿入力フォーム
   - 画像添付（NIP-94）

### 優先度：中
4. **NIP-17 DM実装**
   - Sealed Sender対応
   - チャット履歴表示

5. **NWC完全統合**
   - 実際のZap送信
   - 残高表示

6. **プロフィール機能拡張**
   - NIP-05認証表示
   - アバター画像

### 優先度：低
7. **通知機能**
   - メンション通知
   - DM通知

8. **リレー管理**
   - 複数リレー対応
   - リレー設定画面

## パフォーマンス最適化のポイント

1. **WebSocketの効率的な利用**
   - 接続プールの管理
   - 不要なサブスクリプションの削除

2. **DOM操作の最小化**
   - Virtual DOMは使わず、直接操作で軽量化
   - 必要な部分のみ更新

3. **ローカルストレージの活用**
   - キャッシュによる高速化
   - オフライン対応

## セキュリティ考慮事項

1. **秘密鍵の管理**
   - ローカルストレージは簡易実装
   - NIP-07ブラウザ拡張対応を検討
   - または暗号化して保存

2. **XSS対策**
   - ユーザー入力のサニタイゼーション
   - Content Security Policy設定

3. **リレーの信頼性**
   - 複数リレーからの検証
   - スパム対策

## デザインガイドライン

### カラーパレット
- LINE Green: #06C755
- Background: #f8f8f8
- White: #ffffff
- Text Primary: #1a1a1a
- Text Secondary: #666666
- Border: #e0e0e0

### フォント
- LINE Seed JP_OTF
- フォールバック: -apple-system, BlinkMacSystemFont, 'Segoe UI'

### サイズ
- ヘッダー高さ: 56px
- 下部ナビ高さ: 60px
- 最大幅: 600px

## テスト項目

- [ ] タブ切り替え動作
- [ ] タイムライン読み込み
- [ ] いいね機能
- [ ] リツイート機能
- [ ] プロフィール編集
- [ ] NWC接続
- [ ] レスポンシブデザイン
- [ ] 長文投稿の表示
- [ ] 画像表示（今後）

## デプロイ

### ローカル開発
```bash
go run main.go
```

### 本番環境
```bash
# ビルド
go build -o nostr-line-app

# 実行
PORT=8080 ./nostr-line-app
```

### Docker対応（今後）
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o nostr-line-app
CMD ["./nostr-line-app"]
```

## 参考リンク

- [Nostr Implementation Possibilities](https://github.com/nostr-protocol/nips)
- [algia - CLI Nostr Client](https://github.com/mattn/algia)
- [LINE Seed Font](https://seed.line.me/)
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)
- [noble-secp256k1](https://github.com/paulmillr/noble-secp256k1)
