// ===== パワーアップクラス =====

class PowerUp {
    /**
     * パワーアップのコンストラクタ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} type - パワーアップタイプ
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.POWERUP.WIDTH;
        this.height = CONFIG.POWERUP.HEIGHT;
        this.type = type;
        this.speed = CONFIG.POWERUP.SPEED;
        this.active = true;
        
        // タイプごとの設定
        this.setTypeProperties();
        
        // アニメーション
        this.rotation = 0;
        this.pulseTimer = 0;
        this.pulseScale = 1;
    }

    /**
     * タイプごとのプロパティを設定
     */
    setTypeProperties() {
        switch (this.type) {
            case 'rapidFire':
                this.color = CONFIG.COLORS.POWERUP.RAPID_FIRE;
                this.symbol = 'R';
                this.name = '連射';
                break;
            case 'shield':
                this.color = CONFIG.COLORS.POWERUP.SHIELD;
                this.symbol = 'S';
                this.name = 'シールド';
                break;
            case 'scoreBoost':
                this.color = CONFIG.COLORS.POWERUP.SCORE_BOOST;
                this.symbol = 'B';
                this.name = 'スコアブースト';
                break;
            case 'wideShot':
                this.color = CONFIG.COLORS.POWERUP.WIDE_SHOT;
                this.symbol = 'W';
                this.name = 'ワイドショット';
                break;
            default:
                this.color = '#ffffff';
                this.symbol = '?';
                this.name = '不明';
        }
    }

    /**
     * パワーアップの更新
     */
    update() {
        if (!this.active) return;

        // 下に移動
        this.y += this.speed;

        // 回転アニメーション
        this.rotation += 0.05;

        // パルスアニメーション
        this.pulseTimer += 0.1;
        this.pulseScale = 1 + Math.sin(this.pulseTimer) * 0.1;

        // 画面外に出たら非アクティブ化
        if (this.y > CONFIG.CANVAS.HEIGHT + this.height) {
            this.active = false;
        }
    }

    /**
     * パワーアップの描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // 中心に移動
        ctx.translate(Math.round(this.x), Math.round(this.y));
        
        // 回転とスケール
        ctx.rotate(this.rotation);
        ctx.scale(this.pulseScale, this.pulseScale);

        // 外枠（六角形）
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * this.width / 2;
            const y = Math.sin(angle) * this.height / 2;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();

        // 内側の塗りつぶし
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;

        // 光のエフェクト
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.stroke();

        // シンボル文字
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.fillText(this.symbol, 0, 0);

        ctx.restore();

        // デバッグモード：ヒットボックス表示
        if (CONFIG.DEBUG.SHOW_HITBOXES) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 1;
            const hitbox = this.getHitbox();
            ctx.strokeRect(
                Math.round(hitbox.x),
                Math.round(hitbox.y),
                hitbox.width,
                hitbox.height
            );
        }
    }

    /**
     * 衝突判定用の矩形を取得
     * @returns {Object} {x, y, width, height}
     */
    getHitbox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * パワーアップを非アクティブ化
     */
    deactivate() {
        this.active = false;
    }

    /**
     * パワーアップがアクティブかどうか
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * パワーアップのタイプを取得
     * @returns {string}
     */
    getType() {
        return this.type;
    }

    /**
     * パワーアップの名前を取得
     * @returns {string}
     */
    getName() {
        return this.name;
    }
}

// ===== パワーアップマネージャー =====

class PowerUpManager {
    constructor() {
        this.powerups = [];
        this.types = ['rapidFire', 'shield', 'scoreBoost', 'wideShot'];
    }

    /**
     * パワーアップを生成（敵撃破時）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 生成されたかどうか
     */
    spawnPowerUp(x, y) {
        // 確率判定
        if (Math.random() > CONFIG.POWERUP.SPAWN_CHANCE) {
            return false;
        }

        // ランダムなタイプを選択
        const type = Utils.randomChoice(this.types);
        this.powerups.push(new PowerUp(x, y, type));
        return true;
    }

    /**
     * 特定のタイプのパワーアップを生成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} type - パワーアップタイプ
     */
    spawnSpecificPowerUp(x, y, type) {
        if (this.types.includes(type)) {
            this.powerups.push(new PowerUp(x, y, type));
        }
    }

    /**
     * すべてのパワーアップを更新
     */
    update() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            this.powerups[i].update();
            if (!this.powerups[i].isActive()) {
                this.powerups.splice(i, 1);
            }
        }
    }

    /**
     * すべてのパワーアップを描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        this.powerups.forEach(powerup => powerup.draw(ctx));
    }

    /**
     * アクティブなパワーアップを取得
     * @returns {Array<PowerUp>}
     */
    getActivePowerUps() {
        return this.powerups.filter(p => p.isActive());
    }

    /**
     * パワーアップを削除
     * @param {PowerUp} powerup - 削除するパワーアップ
     */
    removePowerUp(powerup) {
        const index = this.powerups.indexOf(powerup);
        if (index > -1) {
            this.powerups.splice(index, 1);
        }
    }

    /**
     * すべてのパワーアップをクリア
     */
    clear() {
        this.powerups = [];
    }

    /**
     * アクティブなパワーアップの数を取得
     * @returns {number}
     */
    getCount() {
        return this.powerups.length;
    }

    /**
     * パワーアップの説明を取得
     * @param {string} type - パワーアップタイプ
     * @returns {string}
     */
    static getDescription(type) {
        switch (type) {
            case 'rapidFire':
                return `連射速度が${CONFIG.POWERUP.DURATION.RAPID_FIRE / 1000}秒間アップ！`;
            case 'shield':
                return `${CONFIG.POWERUP.DURATION.SHIELD / 1000}秒間無敵状態！`;
            case 'scoreBoost':
                return `${CONFIG.POWERUP.DURATION.SCORE_BOOST / 1000}秒間スコア${CONFIG.POWERUP.EFFECTS.SCORE_BOOST.MULTIPLIER}倍！`;
            case 'wideShot':
                return `${CONFIG.POWERUP.DURATION.WIDE_SHOT / 1000}秒間${CONFIG.POWERUP.EFFECTS.WIDE_SHOT.BULLET_COUNT}方向同時射撃！`;
            default:
                return '不明なパワーアップ';
        }
    }

    /**
     * パワーアップの残り時間を取得（ミリ秒）
     * @param {string} type - パワーアップタイプ
     * @returns {number}
     */
    static getDuration(type) {
        switch (type) {
            case 'rapidFire':
                return CONFIG.POWERUP.DURATION.RAPID_FIRE;
            case 'shield':
                return CONFIG.POWERUP.DURATION.SHIELD;
            case 'scoreBoost':
                return CONFIG.POWERUP.DURATION.SCORE_BOOST;
            case 'wideShot':
                return CONFIG.POWERUP.DURATION.WIDE_SHOT;
            default:
                return 0;
        }
    }
}