// ==========================================
// 1. ORIGINAL 2D CANVAS BACKGROUND LOGIC
// ==========================================
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

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 200);
});

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    
    time += 0.015; 

    dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        
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

        if (targetRadius > dot.currentRadius) {
            dot.currentRadius += (targetRadius - dot.currentRadius) * 0.3; 
        } else {
            dot.currentRadius += (targetRadius - dot.currentRadius) * 0.015; 
        }

        ctx.beginPath();
        const renderRadius = Math.max(0.1, dot.currentRadius); 
        ctx.arc(dot.x, dot.y, renderRadius, 0, Math.PI * 2);

        const sizeIntensity = Math.max(0, (dot.currentRadius - dot.baseRadius) / maxDotRadius);

        if (sizeIntensity > 0.01) {
            const r = Math.floor(255);
            const g = Math.floor(58 + (100 * (1 - sizeIntensity)));
            const b = Math.floor(130 + (125 * sizeIntensity));
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + (sizeIntensity * 0.6)})`;
            ctx.shadowBlur = 20 * sizeIntensity;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${sizeIntensity})`;
        } else {
            const alpha = 0.15 + (idleWave * 0.1); 
            ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
            ctx.shadowBlur = 0;
        }

        ctx.fill();
    });
}

init();
animate();


// ==========================================
// 2. THREE.JS NETWORK SPHERE LOGIC
// ==========================================
const container = document.getElementById('right');
const tooltip = document.getElementById('tooltip');

// Scene & Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
camera.position.z = 250;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// --- NEW: Interactive Orbit Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Adds smooth friction
controls.dampingFactor = 0.05;
controls.enablePan = false; 
controls.enableZoom = false; // Keeps the sphere fixed in place

// Sphere Configuration
const nodeCount = 200;
const sphereRadius = 80;
const connectionDistance = 25;

const particlesData = [];
const positions = new Float32Array(nodeCount * 3);
const colors = new Float32Array(nodeCount * 3);
const baseColor = new THREE.Color(0x00f0ff); // Brighter cyan base color

for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;

    positions[i * 3] = sphereRadius * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = sphereRadius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = sphereRadius * Math.cos(phi);

    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;

    // Simulate different project data
    const types = ["Hardware", "Robotics", "Web Dev", "Machine Learning"];
    particlesData.push({
        projectName: `Project Module ${i + 1}`,
        description: `${types[i % 4]} concepts and documentation.`
    });
}

// 1. Create Nodes
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
});
const pointCloud = new THREE.Points(geometry, particleMaterial);

// 2. Create Lines (Thicker look via opacity and color)
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0088ff, // Deeper blue to contrast with cyan nodes
    transparent: true,
    opacity: 0.45 // Increased opacity makes lines appear bolder
});
const linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);

// --- NEW: Highlight "Pop-Out" Sphere ---
const highlightGeometry = new THREE.SphereGeometry(3.5, 16, 16); 
const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xff2a7a }); // Pinkish/Magenta pop
const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
highlightMesh.visible = false; 

// Group to rotate everything together
const group = new THREE.Group();
group.add(pointCloud);
group.add(linesMesh);
group.add(highlightMesh); // Adding to group ensures it rotates perfectly with the nodes
scene.add(group);

// Generate Connections
const linePositions = [];
for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
            linePositions.push(
                positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
            );
        }
    }
}
linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

// 3. Raycasting Setup
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 6; 
const mouse3D = new THREE.Vector2(-1000, -1000);
let hoveredIndex = null;
let isHovering = false; // Controls the pause feature

container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouse3D.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse3D.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    tooltip.style.left = `${event.clientX - rect.left + 15}px`;
    tooltip.style.top = `${event.clientY - rect.top + 15}px`;
});

container.addEventListener('mouseleave', () => {
    mouse3D.x = -1000; 
    mouse3D.y = -1000;
});

// 4. Animation Loop
function animate3D() {
    requestAnimationFrame(animate3D);

    raycaster.setFromCamera(mouse3D, camera);
    const intersects = raycaster.intersectObject(pointCloud);

    if (intersects.length > 0) {
        isHovering = true; // Pause rotation
        const index = intersects[0].index;

        // Snap highlight mesh to the hovered node to make it "pop"
        highlightMesh.position.set(
            positions[index * 3], 
            positions[index * 3 + 1], 
            positions[index * 3 + 2]
        );
        highlightMesh.visible = true;
        
        if (hoveredIndex !== index) {
            hoveredIndex = index;
            const data = particlesData[index];
            tooltip.innerHTML = `<h3>${data.projectName}</h3><p>${data.description}</p>`;
            tooltip.classList.remove('hidden');
            
            // Optional: change cursor to pointer
            container.style.cursor = 'pointer'; 
        }
    } else {
        isHovering = false; // Resume rotation
        highlightMesh.visible = false; // Hide pop-out

        if (hoveredIndex !== null) {
            hoveredIndex = null;
            tooltip.classList.add('hidden');
            container.style.cursor = 'default';
        }
    }

    // --- NEW: Pause Rotation Logic ---
    if (!isHovering) {
        group.rotation.y += 0.015;
        group.rotation.x += 0.005;
    }

    controls.update(); // Required for smooth damping on user drag
    renderer.render(scene, camera);
}

animate3D();

// ==========================================
// 3. NAVIGATION & REVEAL ANIMATION LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page-content');

    // Toggle menu collapsing/uncollapsing
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('collapsed');
        navToggle.classList.toggle('rotated');
    });

    // Handle Page Transitions
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent triggering if clicking the already active button
            if (btn.classList.contains('active')) return;

            // Update Active Button State
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            const targetPage = document.getElementById(targetId);

            // Get exact click coordinates for the origin of the circle
            const clickX = e.clientX + 'px';
            const clickY = e.clientY + 'px';

            pages.forEach(page => {
                if (page.id === targetId) {
                    // Prepare target page for animation
                    page.classList.remove('hidden-page');
                    page.classList.add('active-page');
                    
                    // Set CSS variables for the exact origin of the click
                    page.style.setProperty('--click-x', clickX);
                    page.style.setProperty('--click-y', clickY);
                    
                    // Trigger reflow & add animation class
                    void page.offsetWidth; 
                    page.classList.add('reveal-animation');

                    // Clean up animation class after it finishes (0.8s)
                    setTimeout(() => {
                        page.classList.remove('reveal-animation');
                        page.style.clipPath = 'none'; // reset clip path so it stays fully visible
                    }, 800);

                } else {
                    // Hide other pages immediately (or you could fade them out)
                    page.classList.remove('active-page');
                    page.classList.add('hidden-page');
                    page.style.clipPath = 'none';
                }
            });
        });
    });
});