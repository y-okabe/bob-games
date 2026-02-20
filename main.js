// ===== メインメニュー JavaScript =====

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    initializeArcade();
});

// ===== 初期化 =====
function initializeArcade() {
    createStarfield();
    setupGameCards();
    setupKeyboardNavigation();
    loadGameStats();
    setupSoundEffects();
}

// ===== 星空エフェクトの生成 =====
function createStarfield() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3}px;
            height: ${Math.random() * 3}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random()};
            animation: twinkle ${2 + Math.random() * 3}s infinite;
            animation-delay: ${Math.random() * 3}s;
        `;
        starsContainer.appendChild(star);
    }
}

// ===== ゲームカードのセットアップ =====
function setupGameCards() {
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    
    gameCards.forEach((card, index) => {
        // ホバーエフェクト
        card.addEventListener('mouseenter', () => {
            playHoverSound();
            card.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.zIndex = '1';
        });
        
        // プレイボタンのクリックエフェクト
        const playButton = card.querySelector('.play-button');
        if (playButton && !playButton.disabled) {
            playButton.addEventListener('click', (e) => {
                playClickSound();
                createRippleEffect(e, playButton);
            });
        }
    });
    
    // Coming Soonカードの処理
    const comingSoonCard = document.querySelector('.game-card.coming-soon');
    if (comingSoonCard) {
        const button = comingSoonCard.querySelector('.play-button');
        button.addEventListener('click', () => {
            showComingSoonMessage();
        });
    }
}

// ===== キーボードナビゲーション =====
function setupKeyboardNavigation() {
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    let currentIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            
            // 現在のフォーカスを解除
            gameCards[currentIndex].style.outline = 'none';
            
            // インデックスを更新
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + gameCards.length) % gameCards.length;
            } else {
                currentIndex = (currentIndex + 1) % gameCards.length;
            }
            
            // 新しいカードにフォーカス
            const newCard = gameCards[currentIndex];
            newCard.style.outline = '3px solid var(--primary-color)';
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            playHoverSound();
        }
        
        // Enterキーでゲームを起動
        if (e.key === 'Enter') {
            const playButton = gameCards[currentIndex].querySelector('.play-button');
            if (playButton && !playButton.disabled) {
                playButton.click();
            }
        }
    });
}

// ===== ゲーム統計の読み込み =====
function loadGameStats() {
    // Space Invadersのハイスコアを読み込み
    const invaderHighScore = localStorage.getItem('invader_high_score') || '0';
    const invaderCard = document.querySelector('[data-game="invader"]');
    if (invaderCard) {
        addHighScoreBadge(invaderCard, invaderHighScore);
    }
    
    // Tetrisのハイスコアを読み込み
    const tetrisHighScore = localStorage.getItem('tetrisHighScore') || '0';
    const tetrisCard = document.querySelector('[data-game="tetris"]');
    if (tetrisCard) {
        addHighScoreBadge(tetrisCard, tetrisHighScore);
    }
}

// ===== ハイスコアバッジの追加 =====
function addHighScoreBadge(card, score) {
    if (parseInt(score) > 0) {
        const badge = document.createElement('div');
        badge.className = 'high-score-badge';
        badge.innerHTML = `🏆 ハイスコア: ${parseInt(score).toLocaleString()}`;
        badge.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid gold;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            color: gold;
            text-shadow: 0 0 10px gold;
            animation: pulse 2s infinite;
        `;
        card.style.position = 'relative';
        card.appendChild(badge);
    }
}

// ===== リップルエフェクト =====
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ===== Coming Soonメッセージ =====
function showComingSoonMessage() {
    const messages = [
        '🚀 新しいゲームを開発中です！',
        '🎮 もうすぐ公開予定！',
        '⭐ お楽しみに！',
        '🎯 次回作をお待ちください！'
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 255, 65, 0.9);
        color: #0a0e27;
        padding: 2rem 3rem;
        border-radius: 15px;
        font-size: 1.5rem;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.8);
        animation: popIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'popOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ===== サウンドエフェクト =====
let audioContext;
let soundEnabled = true;

function setupSoundEffects() {
    // Web Audio APIの初期化（ユーザーインタラクション後）
    document.addEventListener('click', initAudio, { once: true });
}

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playHoverSound() {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playClickSound() {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1200;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// ===== アニメーションスタイルの追加 =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes popIn {
        from {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes popOut {
        from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.8;
        }
    }
`;
document.head.appendChild(style);

// ===== パフォーマンス最適化 =====
// Intersection Observerでカードのアニメーションを最適化
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// すべてのゲームカードを監視
document.querySelectorAll('.game-card').forEach(card => {
    observer.observe(card);
});

// ===== デバッグ情報（開発用） =====
console.log('🎮 Retro Game Arcade initialized!');
console.log('📊 Available games:', document.querySelectorAll('.game-card:not(.coming-soon)').length);
console.log('⌨️ Keyboard navigation: Arrow keys to navigate, Enter to select');