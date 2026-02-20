// ===== プレイヤークラス =====

class Player {
    /**
     * プレイヤーのコンストラクタ
     * @param {number} x - 初期X座標
     * @param {number} y - 初期Y座標
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        this.speed = CONFIG.PLAYER.SPEED;
        this.color = CONFIG.COLORS.PLAYER;
        
        // ライフ管理
        this.lives = CONFIG.PLAYER.START_LIVES;
        this.maxLives = CONFIG.PLAYER.MAX_LIVES;
        
        // 射撃管理
        this.lastShootTime = 0;
        this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
        
        // 移動状態
        this.movingLeft = false;
        this.movingRight = false;
        
        // 無敵時間
        this.invincible = false;
        this.invincibleEndTime = 0;
        
        // パワーアップ状態
        this.powerups = {
            rapidFire: { active: false, endTime: 0 },
            shield: { active: false, endTime: 0 },
            scoreBoost: { active: false, endTime: 0 },
            wideShot: { active: false, endTime: 0 }
        };
        
        // アニメーション
        this.blinkTimer = 0;
        this.visible = true;
    }

    /**
     * プレイヤーの更新
     * @param {number} currentTime - 現在時刻
     */
    update(currentTime) {
        // 移動処理
        if (this.movingLeft) {
            this.x -= this.speed;
        }
        if (this.movingRight) {
            this.x += this.speed;
        }

        // 画面内に制限
        this.x = Utils.clamp(
            this.x,
            this.width / 2,
            CONFIG.CANVAS.WIDTH - this.width / 2
        );

        // 無敵時間の処理
        if (this.invincible && currentTime >= this.invincibleEndTime) {
            this.invincible = false;
            this.visible = true;
        }

        // 無敵時の点滅エフェクト
        if (this.invincible) {
            this.blinkTimer++;
            if (this.blinkTimer % 10 === 0) {
                this.visible = !this.visible;
            }
        }

        // パワーアップの期限チェック
        this.updatePowerups(currentTime);
    }

    /**
     * パワーアップの更新
     * @param {number} currentTime - 現在時刻
     */
    updatePowerups(currentTime) {
        for (const [key, powerup] of Object.entries(this.powerups)) {
            if (powerup.active && currentTime >= powerup.endTime) {
                powerup.active = false;
                
                // パワーアップ終了時の処理
                if (key === 'rapidFire') {
                    this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
                }
            }
        }
    }

    /**
     * プレイヤーの描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        if (!this.visible) return;

        ctx.save();

        // シールドエフェクト
        if (this.powerups.shield.active) {
            ctx.strokeStyle = CONFIG.COLORS.SHIELD_EFFECT;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                Math.round(this.x),
                Math.round(this.y),
                this.width,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            ctx.fillStyle = CONFIG.COLORS.SHIELD_EFFECT;
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

        // プレイヤー本体の描画（三角形の宇宙船）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(Math.round(this.x), Math.round(this.y - this.height / 2));
        ctx.lineTo(
            Math.round(this.x - this.width / 2),
            Math.round(this.y + this.height / 2)
        );
        ctx.lineTo(
            Math.round(this.x + this.width / 2),
            Math.round(this.y + this.height / 2)
        );
        ctx.closePath();
        ctx.fill();

        // 光のエフェクト
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();

        // ワイドショットエフェクト（翼を追加）
        if (this.powerups.wideShot.active) {
            ctx.fillStyle = CONFIG.COLORS.POWERUP.WIDE_SHOT;
            // 左翼
            ctx.beginPath();
            ctx.moveTo(
                Math.round(this.x - this.width / 2),
                Math.round(this.y)
            );
            ctx.lineTo(
                Math.round(this.x - this.width),
                Math.round(this.y + this.height / 4)
            );
            ctx.lineTo(
                Math.round(this.x - this.width / 2),
                Math.round(this.y + this.height / 2)
            );
            ctx.closePath();
            ctx.fill();
            
            // 右翼
            ctx.beginPath();
            ctx.moveTo(
                Math.round(this.x + this.width / 2),
                Math.round(this.y)
            );
            ctx.lineTo(
                Math.round(this.x + this.width),
                Math.round(this.y + this.height / 4)
            );
            ctx.lineTo(
                Math.round(this.x + this.width / 2),
                Math.round(this.y + this.height / 2)
            );
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // デバッグモード：ヒットボックス表示
        if (CONFIG.DEBUG.SHOW_HITBOXES) {
            ctx.strokeStyle = '#00ff00';
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
     * 射撃
     * @param {number} currentTime - 現在時刻
     * @returns {Array<Bullet>} 生成された弾丸の配列
     */
    shoot(currentTime) {
        const bullets = [];
        
        // クールダウンチェック
        if (currentTime - this.lastShootTime < this.shootCooldown) {
            return bullets;
        }

        this.lastShootTime = currentTime;

        // ワイドショットの場合
        if (this.powerups.wideShot.active) {
            const spread = CONFIG.POWERUP.EFFECTS.WIDE_SHOT.ANGLE_SPREAD;
            const count = CONFIG.POWERUP.EFFECTS.WIDE_SHOT.BULLET_COUNT;
            
            for (let i = 0; i < count; i++) {
                const angle = (i - Math.floor(count / 2)) * spread;
                bullets.push(new Bullet(this.x, this.y - this.height / 2, true, angle));
            }
        } else {
            // 通常射撃
            bullets.push(new Bullet(this.x, this.y - this.height / 2, true));
        }

        return bullets;
    }

