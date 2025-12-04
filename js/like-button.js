// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyCi0nt6jRv_Phy6sSwqoGJHqZmJFfLxN6E",
    authDomain: "localtips-fund.firebaseapp.com",
    databaseURL: "https://localtips-fund-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "localtips-fund",
    storageBucket: "localtips-fund.firebasestorage.app",
    messagingSenderId: "4816791562",
    appId: "1:4816791562:web:fea0474e8723706be2d7f3"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// いいね機能
const LIKE_STORAGE_KEY = 'localtips_liked';

// いいね済みかチェック
function hasLiked() {
    return localStorage.getItem(LIKE_STORAGE_KEY) === 'true';
}

// いいね済みとして保存
function setLiked() {
    localStorage.setItem(LIKE_STORAGE_KEY, 'true');
}

// ボタンの状態を更新
function updateButtonState(button, liked) {
    const icon = button.querySelector('.like-icon');
    if (liked) {
        button.classList.add('liked');
        button.disabled = true;
        icon.innerHTML = '&#9829;'; // 塗りつぶしハート
    } else {
        button.classList.remove('liked');
        button.disabled = false;
        icon.innerHTML = '&#9825;'; // 白抜きハート
    }
}

// いいね数を取得・監視
function watchLikeCount() {
    const likeCountEl = document.getElementById('like-count');
    const likesRef = database.ref('likes/count');

    likesRef.on('value', (snapshot) => {
        const count = snapshot.val() || 0;
        if (likeCountEl) {
            likeCountEl.textContent = count;
        }
    });
}

// いいねを追加
async function addLike() {
    const likesRef = database.ref('likes/count');

    try {
        await likesRef.transaction((currentCount) => {
            return (currentCount || 0) + 1;
        });
        return true;
    } catch (error) {
        console.error('いいねの追加に失敗しました:', error);
        return false;
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    const likeButton = document.getElementById('like-button');

    if (!likeButton) return;

    // いいね数の監視を開始
    watchLikeCount();

    // 既にいいね済みかチェック
    if (hasLiked()) {
        updateButtonState(likeButton, true);
    }

    // クリックイベント
    likeButton.addEventListener('click', async () => {
        if (hasLiked()) return;

        // ボタンを一時的に無効化
        likeButton.disabled = true;

        const success = await addLike();

        if (success) {
            setLiked();
            updateButtonState(likeButton, true);

            // アニメーション効果
            likeButton.classList.add('like-animation');
            setTimeout(() => {
                likeButton.classList.remove('like-animation');
            }, 600);
        } else {
            // 失敗した場合はボタンを再度有効化
            likeButton.disabled = false;
        }
    });
});
