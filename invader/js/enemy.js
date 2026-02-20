// ===== 敵クラス =====

class Enemy {
    /**
     * 敵のコンストラクタ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} row - 行番号（0-4）
     * @param {number} col - 列番号
     */
    constructor(x, y, row, col) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.ENEMY.WIDTH;
        this.height = CONFIG.ENEMY.HEIGHT;
        this.row = row;
        this.col = col;
        this.active = true;
        this.color = CONFIG.COLORS.ENEMY;
        
        // 行によってポイントを設定
        this.points = CONFIG.ENEMY.POINTS[`ROW_${row + 1}`];
        
        // アニメーション用
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    /**
     * 敵の更新
     */
    update() {
        if (!this.active) return;

        // アニメーション更新
        this.animationTimer++;
        if (this.animationTimer % 30 === 0) {
            this.animationFrame = (this.animationFrame + 1) % 2;
        }
    }

    /**
     * 敵の描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.fillStyle = this.color;

        // 行によって異なる形状を描画
        switch (this.row) {
            case 0: // 最上段 - タコ型
                this.drawOctopus(ctx);
                break;
            case 1:
            case 2: // 中段 - カニ型
                this.drawCrab(ctx);
                break;
            case 3:
            case 4: // 下段 - イカ型
                this.drawSquid(ctx);
                break;
        }

        // 光のエフェクト
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.restore();

        // デバッグモード：ヒットボックス表示
        if (CONFIG.DEBUG.SHOW_HITBOXES) {
            ctx.strokeStyle = '#ff0000';
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
     * タコ型の敵を描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    drawOctopus(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const w = this.width;
        const h = this.height;

        // 本体
        ctx.fillRect(x - w/2 + 5, y - h/2, w - 10, h/2);
        
        // 目
        ctx.fillRect(x - w/4, y - h/4, 4, 4);
        ctx.fillRect(x + w/4 - 4, y - h/4, 4, 4);
        
        // 触手（アニメーション）
        if (this.animationFrame === 0) {
            ctx.fillRect(x - w/2, y + h/4, 4, h/4);
            ctx.fillRect(x - w/4, y + h/4, 4, h/4);
            ctx.fillRect(x + w/4 - 4, y + h/4, 4, h/4);
            ctx.fillRect(x + w/2 - 4, y + h/4, 4, h/4);
        } else {
            ctx.fillRect(x - w/2 + 2, y + h/4, 4, h/4);
            ctx.fillRect(x - w/4 + 2, y + h/4, 4, h/4);
            ctx.fillRect(x + w/4 - 2, y + h/4, 4, h/4);
            ctx.fillRect(x + w/2 - 6, y + h/4, 4, h/4);
        }
    }

    /**
     * カニ型の敵を描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    drawCrab(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const w = this.width;
        const h = this.height;

        // 本体
        ctx.fillRect(x - w/2 + 4, y - h/2 + 4, w - 8, h - 8);
        
        // ハサミ（アニメーション）
        if (this.animationFrame === 0) {
            ctx.fillRect(x - w/2, y - h/4, 4, h/2);
            ctx.fillRect(x + w/2 - 4, y - h/4, 4, h/2);
            ctx.fillRect(x - w/2 - 4, y - h/4, 4, 4);
            ctx.fillRect(x + w/2, y - h/4, 4, 4);
        } else {
            ctx.fillRect(x - w/2, y, 4, h/2);
            ctx.fillRect(x + w/2 - 4, y, 4, h/2);
            ctx.fillRect(x - w/2 - 4, y, 4, 4);
            ctx.fillRect(x + w/2, y, 4, 4);
        }
        
        // 目
        ctx.fillRect(x - w/4, y - h/4, 3, 3);
        ctx.fillRect(x + w/4 - 3, y - h/4, 3, 3);
    }

    /**
     * イカ型の敵を描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    drawSquid(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const w = this.width;
        const h = this.height;

        // 頭部
        ctx.fillRect(x - w/2 + 6, y - h/2, w - 12, h/2 + 2);
        
        // 目
        ctx.fillRect(x - w/4, y - h/4, 3, 3);
        ctx.fillRect(x + w/4 - 3, y - h/4, 3, 3);
        
        // 足（アニメーション）
        if (this.animationFrame === 0) {
            ctx.fillRect(x - w/3, y + h/4, 3, h/4);
            ctx.fillRect(x, y + h/4, 3, h/4);
            ctx.fillRect(x + w/3 - 3, y + h/4, 3, h/4);
        } else {
            ctx.fillRect(x - w/3 + 2, y + h/4, 3, h/4);
            ctx.fillRect(x, y + h/4, 3, h/4);
            ctx.fillRect(x + w/3 - 5, y + h/4, 3, h/4);
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
     * 敵を非アクティブ化
     */
    destroy() {
        this.active = false;
    }

    /**
     * 敵がアクティブかどうか
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * ポイントを取得
     * @returns {number}
     */
    getPoints() {
        return this.points;
    }
}

// ===== 敵編隊マネージャー =====

class EnemyFormation {
    /**
     * 敵編隊のコンストラクタ
     * @param {number} level - 現在のレベル
     * @param {Object} difficulty - 難易度設定
     */
    constructor(level, difficulty) {
        this.enemies = [];
        this.level = level;
        this.difficulty = difficulty;
        
        // 移動関連
        this.direction = 1; // 1: 右, -1: 左
        this.baseSpeed = difficulty.ENEMY_SPEED;
        this.speed = this.baseSpeed + (level - 1) * CONFIG.LEVEL.SPEED_INCREASE_PER_LEVEL;
        this.moveTimer = 0;
        this.moveInterval = 60; // フレーム数
        
        // 射撃関連
        this.shootChance = CONFIG.ENEMY.SHOOT_CHANCE * difficulty.ENEMY_SHOOT_MULTIPLIER;
        this.shootChance += (level - 1) * CONFIG.LEVEL.SHOOT_CHANCE_INCREASE;
        
        // 編隊の境界
        this.leftBound = 0;
        this.rightBound = CONFIG.CANVAS.WIDTH;
        
        this.createFormation();
    }

