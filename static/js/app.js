// null² - Nostr Web Client with nostr-login and Amber support

// グローバル変数
let currentUser = null;
let currentTab = 'home';
let relayPool = null;
const YABU_RELAY = 'wss://yabu.me';

// リレー接続用のシンプルなプール
class SimpleRelayPool {
    constructor() {
        this.relays = new Map();
    }

    async connect(url) {
        if (this.relays.has(url)) {
            return this.relays.get(url);
        }

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url);
            const relay = {
                ws,
                url,
                subscriptions: new Map()
            };

            ws.onopen = () => {
                console.log(`Connected to ${url}`);
                this.relays.set(url, relay);
                resolve(relay);
            };

            ws.onerror = (error) => {
                console.error(`Error connecting to ${url}:`, error);
                reject(error);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(relay, data);
                } catch (e) {
                    console.error('Failed to parse message:', e);
                }
            };

            ws.onclose = () => {
                console.log(`Disconnected from ${url}`);
                this.relays.delete(url);
            };
        });
    }

    handleMessage(relay, data) {
        const [type, subId, event] = data;
        
        if (type === 'EVENT') {
            const subscription = relay.subscriptions.get(subId);
            if (subscription && subscription.onEvent) {
                subscription.onEvent(event);
            }
        } else if (type === 'EOSE') {
            const subscription = relay.subscriptions.get(subId);
            if (subscription && subscription.onEose) {
                subscription.onEose();
            }
        }
    }

    async publish(event) {
        const results = [];
        for (const [url, relay] of this.relays) {
            try {
                if (relay.ws.readyState === WebSocket.OPEN) {
                    relay.ws.send(JSON.stringify(['EVENT', event]));
                    results.push({ url, success: true });
                }
            } catch (error) {
                console.error(`Failed to publish to ${url}:`, error);
                results.push({ url, success: false, error });
            }
        }
        return results;
    }

    subscribe(filters, { onEvent, onEose } = {}) {
        const subId = Math.random().toString(36).substring(7);
        
        for (const [url, relay] of this.relays) {
            try {
                relay.subscriptions.set(subId, { onEvent, onEose });
                if (relay.ws.readyState === WebSocket.OPEN) {
                    relay.ws.send(JSON.stringify(['REQ', subId, ...filters]));
                }
            } catch (error) {
                console.error(`Failed to subscribe to ${url}:`, error);
            }
        }

        return {
            unsub: () => {
                for (const relay of this.relays.values()) {
                    relay.subscriptions.delete(subId);
                    if (relay.ws.readyState === WebSocket.OPEN) {
                        relay.ws.send(JSON.stringify(['CLOSE', subId]));
                    }
                }
            }
        };
    }

    close() {
        for (const relay of this.relays.values()) {
            relay.ws.close();
        }
        this.relays.clear();
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing null² app...');
    
    // リレープールの初期化
    relayPool = new SimpleRelayPool();
    
    // yabu.meリレーに接続
    try {
        await relayPool.connect(YABU_RELAY);
    } catch (error) {
        console.error('Failed to connect to yabu.me:', error);
    }
    
    // nostr-loginイベントリスナー
    document.addEventListener('nlAuth', handleNostrLogin);
    
    // UI初期化
    initTabs();
    initButtons();
    initModals();
    
    // 既にログインしているか確認
    checkExistingLogin();
});

// nostr-loginのログインイベント処理
async function handleNostrLogin(e) {
    console.log('Auth event:', e.detail);
    
    if (e.detail.type === 'login' || e.detail.type === 'signup') {
        try {
            // window.nostrからpubkeyを取得
            const pubkey = await window.nostr.getPublicKey();
            currentUser = {
                pubkey: pubkey,
                npub: npubEncode(pubkey)
            };
            
            console.log('Logged in as:', currentUser.npub);
            
            // UIを更新
            updateUIForLoggedInUser();
            
            // プロフィールを読み込み
            await loadProfile(pubkey);
            
            // タイムラインを読み込み
            await loadTimeline();
            
        } catch (error) {
            console.error('Failed to handle login:', error);
            alert('ログインに失敗しました: ' + error.message);
        }
    } else if (e.detail.type === 'logout') {
        currentUser = null;
        updateUIForLoggedOutUser();
    }
}

