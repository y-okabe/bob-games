// ===== UI管理クラス =====

class UIManager {
    constructor() {
        // 画面要素の取得
        this.screens = {
            start: document.getElementById('startScreen'),
            difficulty: document.getElementById('difficultyScreen'),
            theme: document.getElementById('themeScreen'),
            instructions: document.getElementById('instructionsScreen'),
            game: document.getElementById('gameScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            gameClear: document.getElementById('gameClearScreen')
        };

        // ボタン要素の取得
        this.buttons = {
            start: document.getElementById('startButton'),
            difficulty: document.getElementById('difficultyButton'),
            theme: document.getElementById('themeButton'),
            instructions: document.getElementById('instructionsButton'),
            backFromDifficulty: document.getElementById('backFromDifficulty'),
            backFromTheme: document.getElementById('backFromTheme'),
            backFromInstructions: document.getElementById('backFromInstructions'),
            resume: document.getElementById('resumeButton'),
            quit: document.getElementById('quitButton'),
            retry: document.getElementById('retryButton'),
            backToMenu: document.getElementById('backToMenuButton'),
            playAgain: document.getElementById('playAgainButton'),
            backToMenuFromClear: document.getElementById('backToMenuFromClear')
        };

        // ゲーム情報表示要素
        this.gameInfo = {
            score: document.getElementById('scoreDisplay'),
            highScore: document.getElementById('gameHighScore'),
            level: document.getElementById('levelDisplay'),
            lives: document.getElementById('livesDisplay'),
            highScoreDisplay: document.getElementById('highScoreDisplay')
        };

        // オーバーレイ
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.levelClearNotification = document.getElementById('levelClearNotification');
        this.powerupDisplay = document.getElementById('powerupDisplay');

        // 現在のテーマ
        this.currentTheme = Utils.loadFromStorage(
            CONFIG.STORAGE_KEYS.THEME,
            CONFIG.THEMES.RETRO
        );
        this.applyTheme(this.currentTheme);

        // 現在の難易度
        this.currentDifficulty = Utils.loadFromStorage(
            CONFIG.STORAGE_KEYS.DIFFICULTY,
            'normal'
        );

        this.setupEventListeners();
        this.updateHighScore();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 難易度選択ボタン
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });

