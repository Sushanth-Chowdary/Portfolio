const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let dots = [];

// --- TWEAK THESE SETTINGS ---
const spacing = 50;            // Distance between the dots
const interactionRadius = 150; // How big the "flashlight" hover area is
const maxDotRadius = 4;        // The size of the dot when directly under the mouse
const easing = 0.08;           // How smooth the animation is (lower = slower/smoother)
// -----------------------------
let mouse = { x: -1000, y: -1000 };

// 1. Setup the Grid
function init() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    dots = [];
    // Loop through the screen width and height to plot out the grid
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            dots.push({
                x: x,
                y: y,
                currentRadius: 0 // All dots start invisible
            });
        }
    }
}

// 2. Track the Mouse
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// 3. The Animation Loop
function animate() {
    requestAnimationFrame(animate);
    // Clear the screen every frame
    ctx.clearRect(0, 0, width, height);
    
    // Set dot color
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    dots.forEach(dot => {
        // Calculate how far the mouse is from this specific dot
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetRadius = 0;

        // If the dot is close enough to the mouse, calculate its size
        if (distance < interactionRadius) {
            const factor = 1 - (distance / interactionRadius);
            targetRadius = factor * maxDotRadius;
        }

        // Smoothly transition the current radius to the target radius
        dot.currentRadius += (targetRadius - dot.currentRadius) * easing;

        // Only draw the dot if it's large enough to see (saves browser memory)
        if (dot.currentRadius > 0.1) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// 4. Handle Resizing so the grid updates if the user makes the window bigger
window.addEventListener('resize', init);

// Start it up
init();
animate();