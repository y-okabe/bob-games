// ===== メインゲームクラス =====

class Game {
    constructor() {
        // キャンバスの初期化
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;

        // マネージャーの初期化
        this.ui = new UIManager();
        this.audio = new AudioManager();
        this.explosionManager = new ExplosionManager();
        this.powerupManager = new PowerUpManager();

        // ゲーム状態
        this.state = CONFIG.GAME_STATE.START;
        this.score = 0;
        this.highScore = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.HIGH_SCORE, 0);
        this.level = 1;
        this.difficulty = null;

        // ゲームオブジェクト
        this.player = null;
        this.enemyFormation = null;
        this.playerBullets = [];
        this.enemyBullets = [];

        // 入力管理
        this.keys = {};
        this.shootPressed = false;

        // タイミング管理
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.fpsCounter = 0;
        this.fpsTime = 0;

        // アニメーションフレームID
        this.animationId = null;

        this.setupEventListeners();
        this.ui.showScreen('start');
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // ボタンイベント
        this.ui.buttons.start.addEventListener('click', () => this.startGame());
        this.ui.buttons.difficulty.addEventListener('click', () => {
            this.ui.showScreen('difficulty');
        });
        this.ui.buttons.theme.addEventListener('click', () => {
            this.ui.showScreen('theme');
        });
        this.ui.buttons.instructions.addEventListener('click', () => {
            this.ui.showScreen('instructions');
        });
        this.ui.buttons.backFromDifficulty.addEventListener('click', () => {
            this.ui.showScreen('start');
        });
        this.ui.buttons.backFromTheme.addEventListener('click', () => {
            this.ui.showScreen('start');
        });
        this.ui.buttons.backFromInstructions.addEventListener('click', () => {
            this.ui.showScreen('start');
        });
        this.ui.buttons.resume.addEventListener('click', () => this.resumeGame());
        this.ui.buttons.quit.addEventListener('click', () => this.quitToMenu());
        this.ui.buttons.retry.addEventListener('click', () => this.startGame());
        this.ui.buttons.backToMenu.addEventListener('click', () => this.quitToMenu());
        this.ui.buttons.playAgain.addEventListener('click', () => this.startGame());
        this.ui.buttons.backToMenuFromClear.addEventListener('click', () => this.quitToMenu());

