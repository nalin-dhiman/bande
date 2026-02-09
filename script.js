document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
       BIRTHDAY COUNTDOWN TIMER LOCK
       ======================================== */
    const TARGET_DATE = new Date('2026-02-10T00:00:00+05:30'); // Feb 10, 2026 12:00 AM IST
    const lockScreen = document.getElementById('countdown-lock');

    function updateCountdown() {
        const now = new Date();
        const difference = TARGET_DATE - now;

        if (difference <= 0) {
            // Unlock the site
            unlockSite();
            return;
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update display with flip animation
        updateDigit('days', days);
        updateDigit('hours', hours);
        updateDigit('minutes', minutes);
        updateDigit('seconds', seconds);
    }

    function updateDigit(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        const newValue = String(value).padStart(2, '0');
        if (el.textContent !== newValue) {
            el.classList.add('flip');
            setTimeout(() => {
                el.textContent = newValue;
                el.classList.remove('flip');
            }, 300);
        }
    }

    function unlockSite() {
        if (!lockScreen) return;
        lockScreen.classList.add('unlock-animation');
        setTimeout(() => {
            lockScreen.style.display = 'none';
            // Initialize the game after unlock
            initBubbles();
            goToLevel(0);
        }, 2000);
        clearInterval(countdownInterval);
    }

    // Create floating hearts
    function createHeart() {
        const heartsContainer = document.getElementById('hearts-container');
        if (!heartsContainer) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = ['💕', '💖', '🌸', '🌺', '💝'][Math.floor(Math.random() * 5)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (5 + Math.random() * 3) + 's';
        heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';

        heartsContainer.appendChild(heart);

        // Remove after animation
        setTimeout(() => heart.remove(), 8000);
    }

    // Initialize countdown
    if (lockScreen) {
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);

        // Create hearts periodically
        setInterval(createHeart, 800);
    }

    /* ========================================
       END COUNTDOWN TIMER LOGIC
       ======================================== */

    /* --- GAME STATE --- */
    const state = {
        level: 0, // Start at Gate
        xp: 0,
        audio: false,
        carouselAngle: 0,
        inputCode: "",
        weather: 'sunbeams' // sunbeams, leaves, rain, stardust
    };
    const totalXP = 20;

    // References
    const xpFill = document.getElementById('xp-fill');
    const audioEl = document.getElementById('bgm');
    const levels = {
        0: document.getElementById('level-0-gate'),
        1: document.getElementById('level-1-seed'),
        2: document.getElementById('level-2-hunt'),
        3: document.getElementById('level-3-river'),
        4: document.getElementById('level-4-mirror'),
        5: document.getElementById('finale')
    };

    /* --- LEVEL 0: BUBBLE SYMPHONY --- */
    const SECRET_CODE = "1957";
    const bubbles = [];
    const container = document.getElementById('bubble-container');

    function initBubbles() {
        const nums = ['1', '9', '5', '7', '2', '3', '4', '6', '8', '0', '', '', '', '', ''];
        nums.sort(() => Math.random() - 0.5);

        nums.forEach(n => {
            const el = document.createElement('div');
            el.className = 'bubble';
            el.textContent = n;
            const size = Math.random() * 40 + 60; // 60-100px
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;

            // Random Pos
            const x = Math.random() * (window.innerWidth - size);
            const y = Math.random() * (window.innerHeight - size);

            // Physics State
            const bubble = {
                el: el,
                x: x, y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: size,
                val: n
            };
            bubbles.push(bubble);

            // Interaction
            el.addEventListener('mousedown', (e) => handleBubblePop(e, bubble));
            el.addEventListener('touchstart', (e) => { e.preventDefault(); handleBubblePop(e, bubble); });

            container.appendChild(el);
        });

        requestAnimationFrame(animateBubbles);
    }

    function animateBubbles() {
        if (state.level !== 0) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        bubbles.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;

            // Bounce
            if (b.x < 0 || b.x > w - b.size) b.vx *= -1;
            if (b.y < 0 || b.y > h - b.size) b.vy *= -1;

            b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
        });

        requestAnimationFrame(animateBubbles);
    }

    function handleBubblePop(e, b) {
        if (state.inputCode.length >= 4) return;

        const targetNum = SECRET_CODE[state.inputCode.length];

        if (b.val === targetNum) {
            // Correct
            state.inputCode += b.val;
            createBurst(b.x, b.y);
            b.el.style.transform = `scale(1.5)`;
            b.el.style.opacity = 0;
            setTimeout(() => b.el.remove(), 200);
            updateIndicators();

            if (state.inputCode.length === 4) {
                setTimeout(unlockGate, 500);
            }
        } else {
            // Wrong
            b.el.classList.add('shake');
            document.getElementById('gate-msg').textContent = "Oops! Look for " + targetNum;
            setTimeout(() => {
                b.el.classList.remove('shake');
                document.getElementById('gate-msg').textContent = "";
            }, 600);
        }
    }

    function updateIndicators() {
        const indicators = document.querySelectorAll('.gate-indicators span');
        indicators.forEach((dot, i) => {
            if (i < state.inputCode.length) dot.classList.add('filled');
        });
    }

    function unlockGate() {
        state.level = 1;
        document.getElementById('level-0-gate').classList.add('dissolve');
        document.body.classList.add('state-morning');
        setWeather('sunbeams'); // Sakura mode: sunbeams will be petals
        initMemoryGame();

        // Music Fade In
        if (!state.audio) {
            audioEl.volume = 0;
            audioEl.play().catch(e => console.log("Audio blocked"));
            state.audio = true;
            let vol = 0;
            const fade = setInterval(() => {
                if (vol < 0.8) { vol += 0.1; audioEl.volume = vol; }
                else clearInterval(fade);
            }, 200);
        }

        setTimeout(() => {
            levels[0].classList.add('hidden');
            levels[0].classList.remove('active');
            levels[1].classList.remove('hidden');
            setTimeout(() => levels[1].classList.add('active'), 50);
        }, 1000);
    }

    /* --- LEVEL 1: MEMORY MATCH --- */
    function initMemoryGame() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = ''; // Clear previous game
        // Pick 6 unique images
        const imgs = galleryData.slice(0, 6);
        // Duplicate to 12
        let cards = [...imgs, ...imgs];
        // Shuffle
        cards.sort(() => Math.random() - 0.5);

        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;
        let matchesFound = 0;

        cards.forEach(item => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">🌸</div>
                    <div class="flip-card-back">
                        <img src="${item.src}" draggable="false">
                    </div>
                </div>
            `;

            card.addEventListener('click', function () {
                if (lockBoard) return;
                if (this === firstCard) return;

                this.classList.add('flipped');

                if (!hasFlippedCard) {
                    hasFlippedCard = true;
                    firstCard = this;
                    return;
                }

                secondCard = this;
                checkForMatch();
            });

            grid.appendChild(card);
        });

        function checkForMatch() {
            // Compare source images
            const src1 = firstCard.querySelector('img').src;
            const src2 = secondCard.querySelector('img').src;

            if (src1 === src2) {
                disableCards();
                matchesFound++;
                if (matchesFound === 6) setTimeout(winLevel1, 1000);
            } else {
                unflipCards();
            }
        }

        function disableCards() {
            firstCard.removeEventListener('click', null);
            secondCard.removeEventListener('click', null); // Logic handled by variable checks anyway
            resetBoard();
        }

        function unflipCards() {
            lockBoard = true;
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1000);
        }

        function resetBoard() {
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }
    }

    function winLevel1() {
        // Confetti
        for (let i = 0; i < 50; i++) {
            createBurst(window.innerWidth / 2, window.innerHeight / 2);
        }
        document.querySelector('.garden-title').textContent = "Garden in Bloom 🌸";
        addXP(10);
        setTimeout(() => goToLevel(2), 2000);
    }

    /* --- LEVEL 2: BALLOONS (Restored) --- */
    function initBalloons() {
        if (!galleryData) return console.error("No Gallery Data");
        const grid = document.getElementById('balloon-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear previous
        const batch = galleryData.slice(0, 5);
        let popped = 0;

        batch.forEach(item => {
            const el = document.createElement('div');
            el.className = 'balloon-card';
            el.style.left = `${Math.random() * 80 + 10}%`;
            el.style.animationDelay = `-${Math.random() * 10}s`;
            el.style.animationDuration = `${15 + Math.random() * 5}s`; // Slower float
            el.style.zIndex = "2000";

            // Big Balloon with Hanging Photo
            el.innerHTML = `
                <div class="balloon-bubble"></div>
                <div class="balloon-string"></div>
                <div class="balloon-photo">
                    <img src="${item.src}" draggable="false">
                </div>
            `;

            const popAction = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                createBurst(clientX, clientY);
                openLightbox(item); // Show photo
                el.remove();
                addXP(1);
                popped++;

                if (popped >= 3) {
                    setTimeout(() => goToLevel(3), 1000);
                }
            };

            el.onclick = popAction;
            el.ontouchstart = popAction;
            grid.appendChild(el);
        });
    }

    // Init L0 only if countdown has already passed
    const now = new Date();
    const countdownPassed = (TARGET_DATE - now) <= 0;
    if (!lockScreen || countdownPassed) {
        initBubbles();
    }

    /* --- PHYSICS: MOUSE & WIND --- */
    let mouse = { x: 0, y: 0, vx: 0, vy: 0 };
    document.addEventListener('mousemove', (e) => {
        // Calculate velocity for Wind Gust
        mouse.vx = e.clientX - mouse.x;
        mouse.vy = e.clientY - mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Parallax Tilt (Level 1 & 4)
        const tiltX = (window.innerWidth / 2 - e.clientX) / 40;
        const tiltY = (window.innerHeight / 2 - e.clientY) / 40;
        if (state.level === 1) {
            const el = document.querySelector('.seed-container'); // This will be memory-grid now
            if (el) el.style.transform = `rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
        }
        if (state.level === 4) {
            const el = document.querySelector('.mirror-frame');
            if (el) el.style.transform = `rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
        }
    });

    /* --- LEVEL LOGIC with CHROMA TRANSITIONS --- */
    function goToLevel(n) {
        if (levels[state.level]) levels[state.level].classList.remove('active');

        setTimeout(() => {
            if (levels[state.level]) levels[state.level].classList.add('hidden');
            state.level = n;

            // Chroma Transition (CSS Class on Body)
            document.body.className = ''; // Reset
            if (n === 1) { document.body.classList.add('state-morning'); setWeather('sunbeams'); initMemoryGame(); }
            if (n === 2) { document.body.classList.add('state-afternoon'); setWeather('leaves'); initBalloons(); }
            if (n === 3) { document.body.classList.add('state-rain'); setWeather('rain'); initCarousel(); }
            if (n === 4) { document.body.classList.add('state-twilight'); setWeather('stardust'); initMirror(); }
            if (n === 5) { document.body.classList.add('state-twilight'); setWeather('stardust'); initFinale(); }

            if (levels[n]) {
                levels[n].classList.remove('hidden');
                void levels[n].offsetWidth;
                levels[n].classList.add('active');
            }
        }, 1000);
    }

    function addXP(amount) {
        state.xp = Math.min(state.xp + amount, totalXP);
        xpFill.style.width = `${(state.xp / totalXP) * 100}%`;
    }

    /* --- WEATHER ENGINE (CANVAS) --- */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    function setWeather(type) {
        state.weather = type;
        particles = []; // Clear old weather
        // Pre-populate
        const count = type === 'rain' ? 200 : 50;
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(type));
        }
    }

    function createParticle(type) {
        const w = canvas.width;
        const h = canvas.height;
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1,
            size: Math.random() * 5 + 2,
            type: type,
            angle: Math.random() * 360,
            spin: (Math.random() - 0.5) * 5,
            oscillation: Math.random() * 0.1,
            opacity: Math.random()
        };
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Wind Gust decay
        const windX = mouse.vx * 0.05;

        particles.forEach((p, i) => {
            // Check mouse distance for glow effect
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const glow = dist < 100 ? 1.5 : 1; // 1.5x size if close

            // Logic based on types (Overridden to White/Ethereal for this theme)
            if (p.type === 'sunbeams') {
                p.y -= 0.5;
                p.x += 0.2;
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * glow})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, (p.size * 10) * glow, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (p.type === 'leaves') { // White Orchids
                p.y += p.vy;
                p.x += Math.sin(p.y * 0.02) * 2 + windX;
                p.angle += p.spin;

                ctx.globalCompositeOperation = 'source-over';
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle * Math.PI / 180);

                // White/Silver/PalePink Palette
                const cols = ['#FFFFFF', '#F0F8FF', '#E6E6FA'];
                ctx.fillStyle = cols[i % 3];
                ctx.shadowBlur = glow > 1 ? 10 : 0;
                ctx.shadowColor = "white";

                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * glow, (p.size * 1.5) * glow, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            else if (p.type === 'rain') { // Mist/Snow
                p.y += p.vy * 2; // Slower, like snow
                p.x += windX * 0.5;

                ctx.globalCompositeOperation = 'screen';
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, (p.size / 2) * glow, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (p.type === 'stardust') {
                p.y += p.vy * 0.5;
                p.x += Math.sin(p.y * 0.01) + windX * 0.2;
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "white";
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.random() * 3 * glow, 0, Math.PI * 2);
                ctx.fill();
            }

            // Boundary wrap
            if (p.y > canvas.height + 50) { p.y = -50; p.x = Math.random() * canvas.width; }
            if (p.y < -50) { p.y = canvas.height + 50; p.x = Math.random() * canvas.width; }
            if (p.x > canvas.width + 50) p.x = -50;
            if (p.x < -50) p.x = canvas.width + 50;
        });

        requestAnimationFrame(animateParticles);
    }

    // Start Weather Engine
    setWeather('sunbeams');
    animateParticles();
    window.addEventListener('resize', () => { canvas.width = innerWidth; canvas.height = innerHeight; });


    /* --- LEVEL INTERACTION LOGIC (Simplified from before) --- */

    // L2: Balloons (Logic Moved Above)

    // L3: Carousel
    let carouselAngle = 0;
    function initCarousel() {
        const con = document.getElementById('carousel');
        const batch = galleryData.slice(5, 12);
        const radius = 250;
        batch.forEach((item, i) => {
            const angle = (i / batch.length) * 360;
            const el = document.createElement('div');
            el.className = 'carousel-item';
            el.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            el.innerHTML = `<img src="${item.src}">`;
            el.onclick = () => openLightbox(item);
            con.appendChild(el);
        });
        document.getElementById('spin-left').onclick = () => { carouselAngle += 45; con.style.transform = `rotateY(${carouselAngle}deg)`; addXP(1); };
        document.getElementById('spin-right').onclick = () => { carouselAngle -= 45; con.style.transform = `rotateY(${carouselAngle}deg)`; addXP(1); };
        setTimeout(() => {
            // Mock progress check
            document.getElementById('spin-right').addEventListener('click', () => {
                if (Math.abs(carouselAngle) > 135) setTimeout(() => goToLevel(4), 1000);
            });
        }, 1000);
    }

    // L4: Mirror
    function initMirror() {
        const inp = document.getElementById('mirror-input');
        inp.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                if (inp.value.length > 0) { addXP(5); goToLevel(5); }
            }
        });
    }

    // Finale
    function initFinale() {
        const wall = document.getElementById('wall');
        galleryData.sort(() => 0.5 - Math.random()).forEach(item => {
            const img = document.createElement('img');
            img.src = item.src; img.className = 'wall-item';
            wall.appendChild(img);
        });
        // Scroll
        let y = 0;
        function scroll() { window.scrollBy(0, 1); requestAnimationFrame(scroll); }
        setTimeout(scroll, 1000);
    }

    // Helpers
    const lb = document.getElementById('lightbox');
    function openLightbox(item) {
        document.getElementById('lightbox-img').src = item.src;
        document.getElementById('lightbox-quote').textContent = item.quote;
        lb.classList.remove('hidden');
    }
    document.getElementById('lightbox-close').onclick = () => lb.classList.add('hidden');
    document.getElementById('toggle-music').onclick = () => {
        if (!state.audio) { audioEl.play(); state.audio = true; }
        else { audioEl.pause(); state.audio = false; }
    };

    function createBurst(x, y) {
        // Simple manual particle burst injection into the main array
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                type: 'stardust', size: 3, opacity: 1
            });
        }
    }

});
