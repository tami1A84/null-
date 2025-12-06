# GitHubへのプッシュ手順

## 準備完了状態 ✅

以下の準備が完了しています：

- ✅ Gitリポジトリ初期化
- ✅ 全ファイルステージング
- ✅ 初回コミット作成
- ✅ リモートリポジトリ追加（origin → https://github.com/tami1A84/null-.git）

## プッシュ方法

### オプション1: HTTPS（推奨）

```bash
cd /mnt/user-data/outputs/null-web

# GitHubの認証情報を入力してプッシュ
git push -u origin master
```

**必要なもの:**
- GitHubユーザー名
- GitHubパーソナルアクセストークン（PAT）

### オプション2: SSH

```bash
cd /mnt/user-data/outputs/null-web

# リモートURLをSSHに変更
git remote set-url origin git@github.com:tami1A84/null-.git

# プッシュ
git push -u origin master
```

**必要なもの:**
- SSH鍵がGitHubに登録済み

## GitHub Personal Access Token (PAT) の取得方法

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token" をクリック
4. スコープを選択：
   - ✅ `repo` (full control of private repositories)
5. トークンをコピーして保存

## プッシュ実行

```bash
# ディレクトリに移動
cd /mnt/user-data/outputs/null-web

# プッシュ（初回）
git push -u origin master

# ユーザー名を入力: tami1A84
# パスワードを入力: <your-personal-access-token>
```

## プッシュ後の確認

```bash
# リモートの状態を確認
git remote -v

# ログを確認
git log --oneline

# ブランチを確認
git branch -a
```

## ブラウザで確認

プッシュ成功後、以下のURLで確認できます：
https://github.com/tami1A84/null-

## トラブルシューティング

### 認証エラーが出る場合

```bash
# 認証情報をクリア
git config --global --unset credential.helper

# 再度プッシュ
git push -u origin master
```

### ブランチ名をmainに変更したい場合

```bash
# ブランチ名を変更
git branch -M main

# プッシュ
git push -u origin main
```

### リモートURLを確認

```bash
git remote -v
```

## 今後の更新手順

ファイルを更新した後：

```bash
cd /mnt/user-data/outputs/null-web

# 変更をステージング
git add .

# コミット
git commit -m "update: 変更内容の説明"

# プッシュ
git push
```

## コミット済み内容

### コミットメッセージ
```
feat: Add nostr-login and Amber support with yabu.me integration

- Integrate nostr-login for multiple login methods (extension, Nostr Connect, Amber, read-only)
- Add direct posting to wss://yabu.me relay
- Implement profile editing with yabu.me submission
- Add SimpleRelayPool for WebSocket communication
- Update UI with login/logout buttons
- Add comprehensive documentation (README, QUICKSTART, IMPLEMENTATION)
- LINE-style responsive design
- Support for Android Amber signer

Features:
- Multiple login methods via nostr-login
- Post to yabu.me relay (kind 1)
- Edit profile and send to yabu.me (kind 0)
- Timeline display with profile pictures
- Account switching
- Session management
```

### 追加されたファイル（19ファイル、2907行）
- README.md
- QUICKSTART.md
- IMPLEMENTATION.md
- CHANGELOG.md
- ARCHITECTURE.md
- TODO.md
- cmd/main.go
- static/js/app.js (nostr-login統合)
- static/css/style.css
- templates/index.html
- その他ドキュメント

## 注意事項

⚠️ **重要**: パーソナルアクセストークンは絶対に公開しないでください。

✅ プッシュ成功後、GitHubリポジトリで以下を確認：
- すべてのファイルが正しくアップロードされているか
- README.mdが正しく表示されているか
- .gitignoreが機能しているか

## サポート

問題が発生した場合：
1. エラーメッセージを確認
2. GitHubのステータスページを確認（https://www.githubstatus.com/）
3. Git設定を確認（`git config --list`）

---

**準備完了！** あとは `git push -u origin master` を実行するだけです！🚀
