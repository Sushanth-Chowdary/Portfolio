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
animate();


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

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
camera.position.z = 250;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Sphere Configuration
const nodeCount = 150;
const sphereRadius = 80;
const connectionDistance = 25;

// Data Structures
const particlesData = [];
const v = new THREE.Vector3();

// 1. Create Nodes (Vertices)
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(nodeCount * 3);
const colors = new Float32Array(nodeCount * 3);
const baseColor = new THREE.Color(0x00ffff); // Cyan

for (let i = 0; i < nodeCount; i++) {
    // Fibonacci sphere distribution for even spacing
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;

    positions[i * 3] = sphereRadius * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = sphereRadius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = sphereRadius * Math.cos(phi);

    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;

    particlesData.push({
        projectName: `Project Node ${i + 1}`,
        description: `Click to view details about module ${i + 1}.`,
        scale: 1.0
    });
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Node Material
const particleMaterial = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const pointCloud = new THREE.Points(geometry, particleMaterial);
scene.add(pointCloud);

// 2. Create Lines (Network Connections)
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.2
});
const linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
scene.add(linesMesh);

// Group to rotate everything together
const group = new THREE.Group();
group.add(pointCloud);
group.add(linesMesh);
scene.add(group);

// 3. Raycasting Setup (Hover interaction)
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 5; // Make it easier to hover over points
const mouse3D = new THREE.Vector2();
let hoveredIndex = null;

// Track mouse position relative to the #right container
container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouse3D.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse3D.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Position tooltip near cursor
    tooltip.style.left = `${event.clientX - rect.left + 15}px`;
    tooltip.style.top = `${event.clientY - rect.top + 15}px`;
});

// Hide tooltip when leaving container
container.addEventListener('mouseleave', () => {
    mouse3D.x = -1000; 
    mouse3D.y = -1000;
    tooltip.classList.add('hidden');
    
    // Reset colors
    if (hoveredIndex !== null) {
        geometry.attributes.color.setXYZ(hoveredIndex, baseColor.r, baseColor.g, baseColor.b);
        geometry.attributes.color.needsUpdate = true;
        hoveredIndex = null;
    }
});

// Update lines dynamically (Optional: you can run this once if nodes don't move relative to each other)
function updateConnections() {
    const positions = pointCloud.geometry.attributes.position.array;
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
}

// Initial connection calculation
updateConnections();

// 4. Animation Loop for 3D Sphere
function animate3D() {
    requestAnimationFrame(animate3D);

    // Rotate the globe
    group.rotation.y += 0.002;
    group.rotation.x += 0.001;

    // Raycasting logic
    raycaster.setFromCamera(mouse3D, camera);
    const intersects = raycaster.intersectObject(pointCloud);

    if (intersects.length > 0) {
        const index = intersects[0].index;
        
        if (hoveredIndex !== index) {
            // Reset previous hovered node
            if (hoveredIndex !== null) {
                geometry.attributes.color.setXYZ(hoveredIndex, baseColor.r, baseColor.g, baseColor.b);
            }
            
            // Highlight new node
            hoveredIndex = index;
            geometry.attributes.color.setXYZ(index, 1, 0, 0.5); // Highlight color (Pinkish)
            geometry.attributes.color.needsUpdate = true;

            // Show Tooltip
            const data = particlesData[index];
            tooltip.innerHTML = `<h3>${data.projectName}</h3><p>${data.description}</p>`;
            tooltip.classList.remove('hidden');
        }
    } else {
        if (hoveredIndex !== null) {
            geometry.attributes.color.setXYZ(hoveredIndex, baseColor.r, baseColor.g, baseColor.b);
            geometry.attributes.color.needsUpdate = true;
            hoveredIndex = null;
            tooltip.classList.add('hidden');
        }
    }

    renderer.render(scene, camera);
}

animate3D();