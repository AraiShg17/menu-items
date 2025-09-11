# CSS スタイルルール（Cursor用）

このプロジェクトでは CSS Modules を使用し、以下のルールに従ってスタイリングを設計してください。

## 🍎 Apple Human Interface Guidelines準拠

デザインについては[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)を参考にしてください。

### デザイン原則

- **Clarity（明確性）**: 情報を明確に伝達し、不要な装飾を避ける
- **Deference（敬意）**: コンテンツを重視し、UIは控えめに
- **Depth（深さ）**: 階層と動きでコンテンツの重要性を表現

### 参考すべきガイドライン

1. **Typography**: SF Proフォントファミリーの使用
2. **Color**: SF Symbols準拠のシステムカラー
3. **Spacing**: 8pt Grid Systemの活用
4. **Motion**: 自然で意図的なアニメーション
5. **Layout**: [Apple Layout Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout)に従った適切な階層とコントラスト
6. **Safe Areas**: デバイスの安全領域を考慮したレイアウト
7. **Accessibility**: アクセシビリティの考慮

### Layout ガイドライン

[Apple Layout Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout)に従い、以下の原則を適用してください：

#### レイアウト原則

- **Safe Areas**: デバイスの安全領域を考慮したレイアウト（bodyレベルで設定）
- **Adaptive Layout**: 異なる画面サイズに対応した適応的レイアウト
- **Visual Hierarchy**: 明確な視覚的階層の構築
- **Consistent Spacing**: 一貫したスペーシングの使用
- **Content-First**: コンテンツを優先したレイアウト設計

#### レスポンシブデザイン

```css
/* 安全領域の考慮 - bodyレベルで設定 */
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* 適応的レイアウト */
@media (width < 768px) {
  /* モバイルレイアウト */
}

@media (width >= 768px) and (width < 1024px) {
  /* タブレットレイアウト */
}

@media (width >= 1024px) {
  /* デスクトップレイアウト */
}
```

#### 余白感とコンテンツエリア

**余白感の判断基準**：

- **Spacious（ゆとりある）**: コンテンツに十分な呼吸感を与える余白
- **Comfortable（快適）**: 読みやすく、操作しやすい適度な余白
- **Compact（コンパクト）**: 情報密度を高める最小限の余白

**コンテンツエリアの設計原則**：

- デバイスサイズに応じた適切な最大幅を設定
- 中央寄せでコンテンツを配置
- 左右の余白でコンテンツの可読性を確保
- セクション間は十分な余白を設けて視覚的区切りを作成
- **安全領域はbodyレベルで設定し、個別のコンテナでは設定しない**

**コンテナ階層構造**：

```css
/* 1. 全体を囲むコンテナ - padding-inlineなし */
.container {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  /* 背景色や全体レイアウトの設定 */
}

/* 2. セクション - 横幅全体に伸びる */
.section {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  background: var(--section-background); /* 背景色変更が必要な場合 */
  padding-block: var(--spacing-2xl); /* 上下の余白 */
}

/* 3. セクション内のコンテンツエリア */
.sectionInner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--spacing-xl);
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}
```

**設計原則**：

- **Container**: 全体を囲む要素、`padding-inline`なし
- **Section**: 横幅全体に伸びる、背景色変更用
- **Inner**: 最大幅制限と`padding-inline`でレスポンシブ対応

**Container使用ルール**：

1. **Container**: 全体を囲む要素として使用し、`padding-inline`は設定しない
2. **Section**: 各セクションを囲む要素として使用し、横幅全体に伸びる
   - 背景色を変更する場合は`section`に`background`を設定
   - `padding-block`で上下の余白を設定
3. **Inner**: セクション内のコンテンツエリアとして使用
   - `max-width`で最大幅を制限
   - `padding-inline`で左右の余白を設定
   - ブラウザが狭まった時に要素が左右に余白なくくっつくことを防止

#### Container使用例

**HTML構造**：

```html
<div class="container">
  <!-- ヒーローセクション -->
  <section class="section">
    <div class="sectionInner">
      <h1>メインタイトル</h1>
      <p>ヒーローセクションのコンテンツ</p>
    </div>
  </section>

  <!-- 背景色が異なるセクション -->
  <section class="section" style="background: var(--secondary-background);">
    <div class="sectionInner">
      <h2>セクションタイトル</h2>
      <p>背景色が変更されたセクションのコンテンツ</p>
    </div>
  </section>

  <!-- 別のセクション -->
  <section class="section">
    <div class="sectionInner">
      <h2>別のセクション</h2>
      <p>通常の背景色のセクション</p>
    </div>
  </section>
</div>
```

