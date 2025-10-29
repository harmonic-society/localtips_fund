// Google Apps ScriptのウェブアプリURL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8Qy11KusZ62sdwrljkhmUmUZ66HzpagIoGqe5eioBNspObVEOS42o2qkSEnn0Ditv9g/exec';

// マイルストーン達成状態を保存
let milestoneAchieved = {
  40: false,
  65: false,
  100: false
};

// データをフォーマットする関数
function formatCurrency(amount, currency = 'JPY') {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}

// 日付をフォーマットする関数
function formatDate(dateValue) {
  if (!dateValue) return '-';

  let date;

  // 数値（Unix timestamp）の場合
  if (typeof dateValue === 'number') {
    date = new Date(dateValue);
  }
  // 文字列の場合
  else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  }
  // Dateオブジェクトの場合
  else if (dateValue instanceof Date) {
    date = dateValue;
  }
  else {
    return '-';
  }

  // 無効な日付の場合
  if (isNaN(date.getTime())) {
    return dateValue.toString();
  }

  // 日本語形式でフォーマット (例: 2025年1月15日)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// 花吹雪アニメーションを作成する関数
function createConfetti(milestone) {
  const colors = [
    '#FF6B35', // オレンジ
    '#F7B801', // イエロー
    '#FFB6C1', // ピンク
    '#FF69B4', // ホットピンク
    '#FFA07A', // ライトサーモン
    '#FFD700', // ゴールド
    '#FF1493', // ディープピンク
    '#FF8C00'  // ダークオレンジ
  ];

  const confettiCount = 50; // 花びらの数
  const container = document.querySelector('.funding-gauge');

  if (!container) return;

  // コンフェッティコンテナを作成
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  confettiContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 1000;
  `;
  container.style.position = 'relative';
  container.appendChild(confettiContainer);

  // 花びらを生成
  for (let i = 0; i < confettiCount; i++) {
    const petal = document.createElement('div');
    petal.className = 'confetti-petal';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 8; // 8-18px
    const startX = Math.random() * 100; // 0-100%
    const duration = Math.random() * 3 + 3; // 3-6秒
    const delay = Math.random() * 0.5; // 0-0.5秒
    const rotationSpeed = Math.random() * 360 + 360; // 360-720度
    const drift = (Math.random() - 0.5) * 200; // -100 to 100px

    petal.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50% 0 50% 0;
      top: -20px;
      left: ${startX}%;
      opacity: 0;
      box-shadow: 0 0 10px ${color}80;
      animation: petalFall ${duration}s ease-in-out ${delay}s forwards;
      --drift: ${drift}px;
      --rotation: ${rotationSpeed}deg;
    `;

    confettiContainer.appendChild(petal);
  }

  // アニメーション終了後にコンテナを削除
  setTimeout(() => {
    confettiContainer.remove();
  }, 7000);
}

// マイルストーン達成をチェックして花吹雪を表示
function checkMilestones(percentage) {
  const milestones = [40, 65, 100];

  milestones.forEach(milestone => {
    if (percentage >= milestone && !milestoneAchieved[milestone]) {
      milestoneAchieved[milestone] = true;

      // 花吹雪アニメーションをトリガー
      setTimeout(() => {
        createConfetti(milestone);

        // マイルストーンラベルを強調
        const milestoneEl = document.querySelector(`.milestone[data-percent="${milestone}"]`);
        if (milestoneEl) {
          milestoneEl.classList.add('milestone-achieved');
          setTimeout(() => {
            milestoneEl.classList.remove('milestone-achieved');
          }, 2000);
        }
      }, 500);
    }
  });
}

// ゲージを更新する関数
function updateGauge(data) {
  const currentAmount = data.current_amount || 0;
  const goalAmount = data.goal_amount || 100000;
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

  // ゲージバーを更新
  const gaugeFill = document.getElementById('gauge-fill');
  if (gaugeFill) {
    gaugeFill.style.width = percentage + '%';
  }

  // 金額表示を更新
  const currentAmountEl = document.getElementById('current-amount');
  if (currentAmountEl) {
    currentAmountEl.textContent = formatCurrency(currentAmount, data.currency);
  }

  const goalAmountEl = document.getElementById('goal-amount');
  if (goalAmountEl) {
    goalAmountEl.textContent = formatCurrency(goalAmount, data.currency);
  }

  // パーセンテージを更新
  const percentageEl = document.getElementById('progress-percentage');
  if (percentageEl) {
    percentageEl.textContent = percentage.toFixed(1) + '%';
  }

  // サポーター数を更新
  const backersCountEl = document.getElementById('backers-count');
  if (backersCountEl) {
    backersCountEl.textContent = data.backers_count || 0;
  }

  // 最終更新日時を更新
  const lastUpdatedEl = document.getElementById('last-updated');
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = formatDate(data.last_updated);
  }

  // マイルストーンチェック
  checkMilestones(percentage);
}

// データを取得する関数
async function fetchFundingData() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();
    updateGauge(data);
  } catch (error) {
    console.error('資金調達データの取得に失敗しました:', error);
  }
}

// ページ読み込み時にデータを取得
document.addEventListener('DOMContentLoaded', () => {
  fetchFundingData();

  // 5分ごとに自動更新（オプション）
  setInterval(fetchFundingData, 5 * 60 * 1000);

  // デモ用: URLにdemo=trueがある場合、花吹雪をテスト表示
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') {
    setTimeout(() => {
      // 40%達成デモ
      createConfetti(40);
      const milestone40 = document.querySelector('.milestone[data-percent="40"]');
      if (milestone40) {
        milestone40.classList.add('milestone-achieved');
        setTimeout(() => milestone40.classList.remove('milestone-achieved'), 2000);
      }

      // 65%達成デモ
      setTimeout(() => {
        createConfetti(65);
        const milestone65 = document.querySelector('.milestone[data-percent="65"]');
        if (milestone65) {
          milestone65.classList.add('milestone-achieved');
          setTimeout(() => milestone65.classList.remove('milestone-achieved'), 2000);
        }
      }, 3000);

      // 100%達成デモ
      setTimeout(() => {
        createConfetti(100);
        const milestone100 = document.querySelector('.milestone[data-percent="100"]');
        if (milestone100) {
          milestone100.classList.add('milestone-achieved');
          setTimeout(() => milestone100.classList.remove('milestone-achieved'), 2000);
        }
      }, 6000);
    }, 1000);
  }
});