    /**
     * ダメージを受ける
     * @param {number} currentTime - 現在時刻
     * @returns {boolean} ダメージを受けたかどうか
     */
    takeDamage(currentTime) {
        // 無敵時間中またはシールド有効時はダメージを受けない
        if (this.invincible || this.powerups.shield.active || CONFIG.DEBUG.GOD_MODE) {
            return false;
        }

        this.lives--;
        
        if (this.lives > 0) {
            // 無敵時間を設定
            this.invincible = true;
            this.invincibleEndTime = currentTime + CONFIG.PLAYER.INVINCIBLE_TIME;
            this.blinkTimer = 0;
        }

        return true;
    }

    /**
     * パワーアップを適用
     * @param {string} type - パワーアップタイプ
     * @param {number} currentTime - 現在時刻
     */
    applyPowerup(type, currentTime) {
        switch (type) {
            case 'rapidFire':
                this.powerups.rapidFire.active = true;
                this.powerups.rapidFire.endTime = 
                    currentTime + CONFIG.POWERUP.DURATION.RAPID_FIRE;
                this.shootCooldown = 
                    CONFIG.PLAYER.SHOOT_COOLDOWN * 
                    CONFIG.POWERUP.EFFECTS.RAPID_FIRE.COOLDOWN_MULTIPLIER;
                break;
                
            case 'shield':
                this.powerups.shield.active = true;
                this.powerups.shield.endTime = 
                    currentTime + CONFIG.POWERUP.DURATION.SHIELD;
                break;
                
            case 'scoreBoost':
                this.powerups.scoreBoost.active = true;
                this.powerups.scoreBoost.endTime = 
                    currentTime + CONFIG.POWERUP.DURATION.SCORE_BOOST;
                break;
                
            case 'wideShot':
                this.powerups.wideShot.active = true;
                this.powerups.wideShot.endTime = 
                    currentTime + CONFIG.POWERUP.DURATION.WIDE_SHOT;
                break;
        }
    }

    /**
     * ライフを回復
     * @param {number} amount - 回復量
     */
    heal(amount = 1) {
        this.lives = Math.min(this.lives + amount, this.maxLives);
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
     * 位置をリセット
     */
    resetPosition() {
        this.x = CONFIG.CANVAS.WIDTH / 2;
        this.y = CONFIG.CANVAS.HEIGHT - CONFIG.PLAYER.RESPAWN_Y_OFFSET;
    }

    /**
     * プレイヤーをリセット（新しいゲーム用）
     * @param {number} difficulty - 難易度設定
     */
    reset(difficulty) {
        this.resetPosition();
        this.lives = difficulty.PLAYER_LIVES;
        this.invincible = false;
        this.visible = true;
        this.movingLeft = false;
        this.movingRight = false;
        this.lastShootTime = 0;
        this.shootCooldown = CONFIG.PLAYER.SHOOT_COOLDOWN;
        
        // パワーアップをリセット
        for (const powerup of Object.values(this.powerups)) {
            powerup.active = false;
            powerup.endTime = 0;
        }
    }

    /**
     * 生存しているかどうか
     * @returns {boolean}
     */
    isAlive() {
        return this.lives > 0;
    }

    /**
     * スコアブースト有効かどうか
     * @returns {boolean}
     */
    hasScoreBoost() {
        return this.powerups.scoreBoost.active;
    }

    /**
     * アクティブなパワーアップを取得
     * @returns {Array<Object>} {type, timeLeft}
     */
    getActivePowerups(currentTime) {
        const active = [];
        
        for (const [type, powerup] of Object.entries(this.powerups)) {
            if (powerup.active) {
                active.push({
                    type,
                    timeLeft: Math.max(0, powerup.endTime - currentTime)
                });
            }
        }
        
        return active;
    }
}