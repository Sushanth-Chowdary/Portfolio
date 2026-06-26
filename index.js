const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let dots = [];

// Grid Settings
const spacing = 20;         
const interactionRadius = 70;
const maxDotRadius = 10;        
let mouse = { x: -1000, y: -1000 };
let time = 0; 

function init() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    dots = [];
    
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            dots.push({
                x: x,
                y: y,
                currentRadius: 1.5, 
                baseRadius: 1.5
            });
        }
    }
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// Debounced resize to improve performance
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 200);
});

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    
    time += 0.015; // Speed of the idle breathing wave

    dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        
        // Use squared distance for performance optimization
        const distSquared = (dx * dx) + (dy * dy);
        const radiusSquared = interactionRadius * interactionRadius;

        const idleWave = Math.sin(dot.x * 0.01 + time) * Math.cos(dot.y * 0.01 + time);
        let targetRadius = dot.baseRadius + (idleWave * 1.5); 
        let intensity = 0;

        if (distSquared < radiusSquared) {
            const distance = Math.sqrt(distSquared);
            intensity = 1 - (distance / interactionRadius);
            targetRadius = dot.baseRadius + (intensity * maxDotRadius);
        }

        // --- ASYMMETRIC EASING (THE TRAIL EFFECT) ---
        if (targetRadius > dot.currentRadius) {
            // Fast attack when hovered
            dot.currentRadius += (targetRadius - dot.currentRadius) * 0.3; 
        } else {
            // Slow release when mouse leaves
            dot.currentRadius += (targetRadius - dot.currentRadius) * 0.015; 
        }

        ctx.beginPath();
        const renderRadius = Math.max(0.1, dot.currentRadius); 
        ctx.arc(dot.x, dot.y, renderRadius, 0, Math.PI * 2);

        // --- COLOR SYNC LOGIC ---
        // Calculate intensity based on the actual current size of the dot, 
        // not just mouse proximity. This keeps the color while it shrinks.
        const sizeIntensity = Math.max(0, (dot.currentRadius - dot.baseRadius) / maxDotRadius);

        if (sizeIntensity > 0.01) {
            // Neon pink/purple mapped to the fading size
            const r = Math.floor(255);
            const g = Math.floor(58 + (100 * (1 - sizeIntensity)));
            const b = Math.floor(130 + (125 * sizeIntensity));
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + (sizeIntensity * 0.6)})`;
            ctx.shadowBlur = 20 * sizeIntensity;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${sizeIntensity})`;
        } else {
            // Soft cyan resting state blending with the idle wave
            const alpha = 0.15 + (idleWave * 0.1); 
            ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
            ctx.shadowBlur = 0;
        }

        ctx.fill();
    });
}

init();
animate();S