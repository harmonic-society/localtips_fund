# クラウドファンディングゲージ実装ガイド

Google Sheets + Apps Scriptを使用した静的サイト向けの資金調達ゲージ実装手順

## 概要

この実装方法では：
- Google Sheetsでデータを管理
- Apps Scriptで自動的にJSONデータを公開
- GitHub PagesのJavaScriptから定期的にデータを取得して表示

## メリット

✅ 完全無料
✅ データ更新が簡単（Sheetsを編集するだけ）
✅ リアルタイム更新対応
✅ バックエンド不要
✅ 複数人での管理が可能

---

## 手順1: Google Sheetsの作成

### 1-1. 新しいスプレッドシートを作成

1. [Google Sheets](https://sheets.google.com)にアクセス
2. 「空白のスプレッドシート」を作成
3. シート名を「LocalTips Fund」などに変更

### 1-2. データ構造を設定

以下のようにデータを入力：

| A列（キー） | B列（値） |
|------------|----------|
| current_amount | 0 |
| goal_amount | 100000 |
| currency | JPY |
| last_updated | 2025-01-01 |
| backers_count | 0 |

**サンプルデータ:**
```
A1: current_amount    B1: 0
A2: goal_amount       B2: 100000
A3: currency          B3: JPY
A4: last_updated      B4: 2025-01-01
A5: backers_count     B5: 0
```

---

## 手順2: Apps Scriptの設定

### 2-1. スクリプトエディタを開く

1. Google Sheetsで「拡張機能」→「Apps Script」をクリック
2. 新しいプロジェクトが開きます

### 2-2. スクリプトコードを追加

既存のコードを削除して、以下のコードを貼り付け：

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // データをオブジェクトに変換
  const result = {};
  for (let i = 0; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];

    // 数値に変換できる場合は数値として格納
    if (!isNaN(value) && value !== '') {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }

  // CORS対応のレスポンスを返す
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2-3. デプロイする

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 設定を以下のように変更：
   - **説明**: 「Funding Gauge API」など
   - **次のユーザーとして実行**: 「自分」
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」をクリック
5. 権限の承認を求められるので許可する
6. **ウェブアプリのURL**をコピーして保存（後で使用）

**URLの形式:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## 手順3: HTMLにゲージを実装

### 3-1. HTMLマークアップの追加

`index.html`の適切な位置に以下を追加：

```html
<!-- Funding Gauge Section -->
<section class="funding-gauge">
  <div class="container">
    <h2>現在の支援状況</h2>

    <div class="gauge-container">
      <div class="gauge-bar">
        <div id="gauge-fill" class="gauge-fill" style="width: 0%"></div>
      </div>

      <div class="gauge-info">
        <div class="amount-info">
          <span class="current-amount" id="current-amount">¥0</span>
          <span class="goal-amount">目標: <span id="goal-amount">¥0</span></span>
        </div>
        <div class="progress-percentage" id="progress-percentage">0%</div>
      </div>

      <div class="backers-info">
        <span id="backers-count">0</span>人のサポーター
      </div>

      <div class="last-updated">
        最終更新: <span id="last-updated">-</span>
      </div>
    </div>
  </div>
</section>
```

### 3-2. CSSスタイルの追加

`styles.css`に以下を追加：

```css
/* Funding Gauge Styles */
.funding-gauge {
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.funding-gauge h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
}

.gauge-container {
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.gauge-bar {
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
}

.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff 0%, #00ff88 100%);
  border-radius: 20px;
  transition: width 1s ease-in-out;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.gauge-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.amount-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.current-amount {
  font-size: 2rem;
  font-weight: bold;
}

.goal-amount {
  font-size: 1rem;
  opacity: 0.8;
}

.progress-percentage {
  font-size: 2rem;
  font-weight: bold;
}

.backers-info {
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.last-updated {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.7;
}
```

### 3-3. JavaScriptの追加

新しいファイル `js/funding-gauge.js` を作成：

```javascript
// Google Apps ScriptのウェブアプリURLに置き換えてください
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// データをフォーマットする関数
function formatCurrency(amount, currency = 'JPY') {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
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
    lastUpdatedEl.textContent = data.last_updated || '-';
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
```

### 3-4. HTMLにスクリプトを読み込み

`index.html`の`</body>`タグの直前に追加：

```html
<script src="js/funding-gauge.js"></script>
```

---

## 手順4: 設定とテスト

### 4-1. スクリプトURLの設定

1. `js/funding-gauge.js`の1行目を編集
2. `YOUR_SCRIPT_ID`を手順2-3で取得したURLに置き換え

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';
```

### 4-2. ローカルでテスト

```bash
# ローカルサーバーを起動（Python 3の場合）
python3 -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

### 4-3. 動作確認

1. ページにアクセス
2. ゲージが表示されることを確認
3. Google Sheetsの値を変更
4. ページをリロードして反映を確認

---

## 手順5: データの更新方法

### 日常的な更新手順

1. Google Sheetsを開く
2. 該当のセルの値を更新：
   - `current_amount`: 現在の資金額
   - `backers_count`: サポーター数
   - `last_updated`: 更新日（例: 2025-01-15）
3. 保存（自動保存されます）
4. 数秒待ってサイトをリロード

### 自動更新の設定（オプション）

Apps Scriptで定期実行を設定することも可能です。

---

## トラブルシューティング

### データが取得できない場合

1. **Apps ScriptのURLが正しいか確認**
   - `GOOGLE_SCRIPT_URL`が正しく設定されているか

2. **Apps Scriptのデプロイ設定を確認**
   - 「アクセスできるユーザー」が「全員」になっているか

3. **ブラウザのコンソールでエラーを確認**
   - F12キーで開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

### CORSエラーが出る場合

Apps Scriptのコードが正しく実装されているか確認してください。特に`ContentService.MimeType.JSON`の部分が重要です。

### データが反映されない場合

1. ブラウザのキャッシュをクリア
2. Google Sheetsのデータ形式を確認
3. Apps Scriptを再デプロイ

---

## 応用例

### 目標金額の変更

Google SheetsのB2セルの値を変更するだけでOK

### 複数の資金調達プロジェクト

Sheetsに複数のシートを作成し、Apps Scriptでシート名をパラメータとして受け取る実装も可能

### グラフの追加

Chart.jsなどのライブラリを使って、時系列グラフを追加することも可能

---

## セキュリティとプライバシー

- このAPIは読み取り専用です
- 誰でもデータを閲覧できますが、編集はできません
- Google Sheetsの編集権限は管理者のみが持ちます
- 機密情報は絶対に含めないでください

---

## まとめ

この実装により、以下が実現できます：

✅ リアルタイムでの資金状況の表示
✅ 簡単なデータ更新（Sheetsを編集するだけ）
✅ サーバーレスで完全無料
✅ GitHub Pagesとの完全な互換性

何か問題が発生した場合は、上記のトラブルシューティングセクションを参照してください。
