// Nostr基本機能
class NostrClient {
    constructor() {
        this.relays = new Map();
        this.defaultRelays = ['wss://yabu.me'];
        this.subscriptions = new Map();
        this.privateKey = null;
        this.publicKey = null;
    }

    // 秘密鍵生成
    generatePrivateKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 公開鍵計算（簡易版 - 実際はsecp256k1が必要）
    async getPublicKey(privateKey) {
        // 実装では nostr-tools や noble-secp256k1 を使用
        // ここでは簡易的な実装
        return privateKey; // 仮
    }

    // npub形式に変換
    toNpub(pubkey) {
        return 'npub' + pubkey.substring(0, 59);
    }

    // リレー接続
    async connectRelay(url) {
        if (this.relays.has(url)) {
            return this.relays.get(url);
        }

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url);
            
            ws.onopen = () => {
                console.log(`Connected to ${url}`);
                this.relays.set(url, ws);
                resolve(ws);
            };

            ws.onerror = (error) => {
                console.error(`Error connecting to ${url}:`, error);
                reject(error);
            };

            ws.onmessage = (event) => {
                this.handleMessage(event.data, url);
            };
        });
    }

    // メッセージ処理
    handleMessage(data, relayUrl) {
        try {
            const message = JSON.parse(data);
            const [type, ...rest] = message;

            if (type === 'EVENT') {
                const [subscriptionId, event] = rest;
                const callback = this.subscriptions.get(subscriptionId);
                if (callback) {
                    callback(event);
                }
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // サブスクリプション
    async subscribe(filters, callback, relayUrls = this.defaultRelays) {
        const subscriptionId = Math.random().toString(36).substring(7);
        this.subscriptions.set(subscriptionId, callback);

        for (const url of relayUrls) {
            const relay = await this.connectRelay(url);
            const req = JSON.stringify(['REQ', subscriptionId, filters]);
            relay.send(req);
        }

        return subscriptionId;
    }

    // サブスクリプション解除
    unsubscribe(subscriptionId, relayUrls = this.defaultRelays) {
        this.subscriptions.delete(subscriptionId);
        
        for (const url of relayUrls) {
            const relay = this.relays.get(url);
            if (relay && relay.readyState === WebSocket.OPEN) {
                const close = JSON.stringify(['CLOSE', subscriptionId]);
                relay.send(close);
            }
        }
    }

    // イベント公開
    async publishEvent(event, relayUrls = this.defaultRelays) {
        for (const url of relayUrls) {
            const relay = await this.connectRelay(url);
            const eventMsg = JSON.stringify(['EVENT', event]);
            relay.send(eventMsg);
        }
    }

    // イベント作成（署名は簡易版）
    createEvent(kind, content, tags = []) {
        const event = {
            kind,
            created_at: Math.floor(Date.now() / 1000),
            tags,
            content,
            pubkey: this.publicKey || '',
            id: '',
            sig: ''
        };

        // 実際はハッシュ計算と署名が必要
        event.id = this.generateEventId(event);
        event.sig = this.signEvent(event);

        return event;
    }

    // イベントID生成（簡易版）
    generateEventId(event) {
        const serialized = JSON.stringify([
            0,
            event.pubkey,
            event.created_at,
            event.kind,
            event.tags,
            event.content
        ]);
        // 実際はsha256ハッシュ
        return Array.from(new TextEncoder().encode(serialized))
            .slice(0, 32)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // イベント署名（簡易版）
    signEvent(event) {
        // 実際はsecp256k1署名
        return '00'.repeat(64);
    }

    // ローカルストレージにキー保存
    saveKeys(privateKey, publicKey) {
        localStorage.setItem('nostr_private_key', privateKey);
        localStorage.setItem('nostr_public_key', publicKey);
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    // ローカルストレージからキー読み込み
    loadKeys() {
        this.privateKey = localStorage.getItem('nostr_private_key');
        this.publicKey = localStorage.getItem('nostr_public_key');
        return { privateKey: this.privateKey, publicKey: this.publicKey };
    }

    // タイムスタンプを相対時間に変換
    formatRelativeTime(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        if (diff < 60) return `${diff}秒前`;
        if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
        
        const date = new Date(timestamp * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
}

// グローバルインスタンス
const nostrClient = new NostrClient();