// 既存のログインをチェック
async function checkExistingLogin() {
    try {
        if (window.nostr) {
            const pubkey = await window.nostr.getPublicKey();
            if (pubkey) {
                currentUser = {
                    pubkey: pubkey,
                    npub: npubEncode(pubkey)
                };
                updateUIForLoggedInUser();
                await loadProfile(pubkey);
                await loadTimeline();
            }
        }
    } catch (error) {
        console.log('Not logged in yet');
    }
}

// ログイン状態に応じたUI更新
function updateUIForLoggedInUser() {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
}

function updateUIForLoggedOutUser() {
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('profile-name').textContent = 'ログインしてください';
    document.getElementById('profile-npub').textContent = '';
    document.getElementById('profile-about').textContent = '';
    document.getElementById('timeline').innerHTML = '<div class="empty-state"><p>ログインしてタイムラインを表示</p></div>';
}

// タブ切り替え
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                if (content.id === `tab-${tabName}`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            const titles = {
                'home': 'ホーム',
                'talk': 'トーク',
                'timeline': 'タイムライン',
                'wallet': 'おさいふ'
            };
            document.getElementById('header-title').textContent = titles[tabName];
            
            currentTab = tabName;
            
            if (tabName === 'timeline' && currentUser) {
                loadTimeline();
            }
        });
    });
}

// ボタン初期化
function initButtons() {
    // ログインボタン
    document.getElementById('login-btn').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
    });
    
    // ログアウトボタン
    document.getElementById('logout-btn').addEventListener('click', () => {
        document.dispatchEvent(new Event('nlLogout'));
        currentUser = null;
        updateUIForLoggedOutUser();
    });
    
    // 投稿ボタン
    document.getElementById('post-btn').addEventListener('click', handlePost);
    
    // プロフィール編集ボタン
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }
        document.getElementById('edit-profile-modal').classList.add('show');
    });
}