**CSS実装**：

```css
/* 全体を囲むコンテナ */
.container {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  /* 全体の背景色やレイアウト設定 */
  background: var(--background-gradient);
}

/* セクション - 横幅全体に伸びる */
.section {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  padding-block: var(--spacing-2xl);
  /* デフォルトの背景色は透明 */
}

/* セクション内のコンテンツエリア */
.sectionInner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--spacing-xl);
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}

/* レスポンシブ対応 */
@media (width < 768px) {
  .section {
    padding-block: var(--spacing-2xl);
  }

  .sectionInner {
    padding-inline: var(--spacing-lg);
  }
}
```

#### コンテナークエリ

**使用判断基準**：

- コンポーネントの幅に応じてレイアウトを変更したい場合
- 親要素のサイズに基づいて子要素の配置を調整したい場合
- メディアクエリでは対応できない細かいレスポンシブ対応が必要な場合

**設計原則**：

- `container-type: inline-size`でコンテナの幅を監視
- `container-name`でコンテナに名前を付けて識別
- `@container`でコンテナのサイズに応じたスタイルを定義
- 複数のコンテナを組み合わせて柔軟なレイアウトを実現

#### レイアウトパターン

**レイアウト選択の判断基準**：

- **カードレイアウト**: 複数の独立したコンテンツを均等に配置したい場合
- **リストレイアウト**: 順序のある情報を縦に並べて表示したい場合
- **グリッドレイアウト**: 規則的なパターンでコンテンツを配置したい場合
- **フレックスレイアウト**: 要素を横並びで配置し、中央揃えしたい場合

**設計原則**：

- コンテンツの性質に応じて適切なレイアウトを選択
- 8pt Grid Systemに従った一貫したスペーシング
- レスポンシブ対応でモバイルファーストの設計
- 視覚的階層を考慮した配置

## ✅ CSS Modules のルール

### 1. ファイル命名規則

- コンポーネント名と一致させる（例：`Button.module.css`）
- キャメルケースでクラス名を定義

### 2. クラス命名規則

```css
/* ✅ 良い例 */
.button {
  /* スタイル */
}

.primaryButton {
  /* スタイル */
}

/* ❌ 悪い例 */
.btn {
  /* スタイル */
}

.primary-btn {
  /* スタイル */
}
```

### 3. グローバルスタイル

- `globals.css` には以下のみ記述：
  - CSS変数（カスタムプロパティ）
  - リセットCSS
  - ベーススタイル
  - ユーティリティクラス

## 🧩 CSSカスタムプロパティとアニメーション

### `transition` の設定は `:root` で変数化する

```css
:root {
  --transition-default: 0.3s ease;
  --transition-fast: 0.15s ease-in-out;
}
```

### CSS変数をアニメーションさせる場合は `@property` を使う

```css
@property --bg-x {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

.button {
  background-position-x: var(--bg-x);
  transition: --bg-x var(--transition-default);
}

.button:hover {
  --bg-x: 100%;
}
```

### 🎨 グラデーションと色変化

`background-image` の色を hover で変えるには `@property` を使う

```css
@property --color-start {
  syntax: "<color>";
  inherits: false;
  initial-value: #3b82f6;
}

@property --color-end {
  syntax: "<color>";
  inherits: false;
  initial-value: #9333ea;
}

.button {
  background-image: linear-gradient(
    in oklab to right,
    var(--color-start),
    var(--color-end)
  );
  transition:
    --color-start var(--transition-default),
    --color-end var(--transition-default);
}

.button:hover {
  --color-start: #f97316;
  --color-end: #ec4899;
}
```

### 📏 calc-size()関数の活用

