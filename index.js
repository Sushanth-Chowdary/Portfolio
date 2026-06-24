const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let dots = [];
const spacing = 25;         
const interactionRadius = 150;
const maxDotRadius = 4;        
const easing = 0.15;           
let mouse = { x: -1000, y: -1000 };

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
                currentRadius: 1, // Start slightly visible
                baseRadius: 1
            });
        }
    }
}

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Reset mouse position when leaving the window
window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// The Animation Loop
function animate() {
    requestAnimationFrame(animate);
    // Clear frame
    ctx.clearRect(0, 0, width, height);

    dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetRadius = dot.baseRadius;
        let intensity = 0;

        // Calculate interaction math based on distance
        if (distance < interactionRadius) {
            intensity = 1 - (distance / interactionRadius);
            targetRadius = dot.baseRadius + (intensity * maxDotRadius);
        }

        // Ease the radius to make it smooth
        dot.currentRadius += (targetRadius - dot.currentRadius) * easing;

        // Draw the dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);

        if (intensity > 0.05) {
            // Glowing active state (Cyan to Magenta based on distance)
            const r = Math.floor(255 * intensity);
            const g = Math.floor(255 * (1 - intensity));
            const b = 255;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + (intensity * 0.6)})`;
            ctx.shadowBlur = 15 * intensity;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`;
        } else {
            // Dim, resting state
            ctx.fillStyle = 'rgba(100, 150, 255, 0.15)';
            ctx.shadowBlur = 0;
        }

        ctx.fill();
    });
}

// Recalculate if the user resizes the browser
window.addEventListener('resize', init);

// Start the animation
init();
animate();