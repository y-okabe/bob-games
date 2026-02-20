# 🎮 Retro Game Arcade

レトロゲームコレクションのメインメニューサイトです。クラシックなゲームを楽しめるアーケード風のインターフェースを提供します。

## 🕹️ 収録ゲーム

### 1. Space Invaders
クラシックなシューティングゲーム。侵略者を撃退して高得点を目指そう！

**特徴:**
- 複数の難易度設定
- パワーアップシステム
- テーマ変更機能
- ハイスコア記録

**操作方法:**
- ← → : 移動
- SPACE : 射撃
- ESC/P : 一時停止

### 2. Retro Tetris
永遠の名作パズルゲーム。落ちてくるブロックを揃えて消そう！

**特徴:**
- レトロなCRT風デザイン
- タッチ操作対応
- レベルシステム
- ハイスコア記録

**操作方法:**
- ← → : 移動
- ↑ : 回転
- ↓ : ソフトドロップ
- SPACE : ハードドロップ
- P : 一時停止

## 🚀 使い方

### ローカルで実行

1. このリポジトリをクローンまたはダウンロード
```bash
git clone <repository-url>
cd bob-games
```

2. ブラウザで `index.html` を開く
```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

### Webサーバーで実行（推奨）

```bash
# Python 3を使用
python -m http.server 8000

# Node.jsのhttp-serverを使用
npx http-server

# VSCodeのLive Serverを使用
# VSCodeでindex.htmlを開き、右クリック → "Open with Live Server"
```

ブラウザで `http://localhost:8000` にアクセス

## 📁 プロジェクト構造

```
bob-games/
├── index.html              # メインメニュー
├── style.css              # メインメニューのスタイル
├── main.js                # メインメニューのJavaScript
├── README.md              # このファイル
├── invader/               # Space Invadersゲーム
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
└── retro-tetris/          # Tetrisゲーム
    ├── index.html
    ├── style.css
    └── game.js
```

## ✨ 機能

### メインメニュー
- 🌟 美しい星空アニメーション
- 🎨 ネオン風のレトロデザイン
- 📱 レスポンシブデザイン（モバイル対応）
- ⌨️ キーボードナビゲーション（矢印キー + Enter）
- 🔊 サウンドエフェクト
- 🏆 ハイスコア表示
- 🎯 スムーズなアニメーション効果

### 各ゲーム
- 💾 ローカルストレージでハイスコア保存
- 🎮 直感的な操作
- 📊 詳細な統計情報
- 🏠 メインメニューへの簡単な戻り機能

## 🎨 デザインコンセプト

- **レトロアーケード**: 80年代のアーケードゲームの雰囲気を再現
- **ネオンカラー**: 鮮やかなネオンカラーで視覚的なインパクト
- **アニメーション**: スムーズで魅力的なアニメーション効果
- **レスポンシブ**: あらゆるデバイスで快適にプレイ可能

## 🛠️ 技術スタック

- **HTML5**: セマンティックなマークアップ
- **CSS3**: 
  - Flexbox & Grid レイアウト
  - CSS アニメーション
  - カスタムプロパティ（CSS変数）
  - メディアクエリ
- **JavaScript (Vanilla)**:
  - ES6+ 構文
  - Web Audio API
  - Local Storage API
  - Intersection Observer API
  - Canvas API（ゲーム描画）

## 🌐 ブラウザ対応

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 モバイル対応

- タッチ操作に最適化
- レスポンシブレイアウト
- スワイプジェスチャー対応（Tetris）

## ⚡ パフォーマンス最適化

- Intersection Observer による遅延アニメーション
- CSS Transform による GPU アクセラレーション
- 効率的なイベントハンドリング
- 最小限のDOM操作

## 🎯 今後の予定

- [ ] 新しいゲームの追加
- [ ] オンラインランキング機能
- [ ] マルチプレイヤー対応
- [ ] アチーブメントシステム
- [ ] カスタムテーマ機能

## 📄 ライセンス

各ゲームのライセンスについては、それぞれのディレクトリ内のLICENSEファイルを参照してください。

## 👤 作者

**Yuta Okabe**

Made with ❤️ for classic gaming enthusiasts

## 🙏 謝辞

レトロゲームの素晴らしい思い出と、それを作り上げた先人たちに感謝します。

---

**楽しいゲーム体験を！** 🎮✨