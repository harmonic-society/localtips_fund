// カウントダウンバー
function updateCountdown() {
    const targetDate = new Date('2026-01-01T00:00:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        // カウントダウン終了 - バーを非表示にする
        const countdownBar = document.querySelector('.countdown-bar');
        if (countdownBar) {
            countdownBar.style.display = 'none';
        }
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
}

// 初回実行とインターバル設定
updateCountdown();
setInterval(updateCountdown, 1000);

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// スクロールアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.story-block, .vision-card, .plan-card, .production-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ヘッダーのスクロール効果（将来的にヘッダーを追加する場合）
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // スクロール方向に応じた処理を追加可能
    lastScroll = currentScroll;
});

// フリップカードのタップ対応（モバイル用）
document.addEventListener('DOMContentLoaded', () => {
    const flipCard = document.querySelector('.flip-card');

    if (flipCard) {
        let isFlipped = false;

        flipCard.addEventListener('click', () => {
            isFlipped = !isFlipped;
            const flipCardInner = flipCard.querySelector('.flip-card-inner');

            if (isFlipped) {
                flipCardInner.style.transform = 'rotateY(180deg)';
            } else {
                flipCardInner.style.transform = 'rotateY(0deg)';
            }
        });

        // タッチデバイス用
        flipCard.addEventListener('touchend', (e) => {
            e.preventDefault();
            isFlipped = !isFlipped;
            const flipCardInner = flipCard.querySelector('.flip-card-inner');

            if (isFlipped) {
                flipCardInner.style.transform = 'rotateY(180deg)';
            } else {
                flipCardInner.style.transform = 'rotateY(0deg)';
            }
        });
    }
});