```css
/* アコーディオンの実装例 */
.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-default);
}

.accordion-trigger:checked + .accordion-content {
  /* フォールバック */
  height: auto;
  /* calc-size()対応ブラウザ */
  height: calc-size(auto, size);
}

/* 幅の計算例 */
.responsive-element {
  width: calc-size(min-content, size * 1.5);
}

/* calc-size()の書き方パターン */
.element {
  /* 基本形：内容のサイズ */
  width: calc-size(auto, size);

  /* 文字列指定系の第1引数 */
  width: calc-size(fit-content, size);
  width: calc-size(max-content, size);
  width: calc-size(min-content, size);
  width: calc-size(stretch, size);

  /* 固定値を加算 */
  width: calc-size(auto, size + 56px);

  /* 固定値を減算 */
  width: calc-size(auto, size - 20px);

  /* サイズを倍にする */
  width: calc-size(auto, size * 2);

  /* サイズを半分にする */
  width: calc-size(auto, size / 2);

  /* 複雑な計算 */
  width: calc-size(auto, size * 1.5 + 24px);
  width: calc-size(auto, (size + 16px) * 2);
}
```

### 🔄 interpolate-sizeプロパティの設定

```css
:root {
  /* 固有サイズの設定キーワードをアニメーション可能にする */
  interpolate-size: allow-keywords;
}
```

### calc-size()とinterpolate-sizeの使い分け

```css
/* calc-size()を使用したアニメーション */
.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-default);
}

.accordion-trigger:checked + .accordion-content {
  height: auto;
  height: calc-size(auto, size);
}

/* interpolate-sizeを使用したアニメーション */
.accordion-content-interpolate {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-default);
}

.accordion-trigger:checked + .accordion-content-interpolate {
  height: auto; /* interpolate-sizeによりアニメーション可能 */
}
```

## 🎨 デザインシステム

### カラーパレット

```css
:root {
  /* プライマリカラー */
  --primary-start: #3b82f6;
  --primary-end: #9333ea;
  --primary-gradient: linear-gradient(
    in oklab to right,
    var(--primary-start),
    var(--primary-end)
  );

  /* セカンダリカラー */
  --secondary-start: #f97316;
  --secondary-end: #ec4899;
  --secondary-gradient: linear-gradient(
    in oklab to right,
    var(--secondary-start),
    var(--secondary-end)
  );

  /* 背景カラー */
  --background-start: #f8fafc;
  --background-end: #e2e8f0;
  --background-gradient: linear-gradient(
    in oklab to bottom right,
    var(--background-start),
    var(--background-end)
  );

  /* テキストカラー */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #475569;

  /* アクセントカラー */
  --accent-success: #10b981;
  --accent-shadow: color-mix(in oklab, #000 5%, transparent);

  /* ホバー状態の色 */
  --primary-hover-start: #2563eb;
  --primary-hover-end: #7c3aed;
  --secondary-hover-start: #ea580c;
  --secondary-hover-end: #db2777;
}
```

### 色の使用ルール

```css
/* ✅ 良い例 - CSS変数を使用 */
.title {
  background-image: var(--primary-gradient);
  color: var(--text-primary);
}

/* ❌ 悪い例 - 直接色を指定 */
.title {
  background-image: linear-gradient(in oklab to right, #3b82f6, #9333ea);
  color: #1e293b;
}
```

### ダークモード実装ルール

**ダークモード実装時は`light-dark()`を使用して値を設定するようにしてください。**

```css
/* ✅ 良い例 - light-dark()でCSS変数を使用 */
.text {
  color: light-dark(var(--text-primary-light), var(--text-primary-dark));
}

.background {
  background-color: light-dark(var(--background-light), var(--background-dark));
}

.border {
  border-color: light-dark(var(--border-light), var(--border-dark));
}

/* ❌ 悪い例 - 直接色を指定 */
.text {
  color: light-dark(#1e293b, #f1f5f9);
}

/* ❌ 悪い例 - 直接色を指定 */
.text {
  color: #1e293b;
}

/* ❌ 悪い例 - メディアクエリで分離 */
.text {
  color: #1e293b;
}

@media (prefers-color-scheme: dark) {
  .text {
    color: #f1f5f9;
  }
}
```

**light-dark()の使用原則**：

1. **第1引数**: ライトモードの値
2. **第2引数**: ダークモードの値
3. **対応プロパティ**: `color`, `background-color`, `border-color`, `fill`, `stroke`など

**使用場面**：

- テキストカラー
- 背景色
- ボーダー色
- SVGのfill/stroke
- その他の色指定プロパティ

**CSS変数の定義例**：

