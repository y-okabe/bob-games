// ===== ユーティリティ関数 =====

const Utils = {
    /**
     * 矩形同士の衝突判定
     * @param {Object} rect1 - {x, y, width, height}
     * @param {Object} rect2 - {x, y, width, height}
     * @returns {boolean}
     */
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    /**
     * 円同士の衝突判定
     * @param {Object} circle1 - {x, y, radius}
     * @param {Object} circle2 - {x, y, radius}
     * @returns {boolean}
     */
    checkCircleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    },

    /**
     * 値を範囲内に制限
     * @param {number} value - 値
     * @param {number} min - 最小値
     * @param {number} max - 最大値
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * ランダムな整数を生成
     * @param {number} min - 最小値（含む）
     * @param {number} max - 最大値（含む）
     * @returns {number}
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * ランダムな浮動小数点数を生成
     * @param {number} min - 最小値
     * @param {number} max - 最大値
     * @returns {number}
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * 配列からランダムな要素を選択
     * @param {Array} array - 配列
     * @returns {*}
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * 度をラジアンに変換
     * @param {number} degrees - 度
     * @returns {number}
     */
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * ラジアンを度に変換
     * @param {number} radians - ラジアン
     * @returns {number}
     */
    radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * 2点間の距離を計算
     * @param {number} x1 - 点1のx座標
     * @param {number} y1 - 点1のy座標
     * @param {number} x2 - 点2のx座標
     * @param {number} y2 - 点2のy座標
     * @returns {number}
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 線形補間
     * @param {number} start - 開始値
     * @param {number} end - 終了値
     * @param {number} t - 補間係数（0-1）
     * @returns {number}
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * LocalStorageに保存
     * @param {string} key - キー
     * @param {*} value - 値
     */
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('LocalStorage保存エラー:', e);
        }
    },

    /**
     * LocalStorageから読み込み
     * @param {string} key - キー
     * @param {*} defaultValue - デフォルト値
     * @returns {*}
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('LocalStorage読み込みエラー:', e);
            return defaultValue;
        }
    },

    /**
     * 数値をカンマ区切りでフォーマット
     * @param {number} num - 数値
     * @returns {string}
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * 時間をフォーマット（秒）
     * @param {number} seconds - 秒
     * @returns {string}
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * CSS変数から色を取得
     * @param {string} varName - CSS変数名（--で始まる）
     * @returns {string}
     */
    getCSSVariable(varName) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName).trim();
    },

    /**
     * 要素を表示
     * @param {HTMLElement} element - 要素
     */
    show(element) {
        if (element) {
            element.classList.add('active');
        }
    },

    /**
     * 要素を非表示
     * @param {HTMLElement} element - 要素
     */
    hide(element) {
        if (element) {
            element.classList.remove('active');
        }
    },

    /**
     * 要素の表示/非表示を切り替え
     * @param {HTMLElement} element - 要素
     */
    toggle(element) {
        if (element) {
            element.classList.toggle('active');
        }
    },

    /**
     * デバウンス関数
     * @param {Function} func - 実行する関数
     * @param {number} wait - 待機時間（ミリ秒）
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * スロットル関数
     * @param {Function} func - 実行する関数
     * @param {number} limit - 制限時間（ミリ秒）
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * パーティクル生成用のランダムな速度ベクトル
     * @param {number} speed - 速度
     * @returns {Object} {vx, vy}
     */
    randomVelocity(speed) {
        const angle = Math.random() * Math.PI * 2;
        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
        };
    },

    /**
     * 色を明るくする
     * @param {string} color - 16進数カラーコード
     * @param {number} percent - 明るくする割合（0-100）
     * @returns {string}
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    },

    /**
     * 色を暗くする
     * @param {string} color - 16進数カラーコード
     * @param {number} percent - 暗くする割合（0-100）
     * @returns {string}
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
            (G > 0 ? G : 0) * 0x100 +
            (B > 0 ? B : 0))
            .toString(16).slice(1);
    }
};

// ユーティリティを凍結
Object.freeze(Utils);