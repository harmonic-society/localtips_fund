// Google Apps ScriptのウェブアプリURL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8Qy11KusZ62sdwrljkhmUmUZ66HzpagIoGqe5eioBNspObVEOS42o2qkSEnn0Ditv9g/exec';

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
});