```css
:root {
  /* ライトモード用の色 */
  --text-primary-light: #1e293b;
  --text-secondary-light: #64748b;
  --background-light: #ffffff;
  --border-light: #e2e8f0;

  /* ダークモード用の色 */
  --text-primary-dark: #f1f5f9;
  --text-secondary-dark: #cbd5e1;
  --background-dark: #0f172a;
  --border-dark: #334155;
}
```

### 重要なルール

1. **定義したCSS変数は必ず使用する**

   - `:root`で定義した色変数は、直接色を指定せずに使用する
   - 新しい色が必要な場合は、まず`:root`で変数として定義する

2. **一貫性の維持**

   - 同じ色を複数箇所で使用する場合は、必ず同じCSS変数を使用する
   - 色の変更は`:root`でのみ行い、個別のコンポーネントでは変更しない

3. **@propertyの使用について**

   - `@property`はブラウザサポートが限定的なため、通常のCSSアニメーションを優先する
   - 必要に応じて`@property`を使用する場合は、適切なフォールバックを提供する
   - `initial-value`でCSS変数を使用する場合は構文エラーに注意する

4. **width設定の優先順位**

   - `width: 100%`の代わりに`width: stretch`を使用する
   - ベンダープレフィックス付きで全ブラウザ対応を確保する
   - マージンがある場合は特に`stretch`が有効

5. **stretchキーワードの活用**

   - `width`, `min-width`, `max-width`, `height`, `min-height`, `max-height`で使用可能
   - `flex-basis`では使用できない
   - 主要ブラウザで実用可（ベンダープレフィックス併用を推奨）
   - 利用可能なスペースを最大限活用する場合に有効

6. **文字詰めの活用**

   - デフォルトではグローバル適用しない（可読性を優先）
   - 見出しやUIラベルなど、強めに詰めたい箇所のみユーティリティクラスで適用
   - `palt`と`pwid`は似て非なる指定。グローバル同時使用は避ける（上書きで意図せぬ結果）
   - 対応フォント（ヒラギノ、游ゴシック体、Noto Sans CJK JP 等）で効果あり。メイリオは非対応
   - 詰まりすぎる場合は`letter-spacing`で必要最小限に調整

7. **calc-size()関数の活用**

   - アコーディオンなどの可変高さ要素のアニメーションに活用
   - フォールバックとして`auto`を先に記述する
   - 固有サイズの変更には対応しないため注意
   - 書き方：`calc-size(auto, size + 固定値)`、`calc-size(auto, size * 倍率)`など
   - 第1引数：文字列指定（`auto`、`fit-content`、`max-content`、`min-content`など）
   - 第2引数：`size`キーワードを使った計算式（`size + 56px`、`size * 2`など）

8. **interpolate-sizeプロパティの設定**

   - `:root`で`interpolate-size: allow-keywords`を設定
   - 固有サイズの設定キーワードをアニメーション可能にする
   - calc-size()とは独立して使用可能
   - `height: auto`などの設定キーワードがアニメーション可能になる

### グラデーションの使用

```css
/* ✅ 良い例 - CSS変数を使用 */
.title {
  background-image: var(--primary-gradient);
}

/* ❌ 悪い例 - 直接色を指定 */
.title {
  background-image: linear-gradient(in oklab to right, #3b82f6, #9333ea);
}
```

### テキストカラーの使用

```css
/* ✅ 良い例 - CSS変数を使用 */
.description {
  color: var(--text-secondary);
}

.features h2 {
  color: var(--text-primary);
}

/* ❌ 悪い例 - 直接色を指定 */
.description {
  color: #64748b;
}
```

### タイポグラフィ

```css
/* フォントファミリー */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
  "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;

/* フォントスムージング */
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### 文字詰めの設定

```css
/* 見出しなど強めに詰めたい */
.kern-palt {
  font-feature-settings: "palt" 1;
}

/* 句読点の詰まりを弱めたい（可読性重視） */
.kern-pwid {
  font-feature-settings: "pwid" 1;
}

/* 仮名のみプロポーショナル */
.kern-pkna {
  font-feature-settings: "pkna" 1;
}

