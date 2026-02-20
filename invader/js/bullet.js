// ===== 弾丸クラス =====

class Bullet {
    /**
     * 弾丸のコンストラクタ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {boolean} isPlayerBullet - プレイヤーの弾丸かどうか
     * @param {number} angle - 発射角度（度）デフォルトは0（真上/真下）
     */
    constructor(x, y, isPlayerBullet = true, angle = 0) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.BULLET.WIDTH;
        this.height = CONFIG.BULLET.HEIGHT;
        this.isPlayerBullet = isPlayerBullet;
        this.active = true;
        
        // 角度をラジアンに変換
        const radians = Utils.degreesToRadians(angle);
        
        // 速度を計算
        const speed = isPlayerBullet ? CONFIG.BULLET.PLAYER_SPEED : CONFIG.BULLET.ENEMY_SPEED;
        
        if (isPlayerBullet) {
            // プレイヤーの弾丸は上方向（角度を考慮）
            this.vx = Math.sin(radians) * speed;
            this.vy = -Math.cos(radians) * speed;
        } else {
            // 敵の弾丸は下方向
            this.vx = 0;
            this.vy = speed;
        }
        
        // 色の設定
        this.color = isPlayerBullet ? 
            CONFIG.COLORS.PLAYER_BULLET : 
            CONFIG.COLORS.ENEMY_BULLET;
    }

    /**
     * 弾丸の更新
     */
    update() {
        if (!this.active) return;

        // 位置を更新
        this.x += this.vx;
        this.y += this.vy;

        // 画面外に出たら非アクティブ化
        if (this.y < -this.height || 
            this.y > CONFIG.CANVAS.HEIGHT + this.height ||
            this.x < -this.width ||
            this.x > CONFIG.CANVAS.WIDTH + this.width) {
            this.active = false;
        }
    }

    /**
     * 弾丸の描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // 弾丸の描画
        if (this.isPlayerBullet) {
            // プレイヤーの弾丸（細長い矩形）
            ctx.fillStyle = this.color;
            ctx.fillRect(
                Math.round(this.x - this.width / 2),
                Math.round(this.y),
                this.width,
                this.height
            );
            
            // 光のエフェクト
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillRect(
                Math.round(this.x - this.width / 2),
                Math.round(this.y),
                this.width,
                this.height
            );
        } else {
            // 敵の弾丸（円形）
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(
                Math.round(this.x),
                Math.round(this.y),
                this.width,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // 光のエフェクト
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(
                Math.round(this.x),
                Math.round(this.y),
                this.width,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.restore();

        // デバッグモード：ヒットボックス表示
        if (CONFIG.DEBUG.SHOW_HITBOXES) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                Math.round(this.x - this.width / 2),
                Math.round(this.y - this.height / 2),
                this.width,
                this.height
            );
        }
    }

    /**
     * 衝突判定用の矩形を取得
     * @returns {Object} {x, y, width, height}
     */
    getHitbox() {
        if (this.isPlayerBullet) {
            return {
                x: this.x - this.width / 2,
                y: this.y,
                width: this.width,
                height: this.height
            };
        } else {
            // 敵の弾丸は円形なので、矩形に近似
            return {
                x: this.x - this.width,
                y: this.y - this.width,
                width: this.width * 2,
                height: this.width * 2
            };
        }
    }

    /**
     * 弾丸を非アクティブ化
     */
    deactivate() {
        this.active = false;
    }

    /**
     * 弾丸がアクティブかどうか
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }
}

// ===== パーティクルクラス（爆発エフェクト用） =====

class Particle {
    /**
     * パーティクルのコンストラクタ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} color - 色
     */
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Utils.randomFloat(2, CONFIG.PARTICLE.EXPLOSION_SIZE);
        
        // ランダムな速度
        const velocity = Utils.randomVelocity(
            Utils.randomFloat(1, CONFIG.PARTICLE.EXPLOSION_SPEED)
        );
        this.vx = velocity.vx;
        this.vy = velocity.vy;
        
        this.life = CONFIG.PARTICLE.EXPLOSION_LIFE;
        this.maxLife = this.life;
        this.active = true;
    }

    /**
     * パーティクルの更新
     */
    update() {
        if (!this.active) return;

        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // 重力効果（オプション）
        this.vy += 0.1;

        if (this.life <= 0) {
            this.active = false;
        }
    }

    /**
     * パーティクルの描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        if (!this.active) return;

        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            Math.round(this.x),
            Math.round(this.y),
            this.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    /**
     * パーティクルがアクティブかどうか
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }
}

// ===== 爆発エフェクトマネージャー =====

class ExplosionManager {
    constructor() {
        this.particles = [];
    }

    /**
     * 爆発を生成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} type - 爆発タイプ（'player', 'enemy', 'powerup'）
     */
    createExplosion(x, y, type = 'enemy') {
        let colors;
        let count;

        switch (type) {
            case 'player':
                colors = [CONFIG.COLORS.PLAYER, '#ffffff', '#ffff00'];
                count = CONFIG.PARTICLE.EXPLOSION_COUNT * 1.5;
                break;
            case 'powerup':
                colors = ['#ff00ff', '#00ffff', '#ffff00', '#ffffff'];
                count = CONFIG.PARTICLE.EXPLOSION_COUNT * 0.8;
                break;
            case 'enemy':
            default:
                colors = CONFIG.COLORS.EXPLOSION;
                count = CONFIG.PARTICLE.EXPLOSION_COUNT;
                break;
        }

        for (let i = 0; i < count; i++) {
            const color = Utils.randomChoice(colors);
            this.particles.push(new Particle(x, y, color));
        }
    }

    /**
     * すべてのパーティクルを更新
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].isActive()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * すべてのパーティクルを描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    /**
     * すべてのパーティクルをクリア
     */
    clear() {
        this.particles = [];
    }

    /**
     * アクティブなパーティクル数を取得
     * @returns {number}
     */
    getCount() {
        return this.particles.length;
    }
}