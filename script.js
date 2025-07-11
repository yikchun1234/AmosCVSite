document.addEventListener('DOMContentLoaded', () => {

    // --- 语言切换逻辑 ---
    const langEnBtn = document.getElementById('lang-en-btn');
    const langZhBtn = document.getElementById('lang-zh-btn');
    const langEnElements = document.querySelectorAll('.lang-en');
    const langZhElements = document.querySelectorAll('.lang-zh');
    const htmlEl = document.documentElement;

    const setLanguage = (lang) => {
        const isEn = lang === 'en';
        langEnElements.forEach(el => el.classList.toggle('hidden', !isEn));
        langZhElements.forEach(el => el.classList.toggle('hidden', isEn));
        langEnBtn.classList.toggle('active', isEn);
        langZhBtn.classList.toggle('active', !isEn);
        htmlEl.setAttribute('lang', isEn ? 'en' : 'zh-CN');
        localStorage.setItem('language', lang);
    };

    langEnBtn.addEventListener('click', () => setLanguage('en'));
    langZhBtn.addEventListener('click', () => setLanguage('zh'));

    // --- 汉堡菜单逻辑 ---
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // --- 滚动动画触发 (全新稳定版) ---
    const animatedSections = document.querySelectorAll('.animated-section');
    const allAnimatedText = document.querySelectorAll('.matrix-text');

    // 核心修复：页面加载时，先为所有动画文本添加预隐藏类
    allAnimatedText.forEach(el => {
        el.classList.add('pre-animate');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const section = entry.target;
            const textElements = section.querySelectorAll('.matrix-text');

            if (entry.isIntersecting) {
                textElements.forEach((textEl, index) => {
                    // 移除预隐藏类，让元素可以开始动画
                    textEl.classList.remove('pre-animate');

                    // 根据屏幕宽度决定应用哪种动画
                    if (window.innerWidth > 1024) {
                        // 桌面端：应用打字效果
                        textEl.classList.add('typing-effect');
                        // 为多行文本应用淡入效果
                        if (textEl.classList.contains('bio') || textEl.closest('.achievements') || textEl.closest('.company-info')) {
                             textEl.classList.remove('typing-effect');
                             textEl.classList.add('fade-in-effect');
                        }
                    } else {
                        // 移动端：应用淡入效果
                        textEl.classList.add('fade-in-effect');
                    }
                    // 为每个元素设置一个微小的延迟，产生层次感
                    textEl.style.animationDelay = `${0.3 + index * 0.1}s`;
                });
            } else {
                // 当区段离开视野，重新添加预隐藏类，为下次进入做准备
                textElements.forEach(textEl => {
                    textEl.classList.add('pre-animate');
                    textEl.classList.remove('typing-effect', 'fade-in-effect');
                });
            }
        });
    }, { threshold: 0.2 }); // 核心修复：将阈值从0.4降低到0.2，确保在窄屏上能触发

    animatedSections.forEach(section => {
        observer.observe(section);
    });

    // --- 导航栏与滚动处理 ---
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > navbar.offsetHeight) {
            navbar.style.top = '-100px';
        } else {
            navbar.style.top = '0';
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // --- “觉得无聊？”按钮逻辑 ---
    const boredBtn = document.getElementById('bored-btn');
    const gameSection = document.getElementById('game');
    boredBtn.addEventListener('click', () => {
        gameSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- 拼图游戏逻辑 ---
    const canvas = document.getElementById('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const difficultySelect = document.getElementById('difficulty');
    const startGameBtn = document.getElementById('start-game-btn');
    const winMessage = document.getElementById('win-message');
    const puzzleContainer = document.getElementById('puzzle-container');

    let image = new Image();
    let pieces = [];
    let puzzleSize = 3;
    let pieceWidth, pieceHeight;
    let selectedPiece1 = null;
    let isGameActive = false;
    image.crossOrigin = "Anonymous";

    const setupCanvas = () => {
        const size = Math.min(puzzleContainer.clientWidth, puzzleContainer.clientHeight);
        canvas.width = size;
        canvas.height = size;
        if (isGameActive) drawPuzzle();
    };

    const sliceAndShuffle = () => {
        pieces = [];
        pieceWidth = canvas.width / puzzleSize;
        pieceHeight = canvas.height / puzzleSize;
        let tempPieces = [];
        for (let y = 0; y < puzzleSize; y++) {
            for (let x = 0; x < puzzleSize; x++) {
                tempPieces.push({
                    sx: x * image.width / puzzleSize,
                    sy: y * image.height / puzzleSize,
                    id: y * puzzleSize + x
                });
            }
        }
        let shuffled = [...tempPieces];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        for(let i = 0; i < tempPieces.length; i++){
            pieces.push({ ...shuffled[i], currentPosId: i, correctPosId: shuffled[i].id });
        }
    };

    const drawPuzzle = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(piece => {
            const pos_x = (piece.currentPosId % puzzleSize) * pieceWidth;
            const pos_y = Math.floor(piece.currentPosId / puzzleSize) * pieceHeight;
            ctx.drawImage(image, piece.sx, piece.sy, image.width / puzzleSize, image.height / puzzleSize, pos_x, pos_y, pieceWidth, pieceHeight);
            ctx.strokeStyle = '#0a0a14';
            ctx.lineWidth = 2;
            ctx.strokeRect(pos_x, pos_y, pieceWidth, pieceHeight);
        });
        if (selectedPiece1) {
            const pos_x = (selectedPiece1.currentPosId % puzzleSize) * pieceWidth;
            const pos_y = Math.floor(selectedPiece1.currentPosId / puzzleSize) * pieceHeight;
            ctx.strokeStyle = '#4a90e2';
            ctx.lineWidth = 4;
            ctx.strokeRect(pos_x, pos_y, pieceWidth, pieceHeight);
        }
    };

    const checkWin = () => {
        if (pieces.every(p => p.currentPosId === p.correctPosId)) {
            winMessage.textContent = document.documentElement.lang === 'zh-CN' ? '恭喜你，挑战成功！' : 'Congratulations, You Win!';
            isGameActive = false;
        }
    };

    canvas.addEventListener('click', (e) => {
        if (!isGameActive) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const col = Math.floor(mouseX / pieceWidth);
        const row = Math.floor(mouseY / pieceHeight);
        const clickedPosId = row * puzzleSize + col;
        const clickedPiece = pieces.find(p => p.currentPosId === clickedPosId);

        if (!selectedPiece1) {
            selectedPiece1 = clickedPiece;
        } else {
            const tempPosId = selectedPiece1.currentPosId;
            selectedPiece1.currentPosId = clickedPiece.currentPosId;
            clickedPiece.currentPosId = tempPosId;
            selectedPiece1 = null;
            drawPuzzle();
            checkWin();
        }
        drawPuzzle();
    });

    startGameBtn.addEventListener('click', () => {
        puzzleSize = parseInt(difficultySelect.value);
        winMessage.textContent = '';
        isGameActive = true;
        selectedPiece1 = null;
        const randomId = Math.floor(Math.random() * 500);
        image.src = `https://picsum.photos/id/${randomId}/500/500`;
        image.onload = () => { setupCanvas(); sliceAndShuffle(); drawPuzzle(); };
        image.onerror = () => { image.src = 'https://placehold.co/500x500/cccccc/666666?text=Image+Error'; };
    });

    // --- 页面加载时初始化 ---
    const savedLang = localStorage.getItem('language') || 'zh';
    setLanguage(savedLang);
    window.addEventListener('resize', setupCanvas);

});