        // テーマ選択ボタン
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.selectTheme(theme);
            });
        });
    }

    /**
     * 画面を表示
     * @param {string} screenName - 画面名
     */
    showScreen(screenName) {
        // すべての画面を非表示
        Object.values(this.screens).forEach(screen => {
            Utils.hide(screen);
        });

        // 指定された画面を表示
        if (this.screens[screenName]) {
            Utils.show(this.screens[screenName]);
        }
    }

    /**
     * スコアを更新
     * @param {number} score - スコア
     */
    updateScore(score) {
        if (this.gameInfo.score) {
            this.gameInfo.score.textContent = Utils.formatNumber(score);
        }
    }

    /**
     * ハイスコアを更新
     * @param {number} highScore - ハイスコア（オプション）
     */
    updateHighScore(highScore = null) {
        if (highScore === null) {
            highScore = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.HIGH_SCORE, 0);
        }

        if (this.gameInfo.highScore) {
            this.gameInfo.highScore.textContent = Utils.formatNumber(highScore);
        }
        if (this.gameInfo.highScoreDisplay) {
            this.gameInfo.highScoreDisplay.textContent = Utils.formatNumber(highScore);
        }
    }

    /**
     * レベルを更新
     * @param {number} level - レベル
     */
    updateLevel(level) {
        if (this.gameInfo.level) {
            this.gameInfo.level.textContent = level;
        }
    }

    /**
     * ライフを更新
     * @param {number} lives - ライフ数
     */
    updateLives(lives) {
        if (this.gameInfo.lives) {
            this.gameInfo.lives.textContent = '❤'.repeat(Math.max(0, lives));
        }
    }

    /**
     * パワーアップ表示を更新
     * @param {Array} activePowerups - アクティブなパワーアップ配列
     */
    updatePowerupDisplay(activePowerups) {
        if (!this.powerupDisplay) return;

        this.powerupDisplay.innerHTML = '';

        activePowerups.forEach(powerup => {
            const div = document.createElement('div');
            div.className = `active-powerup ${powerup.type}`;
            
            const name = this.getPowerupName(powerup.type);
            const timeLeft = Math.ceil(powerup.timeLeft / 1000);
            
            div.innerHTML = `
                <span class="powerup-name">${name}</span>
                <span class="powerup-timer">${timeLeft}s</span>
            `;
            
            this.powerupDisplay.appendChild(div);
        });
    }

    /**
     * パワーアップ名を取得
     * @param {string} type - パワーアップタイプ
     * @returns {string}
     */
    getPowerupName(type) {
        const names = {
            rapidFire: '連射',
            shield: 'シールド',
            scoreBoost: 'スコアブースト',
            wideShot: 'ワイドショット'
        };
        return names[type] || type;
    }

    /**
     * 一時停止オーバーレイを表示/非表示
     * @param {boolean} show - 表示するかどうか
     */
    showPauseOverlay(show) {
        if (this.pauseOverlay) {
            if (show) {
                Utils.show(this.pauseOverlay);
            } else {
                Utils.hide(this.pauseOverlay);
            }
        }
    }

    /**
     * レベルクリア通知を表示
     */
    showLevelClearNotification() {
        if (this.levelClearNotification) {
            Utils.show(this.levelClearNotification);
            setTimeout(() => {
                Utils.hide(this.levelClearNotification);
            }, CONFIG.UI.LEVEL_CLEAR_DISPLAY_TIME);
        }
    }

    /**
     * ゲームオーバー画面を表示
     * @param {number} score - 最終スコア
     * @param {number} level - 到達レベル
     * @param {boolean} isNewHighScore - 新記録かどうか
     */
    showGameOver(score, level, isNewHighScore) {
        document.getElementById('finalScore').textContent = Utils.formatNumber(score);
        document.getElementById('finalLevel').textContent = level;
        
        const newHighScoreElement = document.getElementById('newHighScore');
        if (newHighScoreElement) {
            newHighScoreElement.style.display = isNewHighScore ? 'block' : 'none';
        }

        this.showScreen('gameOver');
    }

    /**
     * ゲームクリア画面を表示
     * @param {number} score - 最終スコア
     * @param {number} level - クリアレベル
     * @param {boolean} isNewHighScore - 新記録かどうか
     */
    showGameClear(score, level, isNewHighScore) {
        document.getElementById('clearScore').textContent = Utils.formatNumber(score);
        document.getElementById('clearLevel').textContent = level;
        
        const newHighScoreElement = document.getElementById('clearNewHighScore');
        if (newHighScoreElement) {
            newHighScoreElement.style.display = isNewHighScore ? 'block' : 'none';
        }

        this.showScreen('gameClear');
    }

    /**
     * 難易度を選択
     * @param {string} difficulty - 難易度
     */
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.DIFFICULTY, difficulty);
        
        // 選択状態を更新
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            if (btn.dataset.difficulty === difficulty) {
                btn.style.background = 'var(--primary-color)';
                btn.style.color = 'var(--background-color)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-color)';
            }
        });
    }

    /**
     * テーマを選択
     * @param {string} theme - テーマ名
     */
    selectTheme(theme) {
        this.currentTheme = theme;
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.THEME, theme);
        this.applyTheme(theme);
        
        // 選択状態を更新
        document.querySelectorAll('.theme-btn').forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.style.background = 'var(--primary-color)';
                btn.style.color = 'var(--background-color)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-color)';
            }
        });
    }

    /**
     * テーマを適用
     * @param {string} theme - テーマ名
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * 現在の難易度を取得
     * @returns {string}
     */
    getCurrentDifficulty() {
        return this.currentDifficulty;
    }

    /**
     * 現在のテーマを取得
     * @returns {string}
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 難易度設定を取得
     * @returns {Object}
     */
    getDifficultySettings() {
        const difficultyMap = {
            easy: CONFIG.DIFFICULTY.EASY,
            normal: CONFIG.DIFFICULTY.NORMAL,
            hard: CONFIG.DIFFICULTY.HARD
        };
        return difficultyMap[this.currentDifficulty] || CONFIG.DIFFICULTY.NORMAL;
    }

    /**
     * ゲーム情報をリセット
     */
    resetGameInfo() {
        this.updateScore(0);
        this.updateLevel(1);
        this.updateLives(3);
        this.powerupDisplay.innerHTML = '';
    }

    /**
     * FPS表示を更新（デバッグ用）
     * @param {number} fps - FPS
     */
    updateFPS(fps) {
        if (!CONFIG.DEBUG.SHOW_FPS) return;
        
        let fpsDisplay = document.getElementById('fpsDisplay');
        if (!fpsDisplay) {
            fpsDisplay = document.createElement('div');
            fpsDisplay.id = 'fpsDisplay';
            fpsDisplay.style.position = 'fixed';
            fpsDisplay.style.top = '10px';
            fpsDisplay.style.left = '10px';
            fpsDisplay.style.color = '#0f0';
            fpsDisplay.style.fontFamily = 'monospace';
            fpsDisplay.style.fontSize = '14px';
            fpsDisplay.style.zIndex = '10000';
            document.body.appendChild(fpsDisplay);
        }
        fpsDisplay.textContent = `FPS: ${Math.round(fps)}`;
    }
}