

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let dots = [];
const spacing = 25;         
const interactionRadius = 150;
const maxDotRadius = 4;        
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
                currentRadius: 1, 
                baseRadius: 1.2
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

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    
    time += 0.02; // Increment time every frame

    dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // NEW: Idle breathing wave based on coordinates and time
        const idleWave = Math.sin(dot.x * 0.01 + time) * Math.cos(dot.y * 0.01 + time);
        
        let targetRadius = dot.baseRadius + (idleWave * 0.5); // Add wave to base size
        let intensity = 0;

        // Mouse interaction math (Overrides the idle wave if close)
        if (distance < interactionRadius) {
            intensity = 1 - (distance / interactionRadius);
            targetRadius = dot.baseRadius + (intensity * maxDotRadius);
        }

        dot.currentRadius += (targetRadius - dot.currentRadius) * easing;

        ctx.beginPath();
        // Prevent radius from dropping below zero (which causes canvas errors)
        const renderRadius = Math.max(0.1, dot.currentRadius); 
        ctx.arc(dot.x, dot.y, renderRadius, 0, Math.PI * 2);

        if (intensity > 0.05) {
            const r = Math.floor(255 * intensity);
            const g = Math.floor(255 * (1 - intensity));
            const b = 255;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + (intensity * 0.6)})`;
            ctx.shadowBlur = 15 * intensity;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`;
        } else {
            // Resting state (also affected by the idle wave so it pulses slightly)
            const alpha = 0.15 + (idleWave * 0.1); 
            ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
            ctx.shadowBlur = 0;
        }

        ctx.fill();
    });
}

window.addEventListener('resize', init);

init();
animate();