// プロフィール読み込み
async function loadProfile(pubkey) {
    try {
        const events = [];
        
        const sub = relayPool.subscribe([{
            kinds: [0],
            authors: [pubkey],
            limit: 1
        }], {
            onEvent: (event) => {
                events.push(event);
            },
            onEose: () => {
                sub.unsub();
                
                if (events.length > 0) {
                    const profile = JSON.parse(events[0].content);
                    document.getElementById('profile-name').textContent = profile.name || 'Anonymous';
                    document.getElementById('profile-npub').textContent = currentUser.npub;
                    document.getElementById('profile-about').textContent = profile.about || '';
                    
                    if (profile.picture) {
                        document.getElementById('profile-avatar').src = profile.picture;
                    }
                    
                    // 編集フォームにも反映
                    document.getElementById('edit-name').value = profile.name || '';
                    document.getElementById('edit-about').value = profile.about || '';
                    document.getElementById('edit-picture').value = profile.picture || '';
                } else {
                    document.getElementById('profile-name').textContent = 'Anonymous';
                    document.getElementById('profile-npub').textContent = currentUser.npub;
                }
            }
        });
        
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

// タイムライン読み込み
async function loadTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '<div class="loading">読み込み中...</div>';
    
    try {
        const events = [];
        const profiles = new Map();
        
        // まず投稿を取得
        const sub = relayPool.subscribe([{
            kinds: [1],
            limit: 50
        }], {
            onEvent: (event) => {
                events.push(event);
            },
            onEose: async () => {
                sub.unsub();
                
                // 作者のpubkeyを集める
                const authors = [...new Set(events.map(e => e.pubkey))];
                
                // 作者のプロフィールを取得
                const profileSub = relayPool.subscribe([{
                    kinds: [0],
                    authors: authors
                }], {
                    onEvent: (event) => {
                        try {
                            const profile = JSON.parse(event.content);
                            profiles.set(event.pubkey, profile);
                        } catch (e) {
                            console.error('Failed to parse profile:', e);
                        }
                    },
                    onEose: () => {
                        profileSub.unsub();
                        
                        // イベントを時間順にソート
                        events.sort((a, b) => b.created_at - a.created_at);
                        
                        // タイムラインを表示
                        timeline.innerHTML = '';
                        events.forEach(event => {
                            const profile = profiles.get(event.pubkey);
                            appendPost(event, timeline, profile);
                        });
                    }
                });
            }
        });
        
    } catch (error) {
        console.error('Failed to load timeline:', error);
        timeline.innerHTML = '<div class="empty-state"><p>タイムラインの読み込みに失敗しました</p></div>';
    }
}

// 投稿処理
async function handlePost() {
    if (!currentUser) {
        alert('ログインしてください');
        document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
        return;
    }
    
    const content = document.getElementById('post-input').value.trim();
    
    if (!content) {
        alert('投稿内容を入力してください');
        return;
    }
    
    const postBtn = document.getElementById('post-btn');
    postBtn.disabled = true;
    postBtn.textContent = '投稿中...';
    
    try {
        // Nostrイベントを作成
        const event = {
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: content,
            pubkey: currentUser.pubkey
        };
        
        // window.nostrで署名
        const signedEvent = await window.nostr.signEvent(event);
        
        // yabu.meリレーに公開
        const results = await relayPool.publish(signedEvent);
        
        console.log('Publish results:', results);
        
        // 投稿成功
        document.getElementById('post-input').value = '';
        alert('投稿しました！');
        
        // タイムラインを更新
        setTimeout(() => loadTimeline(), 1000);
        
    } catch (error) {
        console.error('Failed to post:', error);
        alert('投稿に失敗しました: ' + error.message);
    } finally {
        postBtn.disabled = false;
        postBtn.textContent = '投稿';
    }
}

// 投稿を表示に追加
function appendPost(event, container, profile) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    postDiv.dataset.eventId = event.id;
    
    const timeAgo = getTimeAgo(event.created_at);
    const authorName = profile?.name || 'Anonymous';
    const authorPicture = profile?.picture || '/static/img/default-avatar.svg';
    
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${escapeHtml(authorPicture)}" 
                 alt="Avatar" class="post-avatar" 
                 onerror="this.src='/static/img/default-avatar.svg'">
            <div class="post-author">
                <div class="post-name">${escapeHtml(authorName)}</div>
                <div class="post-time">${timeAgo}</div>
            </div>
        </div>
        <div class="post-content">${escapeHtml(event.content)}</div>
        <div class="post-actions">
            <button class="action-btn like-btn" data-event-id="${event.id}">
                👍 <span class="like-count">0</span>
            </button>
            <button class="action-btn repost-btn" data-event-id="${event.id}">
                🔁 <span class="repost-count">0</span>
            </button>
            <button class="action-btn zap-btn" data-event-id="${event.id}">
                ⚡ Zap
            </button>
        </div>
    `;
    
    container.appendChild(postDiv);
}

// モーダル初期化
function initModals() {
    // プロフィール編集フォーム
    document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }
        
        const name = document.getElementById('edit-name').value;
        const about = document.getElementById('edit-about').value;
        const picture = document.getElementById('edit-picture').value;
        
        try {
            // プロフィールイベント（kind 0）を作成
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
            
            // 署名
            const signedEvent = await window.nostr.signEvent(event);
            
            // yabu.meリレーに公開
            await relayPool.publish(signedEvent);
            
            alert('プロフィールを更新しました！');
            
            // モーダルを閉じる
            document.getElementById('edit-profile-modal').classList.remove('show');
            
            // プロフィールを再読み込み
            setTimeout(() => loadProfile(currentUser.pubkey), 1000);
            
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('プロフィールの更新に失敗しました: ' + error.message);
        }
    });
    
    // モーダルを閉じる
    const closeBtns = document.querySelectorAll('.modal .close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('show');
        });
    });
    
    // モーダル外をクリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    });
}

// ユーティリティ関数

// npubエンコード（簡易版）
function npubEncode(hex) {
    return 'npub1' + hex.substring(0, 20) + '...';
}

// 時間経過を表示
function getTimeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
    
    const date = new Date(timestamp * 1000);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// HTMLエスケープ
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// クリーンアップ
window.addEventListener('beforeunload', () => {
    if (relayPool) {
        relayPool.close();
    }
});
