// ===== ゲーム設定ファイル =====

const CONFIG = {
    // キャンバス設定
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600,
        BACKGROUND: '#000000'
    },

    // プレイヤー設定
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 30,
        SPEED: 5,
        SHOOT_COOLDOWN: 300, // ミリ秒
        START_LIVES: 3,
        MAX_LIVES: 5,
        INVINCIBLE_TIME: 2000, // 被弾後の無敵時間（ミリ秒）
        RESPAWN_Y_OFFSET: 50
    },

    // 敵設定
    ENEMY: {
        WIDTH: 30,
        HEIGHT: 25,
        ROWS: 5,
        COLS: 11,
        SPACING_X: 50,
        SPACING_Y: 40,
        START_Y: 80,
        MOVE_DOWN_AMOUNT: 20,
        SHOOT_CHANCE: 0.001, // フレームごとの射撃確率
        POINTS: {
            ROW_1: 30,  // 最上段
            ROW_2: 20,
            ROW_3: 20,
            ROW_4: 10,
            ROW_5: 10   // 最下段
        }
    },

    // 弾丸設定
    BULLET: {
        WIDTH: 4,
        HEIGHT: 15,
        PLAYER_SPEED: 8,
        ENEMY_SPEED: 5
    },

    // パワーアップ設定
    POWERUP: {
        WIDTH: 30,
        HEIGHT: 30,
        SPEED: 2,
        SPAWN_CHANCE: 0.15, // 敵撃破時の出現確率
        DURATION: {
            RAPID_FIRE: 10000,      // 10秒
            SHIELD: 8000,           // 8秒
            SCORE_BOOST: 15000,     // 15秒
            WIDE_SHOT: 12000        // 12秒
        },
        EFFECTS: {
            RAPID_FIRE: {
                COOLDOWN_MULTIPLIER: 0.3  // 射撃間隔を30%に短縮
            },
            SCORE_BOOST: {
                MULTIPLIER: 2  // スコア2倍
            },
            WIDE_SHOT: {
                BULLET_COUNT: 3,  // 3方向
                ANGLE_SPREAD: 15  // 角度（度）
            }
        }
    },

    // レベル設定
    LEVEL: {
        MAX_LEVEL: 10,
        SPEED_INCREASE_PER_LEVEL: 0.3,
        SHOOT_CHANCE_INCREASE: 0.0002,
        CLEAR_BONUS: 1000
    },

    // 難易度設定
    DIFFICULTY: {
        EASY: {
            ENEMY_SPEED: 1,
            ENEMY_SHOOT_MULTIPLIER: 0.5,
            PLAYER_LIVES: 5
        },
        NORMAL: {
            ENEMY_SPEED: 1.5,
            ENEMY_SHOOT_MULTIPLIER: 1,
            PLAYER_LIVES: 3
        },
        HARD: {
            ENEMY_SPEED: 2.5,
            ENEMY_SHOOT_MULTIPLIER: 1.5,
            PLAYER_LIVES: 3
        }
    },

    // ゲーム状態
    GAME_STATE: {
        START: 'start',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver',
        LEVEL_CLEAR: 'levelClear',
        GAME_CLEAR: 'gameClear'
    },

    // キー設定
    KEYS: {
        LEFT: ['ArrowLeft', 'a', 'A'],
        RIGHT: ['ArrowRight', 'd', 'D'],
        SHOOT: [' ', 'Enter'],
        PAUSE: ['Escape', 'p', 'P']
    },

    // サウンド設定
    SOUND: {
        ENABLED: true,
        VOLUME: {
            MASTER: 0.5,
            SFX: 0.7,
            MUSIC: 0.3
        }
    },

    // UI設定
    UI: {
        LEVEL_CLEAR_DISPLAY_TIME: 2000, // レベルクリア表示時間（ミリ秒）
        NOTIFICATION_FADE_TIME: 500
    },

    // ローカルストレージキー
    STORAGE_KEYS: {
        HIGH_SCORE: 'invader_high_score',
        DIFFICULTY: 'invader_difficulty',
        THEME: 'invader_theme',
        SOUND_ENABLED: 'invader_sound_enabled'
    },

    // テーマ
    THEMES: {
        RETRO: 'retro',
        MODERN: 'modern',
        NEON: 'neon'
    },

    // 色設定（テーマごとに上書き可能）
    COLORS: {
        PLAYER: '#00ff00',
        ENEMY: '#ff0000',
        PLAYER_BULLET: '#ffff00',
        ENEMY_BULLET: '#ff0000',
        POWERUP: {
            RAPID_FIRE: '#ff6600',
            SHIELD: '#00ccff',
            SCORE_BOOST: '#ffff00',
            WIDE_SHOT: '#ff00ff'
        },
        SHIELD_EFFECT: 'rgba(0, 204, 255, 0.3)',
        EXPLOSION: ['#ff0000', '#ff6600', '#ffff00', '#ffffff']
    },

    // パーティクル設定
    PARTICLE: {
        EXPLOSION_COUNT: 15,
        EXPLOSION_SPEED: 3,
        EXPLOSION_LIFE: 30,
        EXPLOSION_SIZE: 3
    },

    // デバッグ設定
    DEBUG: {
        SHOW_FPS: false,
        SHOW_HITBOXES: false,
        GOD_MODE: false
    }
};

// 設定を凍結して変更を防ぐ
Object.freeze(CONFIG);