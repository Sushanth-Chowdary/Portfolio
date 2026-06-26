const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let dots = [];

// Increased spacing and radius for the particle effect
const spacing = 30;         
const interactionRadius = 100;
const maxDotRadius = 10;        
const easing = 0.15;           
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
    
    time += 0.015; // Slowed down the breathing slightly for a calmer effect

    dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        
        // Optimization: Use squared distance to avoid Math.sqrt on every dot
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

        dot.currentRadius += (targetRadius - dot.currentRadius) * easing;

        ctx.beginPath();
        const renderRadius = Math.max(0.1, dot.currentRadius); 
        ctx.arc(dot.x, dot.y, renderRadius, 0, Math.PI * 2);

        if (intensity > 0.05) {
            // Neon pink/purple mix when hovered
            const r = Math.floor(255);
            const g = Math.floor(58 + (100 * (1 - intensity)));
            const b = Math.floor(130 + (125 * intensity));
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + (intensity * 0.6)})`;
            ctx.shadowBlur = 20 * intensity;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
            // Soft white/cyan resting state
            const alpha = 0.15 + (idleWave * 0.1); 
            ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
            ctx.shadowBlur = 0;
        }

        ctx.fill();
    });
}

init();
animate();