        // ウィンドウのフォーカス管理
        window.addEventListener('blur', () => {
            if (this.state === CONFIG.GAME_STATE.PLAYING) {
                this.pauseGame();
            }
        });
    }

    /**
     * キーダウンイベント処理
     * @param {KeyboardEvent} e - イベント
     */
    handleKeyDown(e) {
        if (this.state !== CONFIG.GAME_STATE.PLAYING && 
            this.state !== CONFIG.GAME_STATE.PAUSED) {
            return;
        }

        this.keys[e.key] = true;

        // 一時停止
        if (CONFIG.KEYS.PAUSE.includes(e.key)) {
            e.preventDefault();
            if (this.state === CONFIG.GAME_STATE.PLAYING) {
                this.pauseGame();
            } else if (this.state === CONFIG.GAME_STATE.PAUSED) {
                this.resumeGame();
            }
        }

        // 射撃
        if (CONFIG.KEYS.SHOOT.includes(e.key) && !this.shootPressed) {
            e.preventDefault();
            this.shootPressed = true;
            if (this.state === CONFIG.GAME_STATE.PLAYING) {
                this.playerShoot();
            }
        }

        // プレイヤー移動
        if (CONFIG.KEYS.LEFT.includes(e.key)) {
            this.player.movingLeft = true;
        }
        if (CONFIG.KEYS.RIGHT.includes(e.key)) {
            this.player.movingRight = true;
        }
    }

    /**
     * キーアップイベント処理
     * @param {KeyboardEvent} e - イベント
     */
    handleKeyUp(e) {
        this.keys[e.key] = false;

        if (CONFIG.KEYS.SHOOT.includes(e.key)) {
            this.shootPressed = false;
        }

        if (CONFIG.KEYS.LEFT.includes(e.key)) {
            if (this.player) this.player.movingLeft = false;
        }
        if (CONFIG.KEYS.RIGHT.includes(e.key)) {
            if (this.player) this.player.movingRight = false;
        }
    }

    /**
     * ゲーム開始
     */
    startGame() {
        // 難易度設定を取得
        this.difficulty = this.ui.getDifficultySettings();

        // ゲームオブジェクトの初期化
        this.score = 0;
        this.level = 1;
        
        this.player = new Player(
            CONFIG.CANVAS.WIDTH / 2,
            CONFIG.CANVAS.HEIGHT - CONFIG.PLAYER.RESPAWN_Y_OFFSET
        );
        this.player.reset(this.difficulty);

        this.enemyFormation = new EnemyFormation(this.level, this.difficulty);
        
        this.playerBullets = [];
        this.enemyBullets = [];
        this.explosionManager.clear();
        this.powerupManager.clear();

        // UI更新
        this.ui.resetGameInfo();
        this.ui.updateLives(this.player.lives);
        this.ui.showScreen('game');

        // ゲーム状態を設定
        this.state = CONFIG.GAME_STATE.PLAYING;
        this.lastTime = performance.now();

        // ゲームループ開始
        this.gameLoop();
    }

    /**
     * ゲームループ
     * @param {number} currentTime - 現在時刻
     */
    gameLoop(currentTime = 0) {
        if (this.state !== CONFIG.GAME_STATE.PLAYING) {
            return;
        }

        // デルタタイムの計算
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // FPS計算
        this.fpsCounter++;
        this.fpsTime += this.deltaTime;
        if (this.fpsTime >= 1000) {
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTime = 0;
            this.ui.updateFPS(this.fps);
        }

        // 更新
        this.update(currentTime);

        // 描画
        this.render();

        // 次のフレーム
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * ゲーム更新
     * @param {number} currentTime - 現在時刻
     */
    update(currentTime) {
        // プレイヤー更新
        this.player.update(currentTime);

        // 敵編隊更新
        const reachedBottom = this.enemyFormation.update();
        if (reachedBottom) {
            this.gameOver();
            return;
        }

        // 弾丸更新
        this.updateBullets();

        // 敵の射撃
        const newEnemyBullets = this.enemyFormation.shoot();
        if (newEnemyBullets.length > 0) {
            this.enemyBullets.push(...newEnemyBullets);
            this.audio.playEnemyShoot();
        }

        // パワーアップ更新
        this.powerupManager.update();

        // 爆発エフェクト更新
        this.explosionManager.update();

        // 衝突判定
        this.checkCollisions(currentTime);

        // UI更新
        this.ui.updateScore(this.score);
        this.ui.updateLevel(this.level);
        this.ui.updateLives(this.player.lives);
        this.ui.updatePowerupDisplay(this.player.getActivePowerups(currentTime));

        // レベルクリアチェック
        if (this.enemyFormation.allDestroyed()) {
            this.levelClear();
        }

        // ゲームオーバーチェック
        if (!this.player.isAlive()) {
            this.gameOver();
        }
    }

    /**
     * 弾丸の更新
     */
    updateBullets() {
        // プレイヤーの弾丸
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.playerBullets[i].update();
            if (!this.playerBullets[i].isActive()) {
                this.playerBullets.splice(i, 1);
            }
        }

        // 敵の弾丸
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].update();
            if (!this.enemyBullets[i].isActive()) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    /**
     * 衝突判定
     * @param {number} currentTime - 現在時刻
     */
    checkCollisions(currentTime) {
        const playerHitbox = this.player.getHitbox();
        const activeEnemies = this.enemyFormation.getActiveEnemies();

        // プレイヤーの弾丸と敵の衝突
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            const bullet = this.playerBullets[i];
            const bulletHitbox = bullet.getHitbox();

            for (const enemy of activeEnemies) {
                if (!enemy.isActive()) continue;

                const enemyHitbox = enemy.getHitbox();
                if (Utils.checkCollision(bulletHitbox, enemyHitbox)) {
                    // 敵を破壊
                    this.enemyFormation.destroyEnemy(enemy);
                    bullet.deactivate();
                    
                    // スコア加算
                    let points = enemy.getPoints();
                    if (this.player.hasScoreBoost()) {
                        points *= CONFIG.POWERUP.EFFECTS.SCORE_BOOST.MULTIPLIER;
                    }
                    this.score += points;

                    // エフェクトとサウンド
                    this.explosionManager.createExplosion(enemy.x, enemy.y, 'enemy');
                    this.audio.playExplosion('enemy');

                    // パワーアップ生成
                    this.powerupManager.spawnPowerUp(enemy.x, enemy.y);

                    break;
                }
            }
        }

        // 敵の弾丸とプレイヤーの衝突
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            const bulletHitbox = bullet.getHitbox();

            if (Utils.checkCollision(bulletHitbox, playerHitbox)) {
                bullet.deactivate();
                
                if (this.player.takeDamage(currentTime)) {
                    this.explosionManager.createExplosion(
                        this.player.x,
                        this.player.y,
                        'player'
                    );
                    this.audio.playExplosion('player');
                    this.audio.playHit();
                }
            }
        }

        // パワーアップとプレイヤーの衝突
        const activePowerups = this.powerupManager.getActivePowerUps();
        for (const powerup of activePowerups) {
            const powerupHitbox = powerup.getHitbox();
            
            if (Utils.checkCollision(powerupHitbox, playerHitbox)) {
                this.player.applyPowerup(powerup.getType(), currentTime);
                this.powerupManager.removePowerUp(powerup);
                this.audio.playPowerUp();
            }
        }
    }

    /**
     * プレイヤー射撃
     */
    playerShoot() {
        const bullets = this.player.shoot(performance.now());
        if (bullets.length > 0) {
            this.playerBullets.push(...bullets);
            this.audio.playShoot();
        }
    }

    /**
     * ゲーム描画
     */
    render() {
        // 背景クリア
        this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 敵編隊描画
        this.enemyFormation.draw(this.ctx);

        // プレイヤー描画
        this.player.draw(this.ctx);

        // 弾丸描画
        this.playerBullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));

        // パワーアップ描画
        this.powerupManager.draw(this.ctx);

        // 爆発エフェクト描画
        this.explosionManager.draw(this.ctx);
    }

    /**
     * レベルクリア
     */
    levelClear() {
        this.state = CONFIG.GAME_STATE.LEVEL_CLEAR;

        // レベルクリアボーナス
        this.score += CONFIG.LEVEL.CLEAR_BONUS;
        this.ui.updateScore(this.score);

        // サウンド再生
        this.audio.playLevelClear();

        // 通知表示
        this.ui.showLevelClearNotification();

        // 次のレベルへ
        setTimeout(() => {
            this.level++;
            
            if (this.level > CONFIG.LEVEL.MAX_LEVEL) {
                this.gameClear();
            } else {
                this.nextLevel();
            }
        }, CONFIG.UI.LEVEL_CLEAR_DISPLAY_TIME);
    }

    /**
     * 次のレベルへ
     */
    nextLevel() {
        // 敵編隊をリセット
        this.enemyFormation.reset(this.level);

        // 弾丸をクリア
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerupManager.clear();

        // プレイヤーをリセット位置へ
        this.player.resetPosition();

        // ゲーム再開
        this.state = CONFIG.GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    /**
     * ゲームオーバー
     */
    gameOver() {
        this.state = CONFIG.GAME_STATE.GAME_OVER;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // ハイスコア更新
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.HIGH_SCORE, this.highScore);
            this.ui.updateHighScore(this.highScore);
        }

        // サウンド再生
        this.audio.playGameOver();

        // ゲームオーバー画面表示
        setTimeout(() => {
            this.ui.showGameOver(this.score, this.level, isNewHighScore);
        }, 1000);
    }

    /**
     * ゲームクリア
     */
    gameClear() {
        this.state = CONFIG.GAME_STATE.GAME_CLEAR;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // ハイスコア更新
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.HIGH_SCORE, this.highScore);
            this.ui.updateHighScore(this.highScore);
        }

        // サウンド再生
        this.audio.playGameClear();

        // ゲームクリア画面表示
        setTimeout(() => {
            this.ui.showGameClear(this.score, this.level, isNewHighScore);
        }, 1000);
    }

    /**
     * ゲーム一時停止
     */
    pauseGame() {
        if (this.state !== CONFIG.GAME_STATE.PLAYING) return;

        this.state = CONFIG.GAME_STATE.PAUSED;
        this.ui.showPauseOverlay(true);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    /**
     * ゲーム再開
     */
    resumeGame() {
        if (this.state !== CONFIG.GAME_STATE.PAUSED) return;

        this.state = CONFIG.GAME_STATE.PLAYING;
        this.ui.showPauseOverlay(false);
        this.lastTime = performance.now();
        this.gameLoop();
    }

    /**
     * メニューに戻る
     */
    quitToMenu() {
        this.state = CONFIG.GAME_STATE.START;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.ui.showPauseOverlay(false);
        this.ui.showScreen('start');
        this.audio.stopAll();
    }
}

// ===== ゲーム初期化 =====

let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});