/* 明示的に無効化（継承を打ち消す） */
.kern-off {
  font-feature-settings: normal;
}
```

### 文字詰めの使用ルール

1. **デフォルトは非適用**：本文は可読性を優先し、必要箇所にユーティリティで付与

2. **ユーティリティ運用**：見出しやUIラベルには`.kern-palt`、本文で句読点の詰まりを緩和したい場合は`.kern-pwid`

3. **同時適用しない**：`palt`と`pwid`を併用しない（どちらか一方のみ）

4. **フォント対応の確認**：ヒラギノ/游/Noto は対応、メイリオは非対応

5. **letter-spacingは最小限**：可読性に影響しない範囲で微調整

### スペーシング

```css
/* 8px ベースのスペーシング */
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */

/* コンテナサイズ */
--container-max-width: 1200px;
```

## 📱 レスポンシブデザイン

### ブレークポイント

```css
/* モバイルファースト */
@media (width < 768px) {
  /* モバイルスタイル */
}

@media (width >= 768px) and (width < 1024px) {
  /* タブレットスタイル */
}

@media (width >= 1024px) {
  /* デスクトップスタイル */
}
```

### フレキシブルレイアウト

**フレキシブルレイアウトの設計原則**：

- **コンテナ定義**: `width: stretch`と`margin-inline`を使用
- **レスポンシブ対応**: モバイルでは縦並びに変更
- **中央寄せ**: `justify-content: center`で要素を中央配置
- **適応的レイアウト**: コンテンツに応じて自動調整

```css
/* フレキシブルレイアウト */
.flexLayout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

/* コンテナ定義 */
.container {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  margin-inline: var(--spacing-md);
}

/* レスポンシブ対応 */
@media (width < 768px) {
  .flexLayout {
    flex-direction: column;
    text-align: center;
  }
}
```

### width設定のルール

```css
/* ✅ 良い例 - stretchキーワードを使用 */
button {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  margin-inline: var(--spacing-md);
}

/* ✅ 良い例 - コンテナ定義 */
.container {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  margin-inline: var(--spacing-md);
}

/* ❌ 悪い例 - width: 100%を使用 */
button {
  width: 100%;
  margin-inline: var(--spacing-md);
  /* オーバーフローが発生する可能性 */
}

/* ❌ 悪い例 - calc()で計算 */
button {
  width: calc(100% - 48px);
  margin-inline: 24px;
  /* マージン変更時に計算も変更が必要 */
}
```

### stretchキーワードの使用範囲

```css
/* widthでの使用 - 全ブラウザでサポート */
.element {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}

/* min-widthでの使用 - 全ブラウザでサポート */
.element {
  min-width: -webkit-fill-available;
  min-width: -moz-available;
  min-width: stretch;
}

/* max-widthでの使用 - 全ブラウザでサポート */
.element {
  max-width: -webkit-fill-available;
  max-width: -moz-available;
  max-width: stretch;
}

/* heightでの使用 - 全ブラウザでサポート */
.element {
  height: -webkit-fill-available;
  height: -moz-available;
  height: stretch;
}

/* min-heightでの使用 - 全ブラウザでサポート */
.element {
  min-height: -webkit-fill-available;
  min-height: -moz-available;
  min-height: stretch;
}

/* max-heightでの使用 - 全ブラウザでサポート */
.element {
  max-height: -webkit-fill-available;
  max-height: -moz-available;
  max-height: stretch;
}
```

### stretchキーワードの利点

1. **オーバーフロー防止**: マージンがあっても水平スクロールバーが発生しない
2. **メンテナンス性**: マージン変更時に計算の変更が不要
3. **ブラウザサポート**: 全ブラウザでサポート（ベンダープレフィックス付き）
4. **レスポンシブ対応**: 利用可能な幅に自動調整
5. **多用途対応**: `width`, `min-width`, `max-width`, `height`, `min-height`, `max-height`で使用可能

## 🎯 コンポーネントスタイル

### アコーディオンコンポーネント（details/summary）

#### HTML構造

```html
<details class="accordion">
  <summary class="accordion-summary">
    アコーディオンのタイトル
    <span class="accordion-icon"></span>
  </summary>
  <div class="accordion-content">アコーディオンのコンテンツ</div>
</details>
```

#### アニメーション実装

```css
/* コンテンツエリアのアニメーション */
.accordion-content {
  padding-inline: var(--spacing-lg); /* 左右のパディングは固定 */
  padding-block: 0; /* 上下のパディングは0から開始 */
  height: 0;
  overflow: hidden;
  transition:
    height var(--transition-default),
    padding-block var(--transition-default);
}