    /**
     * 敵編隊を作成
     */
    createFormation() {
        this.enemies = [];
        
        const startX = CONFIG.CANVAS.WIDTH / 2 - 
            (CONFIG.ENEMY.COLS * CONFIG.ENEMY.SPACING_X) / 2;
        const startY = CONFIG.ENEMY.START_Y;

        for (let row = 0; row < CONFIG.ENEMY.ROWS; row++) {
            for (let col = 0; col < CONFIG.ENEMY.COLS; col++) {
                const x = startX + col * CONFIG.ENEMY.SPACING_X;
                const y = startY + row * CONFIG.ENEMY.SPACING_Y;
                this.enemies.push(new Enemy(x, y, row, col));
            }
        }
    }

    /**
     * 編隊の更新
     * @returns {boolean} 下端に到達したかどうか
     */
    update() {
        this.moveTimer++;

        // 移動処理
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.move();
        }

        // 各敵の更新
        this.enemies.forEach(enemy => enemy.update());

        // 下端チェック
        return this.checkBottomReached();
    }

    /**
     * 編隊を移動
     */
    move() {
        let shouldMoveDown = false;

        // 端に到達したかチェック
        const activeEnemies = this.enemies.filter(e => e.isActive());
        if (activeEnemies.length === 0) return;

        const leftmost = Math.min(...activeEnemies.map(e => e.x - e.width / 2));
        const rightmost = Math.max(...activeEnemies.map(e => e.x + e.width / 2));

        if (this.direction === 1 && rightmost >= this.rightBound - 10) {
            this.direction = -1;
            shouldMoveDown = true;
        } else if (this.direction === -1 && leftmost <= this.leftBound + 10) {
            this.direction = 1;
            shouldMoveDown = true;
        }

        // 移動実行
        this.enemies.forEach(enemy => {
            if (enemy.isActive()) {
                if (shouldMoveDown) {
                    enemy.y += CONFIG.ENEMY.MOVE_DOWN_AMOUNT;
                } else {
                    enemy.x += this.speed * this.direction;
                }
            }
        });

        // 速度を徐々に上げる（敵が減るほど速くなる）
        const remainingCount = activeEnemies.length;
        const totalCount = CONFIG.ENEMY.ROWS * CONFIG.ENEMY.COLS;
        const speedMultiplier = 1 + (1 - remainingCount / totalCount) * 0.5;
        this.moveInterval = Math.max(20, 60 / speedMultiplier);
    }

    /**
     * 下端に到達したかチェック
     * @returns {boolean}
     */
    checkBottomReached() {
        return this.enemies.some(enemy => 
            enemy.isActive() && enemy.y + enemy.height / 2 >= CONFIG.CANVAS.HEIGHT - 50
        );
    }

    /**
     * ランダムに射撃
     * @returns {Array<Bullet>} 生成された弾丸の配列
     */
    shoot() {
        const bullets = [];
        const activeEnemies = this.enemies.filter(e => e.isActive());

        // 各列の最下段の敵のみが射撃可能
        const shooters = this.getBottomEnemies();

        shooters.forEach(enemy => {
            if (Math.random() < this.shootChance) {
                bullets.push(new Bullet(
                    enemy.x,
                    enemy.y + enemy.height / 2,
                    false
                ));
            }
        });

        return bullets;
    }

    /**
     * 各列の最下段の敵を取得
     * @returns {Array<Enemy>}
     */
    getBottomEnemies() {
        const bottomEnemies = new Map();

        this.enemies.forEach(enemy => {
            if (!enemy.isActive()) return;

            const col = enemy.col;
            if (!bottomEnemies.has(col) || enemy.y > bottomEnemies.get(col).y) {
                bottomEnemies.set(col, enemy);
            }
        });

        return Array.from(bottomEnemies.values());
    }

    /**
     * 編隊の描画
     * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
     */
    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }

    /**
     * 敵を破壊
     * @param {Enemy} enemy - 破壊する敵
     */
    destroyEnemy(enemy) {
        enemy.destroy();
    }

    /**
     * アクティブな敵を取得
     * @returns {Array<Enemy>}
     */
    getActiveEnemies() {
        return this.enemies.filter(e => e.isActive());
    }

    /**
     * すべての敵が破壊されたかチェック
     * @returns {boolean}
     */
    allDestroyed() {
        return this.enemies.every(e => !e.isActive());
    }

    /**
     * 残りの敵の数を取得
     * @returns {number}
     */
    getRemainingCount() {
        return this.enemies.filter(e => e.isActive()).length;
    }

    /**
     * 編隊をリセット
     * @param {number} level - 新しいレベル
     */
    reset(level) {
        this.level = level;
        this.speed = this.baseSpeed + (level - 1) * CONFIG.LEVEL.SPEED_INCREASE_PER_LEVEL;
        this.shootChance = CONFIG.ENEMY.SHOOT_CHANCE * this.difficulty.ENEMY_SHOOT_MULTIPLIER;
        this.shootChance += (level - 1) * CONFIG.LEVEL.SHOOT_CHANCE_INCREASE;
        this.direction = 1;
        this.moveTimer = 0;
        this.createFormation();
    }
}