// ===== オーディオマネージャー =====

class AudioManager {
    constructor() {
        this.enabled = Utils.loadFromStorage(
            CONFIG.STORAGE_KEYS.SOUND_ENABLED,
            CONFIG.SOUND.ENABLED
        );
        this.masterVolume = CONFIG.SOUND.VOLUME.MASTER;
        this.sfxVolume = CONFIG.SOUND.VOLUME.SFX;
        this.musicVolume = CONFIG.SOUND.VOLUME.MUSIC;
        
        // Web Audio API コンテキスト
        this.audioContext = null;
        this.initAudioContext();
        
        // サウンドバッファ
        this.sounds = {};
    }

    /**
     * Audio Contextの初期化
     */
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    /**
     * サウンドの有効/無効を切り替え
     */
    toggle() {
        this.enabled = !this.enabled;
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.SOUND_ENABLED, this.enabled);
        
        if (!this.enabled && this.audioContext) {
            this.audioContext.suspend();
        } else if (this.enabled && this.audioContext) {
            this.audioContext.resume();
        }
    }

    /**
     * サウンドが有効かどうか
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * 射撃音を再生
     */
    playShoot() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            200,
            this.audioContext.currentTime + 0.1
        );
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.3,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.1
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * 敵の射撃音を再生
     */
    playEnemyShoot() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            100,
            this.audioContext.currentTime + 0.15
        );
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.2,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.15
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    /**
     * 爆発音を再生
     * @param {string} type - 爆発タイプ ('player', 'enemy', 'powerup')
     */
    playExplosion(type = 'enemy') {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        filter.type = 'lowpass';
        
        let duration, startFreq, endFreq, volume;
        
        switch (type) {
            case 'player':
                duration = 0.5;
                startFreq = 200;
                endFreq = 20;
                volume = 0.5;
                break;
            case 'powerup':
                duration = 0.3;
                startFreq = 800;
                endFreq = 400;
                volume = 0.3;
                break;
            case 'enemy':
            default:
                duration = 0.2;
                startFreq = 150;
                endFreq = 30;
                volume = 0.4;
                break;
        }
        
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            endFreq,
            this.audioContext.currentTime + duration
        );
        
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(
            100,
            this.audioContext.currentTime + duration
        );
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * volume,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + duration
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    /**
     * パワーアップ取得音を再生
     */
    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // アルペジオ効果
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        let time = this.audioContext.currentTime;
        
        notes.forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, time + i * 0.1);
        });
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.3,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.4
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    /**
     * レベルクリア音を再生
     */
    playLevelClear() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        
        // 上昇音階
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        let time = this.audioContext.currentTime;
        
        notes.forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, time + i * 0.08);
        });
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.4,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.7
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.7);
    }

    /**
     * ゲームオーバー音を再生
     */
    playGameOver() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        
        // 下降音階
        const notes = [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63];
        let time = this.audioContext.currentTime;
        
        notes.forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, time + i * 0.15);
        });
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.5,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 1.2
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1.2);
    }

    /**
     * ゲームクリア音を再生
     */
    playGameClear() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // 勝利のファンファーレ風
        const melody = [
            { freq: 523.25, duration: 0.2 },  // C5
            { freq: 523.25, duration: 0.2 },  // C5
            { freq: 523.25, duration: 0.2 },  // C5
            { freq: 659.25, duration: 0.4 },  // E5
            { freq: 783.99, duration: 0.4 },  // G5
            { freq: 1046.50, duration: 0.6 }  // C6
        ];
        
        let time = this.audioContext.currentTime;
        
        melody.forEach((note, i) => {
            oscillator.frequency.setValueAtTime(note.freq, time);
            time += note.duration;
        });
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.5,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 2
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
    }

    /**
     * ヒット音を再生
     */
    playHit() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(
            this.masterVolume * this.sfxVolume * 0.3,
            this.audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.05
        );
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    /**
     * ボリュームを設定
     * @param {string} type - 'master', 'sfx', 'music'
     * @param {number} volume - 0.0 - 1.0
     */
    setVolume(type, volume) {
        volume = Utils.clamp(volume, 0, 1);
        
        switch (type) {
            case 'master':
                this.masterVolume = volume;
                break;
            case 'sfx':
                this.sfxVolume = volume;
                break;
            case 'music':
                this.musicVolume = volume;
                break;
        }
    }

    /**
     * すべてのサウンドを停止
     */
    stopAll() {
        if (this.audioContext) {
            this.audioContext.suspend();
            setTimeout(() => {
                if (this.enabled) {
                    this.audioContext.resume();
                }
            }, 100);
        }
    }
}