/* 開いた時のコンテンツ */
.accordion[open] .accordion-content {
  padding-block: var(--spacing-lg); /* 上下のパディングのみアニメーション */
  height: auto; /* フォールバック */
  height: calc-size(auto, size); /* calc-size()対応ブラウザ */
}
```

#### ::details-content疑似要素を使用した実装（推奨）

```css
/* ::details-content疑似要素を使用したアニメーション */
.accordion::details-content {
  transition:
    height var(--transition-default),
    opacity var(--transition-default),
    content-visibility var(--transition-default) allow-discrete;
  height: 0;
  opacity: 0;
  overflow: clip;
}

.accordion[open]::details-content {
  opacity: 1;
  height: auto;
}
```

#### ::details-content疑似要素の使用ルール

1. **HTML構造**

   - `<details>`と`<summary>`タグを使用
   - コンテンツ用の`<div>`にはクラス名を付けない

2. **CSS実装**

   - `overflow: clip`を使用（`hidden`ではなく）
   - `content-visibility`と`allow-discrete`の組み合わせ
   - `height: auto`は`&[open]::details-content`で設定
   - `opacity`でフェードイン効果を追加
   - `details`要素に`overflow: hidden`を設定しない（フォーカスアウトラインが隠れるため）

3. **アニメーション設定**

   - `height: 0`から`height: auto`へのアニメーション
   - `opacity: 0`から`opacity: 1`へのフェードイン
   - `content-visibility`による表示状態の制御

#### アコーディオンの使用ルール

1. **HTML構造**

   - `<details>`と`<summary>`タグを使用

2. **アニメーション設定**

   - `height: 0`から`height: auto`へのアニメーション
   - `calc-size(auto, size)`でフォールバック対応（`auto`を先に記述）
   - `padding-block`で上下のパディングのみアニメーション
   - `::details-content`疑似要素を使用して`opacity`と`content-visibility`もアニメーション

### ボタンコンポーネント

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.primary {
  background-image: var(--primary-gradient);
  color: white;
}

.secondary {
  background-image: var(--secondary-gradient);
  color: white;
}
```

### カードコンポーネント

```css
.card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px 0 color-mix(in oklab, #000 5%, transparent);
}
```

## 🔧 ユーティリティクラス

### レイアウト

```css
.flex {
  display: flex;
}

.flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
}
```

### スペーシング

```css
.padding {
  padding: 1rem;
}

.margin {
  margin: 1rem;
}
```

## ⚡ パフォーマンス最適化

### CSS最適化

- 不要なセレクタを避ける
- ネストを深くしすぎない（最大3階層）
- 重複するスタイルを避ける

### アニメーション

### モーション配慮（ユーザー設定の尊重）

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

```css
/* パフォーマンスの良いアニメーション */
.element {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

/* GPU加速を活用 */
.element {
  transform: translateZ(0);
  will-change: transform;
}
```

## 🎨 アクセシビリティ

### フォーカス状態

```css
*:focus {
  outline: 2px solid color-mix(in oklab, #3b82f6 50%, transparent);
  outline-offset: 2px;
}
```

### カラーコントラスト

- 最低4.5:1のコントラスト比を維持
- カラーだけでなく、形状やテキストでも情報を伝達

## 📝 コーディング規約

### コメント

```css
/* セクション区切り */
/* ===== ボタンスタイル ===== */

/* 説明コメント */
.button {
  /* ホバー時のアニメーション */
  transition: all 0.3s ease;
}
```

### インデント

- 2スペースでインデント
- 一貫したインデントを維持

### セレクタ順序

1. ベーススタイル
2. 状態スタイル（:hover, :focus等）
3. レスポンシブスタイル

## 🚀 ベストプラクティス

### 1. モジュラー設計

- コンポーネント単位でスタイルを分離
- 再利用可能なクラスを作成

### 2. 一貫性の維持

- デザインシステムに従う
- 命名規則を統一

### 3. パフォーマンス考慮

- 不要なスタイルを削除
- 効率的なセレクタを使用

### 4. メンテナンス性

- 読みやすいコードを書く
- 適切なコメントを追加
