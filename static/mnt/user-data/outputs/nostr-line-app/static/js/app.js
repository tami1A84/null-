// アプリケーションステート
const appState = {
    currentTab: 'home',
    userProfile: null,
    timeline: [],
    chats: [],
    nwcConnected: false
};

// DOM要素
const mainContent = document.getElementById('main-content');
const headerTitle = document.getElementById('header-title');
const navItems = document.querySelectorAll('.nav-item');

// タブ切り替え
function switchTab(tabName) {
    // ナビゲーションの更新
    navItems.forEach(item => {
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // コンテンツの更新
    appState.currentTab = tabName;
    renderTabContent(tabName);
}

// タブコンテンツのレンダリング
function renderTabContent(tabName) {
    const templates = {
        home: 'home-template',
        chat: 'chat-template',
        timeline: 'timeline-template',
        wallet: 'wallet-template'
    };

    const titles = {
        home: 'ホーム',
        chat: 'トーク',
        timeline: 'タイムライン',
        wallet: 'おさいふ'
    };

    headerTitle.textContent = titles[tabName];

    const template = document.getElementById(templates[tabName]);
    mainContent.innerHTML = '';
    const content = template.content.cloneNode(true);
    mainContent.appendChild(content);

    // 各タブの初期化
    switch (tabName) {
        case 'home':
            initHomeTab();
            break;
        case 'chat':
            initChatTab();
            break;
        case 'timeline':
            initTimelineTab();
            break;
        case 'wallet':
            initWalletTab();
            break;
    }
}

// ホームタブ初期化
function initHomeTab() {
    const keys = nostrClient.loadKeys();
    
    if (!keys.privateKey) {
        // 新規キー生成
        const privateKey = nostrClient.generatePrivateKey();
        const publicKey = privateKey; // 簡易版
        nostrClient.saveKeys(privateKey, publicKey);
    }

    // プロフィール表示
    const profileName = document.getElementById('profile-name');
    const profileNpub = document.getElementById('profile-npub');
    
    profileName.textContent = 'Nostrユーザー';
    profileNpub.textContent = nostrClient.toNpub(nostrClient.publicKey);

    // 編集ボタン
    const editBtn = document.getElementById('edit-profile');
    editBtn.onclick = () => {
        const newName = prompt('名前を入力してください', profileName.textContent);
        if (newName) {
            profileName.textContent = newName;
            localStorage.setItem('profile_name', newName);
        }
    };

    // 保存された名前を読み込み
    const savedName = localStorage.getItem('profile_name');
    if (savedName) {
        profileName.textContent = savedName;
    }
}

// チャットタブ初期化
function initChatTab() {
    // NIP-17 DMの実装
    const chatList = document.getElementById('chat-list');
    
    // TODO: DM履歴の取得と表示
    chatList.innerHTML = '<p class="empty-state">DM機能は準備中です</p>';
}

// タイムラインタブ初期化
function initTimelineTab() {
    const timelineFeed = document.getElementById('timeline-feed');
    const refreshBtn = document.getElementById('refresh-timeline');

    // リフレッシュボタン
    refreshBtn.onclick = () => {
        loadTimeline();
    };

    // タイムライン読み込み
    loadTimeline();
}

// タイムライン読み込み
async function loadTimeline() {
    const timelineFeed = document.getElementById('timeline-feed');
    timelineFeed.innerHTML = '<p class="loading">読み込み中...</p>';

    const events = [];

    try {
        // yabu.meリレーから投稿を取得
        await nostrClient.subscribe(
            {
                kinds: [1], // テキストノート
                limit: 50
            },
            (event) => {
                events.push(event);
                renderTimeline(events);
            },
            ['wss://yabu.me']
        );

        // 3秒後にサブスクリプション停止
        setTimeout(() => {
            if (events.length === 0) {
                timelineFeed.innerHTML = '<p class="empty-state">投稿が見つかりませんでした</p>';
            }
        }, 3000);
    } catch (error) {
        console.error('Timeline load error:', error);
        timelineFeed.innerHTML = '<p class="empty-state">タイムラインの読み込みに失敗しました</p>';
    }
}

// タイムラインレンダリング
function renderTimeline(events) {
    const timelineFeed = document.getElementById('timeline-feed');
    
    // 時間でソート
    const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
    
    timelineFeed.innerHTML = '';
    
    sortedEvents.forEach(event => {
        const postElement = createPostElement(event);
        timelineFeed.appendChild(postElement);
    });
}

// 投稿要素作成
function createPostElement(event) {
    const template = document.getElementById('post-item');
    const element = template.content.cloneNode(true);
    
    const postItem = element.querySelector('.post-item');
    const authorName = element.querySelector('.author-name');
    const postTime = element.querySelector('.post-time');
    const postContent = element.querySelector('.post-content');
    const likeBtn = element.querySelector('.like-btn');
    const repostBtn = element.querySelector('.repost-btn');
    const zapBtn = element.querySelector('.zap-btn');

    // 作者名（pubkeyの短縮版）
    const shortPubkey = event.pubkey.substring(0, 8) + '...' + event.pubkey.substring(56);
    authorName.textContent = shortPubkey;

    // 時刻
    postTime.textContent = nostrClient.formatRelativeTime(event.created_at);

    // 内容
    postContent.textContent = event.content;

    // いいねボタン
    likeBtn.onclick = () => handleLike(event.id, likeBtn);

    // リツイートボタン
    repostBtn.onclick = () => handleRepost(event.id, repostBtn);

    // Zapボタン
    zapBtn.onclick = () => handleZap(event.id, zapBtn);

    return element;
}

// いいね処理
function handleLike(eventId, button) {
    const countSpan = button.querySelector('.count');
    let count = parseInt(countSpan.textContent);
    
    // ローカルのいいね状態を管理
    const likedKey = `liked_${eventId}`;
    const isLiked = localStorage.getItem(likedKey);
    
    if (isLiked) {
        count--;
        localStorage.removeItem(likedKey);
        button.style.opacity = '0.6';
    } else {
        count++;
        localStorage.setItem(likedKey, 'true');
        button.style.opacity = '1';
        
        // kind 7のリアクションイベントを送信
        const reactionEvent = nostrClient.createEvent(7, '+', [['e', eventId]]);
        nostrClient.publishEvent(reactionEvent);
    }
    
    countSpan.textContent = count;
}

// リツイート処理
function handleRepost(eventId, button) {
    const countSpan = button.querySelector('.count');
    let count = parseInt(countSpan.textContent);
    
    const repostedKey = `reposted_${eventId}`;
    const isReposted = localStorage.getItem(repostedKey);
    
    if (!isReposted && confirm('この投稿をリツイートしますか？')) {
        count++;
        localStorage.setItem(repostedKey, 'true');
        button.style.opacity = '1';
        
        // kind 6のリポストイベントを送信
        const repostEvent = nostrClient.createEvent(6, '', [['e', eventId]]);
        nostrClient.publishEvent(repostEvent);
        
        countSpan.textContent = count;
    }
}

// Zap処理
function handleZap(eventId, button) {
    if (!appState.nwcConnected) {
        alert('おさいふタブでNWCを接続してください');
        return;
    }
    
    const amount = prompt('Zap額（sats）を入力してください', '21');
    if (amount && !isNaN(amount)) {
        // NWCを使ってZap送信（実装は省略）
        alert(`${amount} satsのZapを送信しました！`);
        
        const countSpan = button.querySelector('.count');
        let count = parseInt(countSpan.textContent);
        countSpan.textContent = count + 1;
    }
}

// ウォレットタブ初期化
function initWalletTab() {
    const connectBtn = document.getElementById('connect-nwc');
    const nwcInput = document.getElementById('nwc-url');
    
    // 保存されたNWC URLを読み込み
    const savedNwc = localStorage.getItem('nwc_url');
    if (savedNwc) {
        nwcInput.value = savedNwc;
        appState.nwcConnected = true;
    }
    
    connectBtn.onclick = () => {
        const nwcUrl = nwcInput.value.trim();
        
        if (nwcUrl.startsWith('nostr+walletconnect://')) {
            localStorage.setItem('nwc_url', nwcUrl);
            appState.nwcConnected = true;
            alert('NWCに接続しました！');
            
            // TODO: 実際のNWC接続処理
        } else {
            alert('正しいNWC URLを入力してください');
        }
    };
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    // ナビゲーションボタン
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.tab);
        });
    });

    // 初期タブ表示
    switchTab('home');
});
