// --- INITIALISATION ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020208, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- LUMIÈRES ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Lumière ambiante douce
scene.add(ambientLight);

const centralLight = new THREE.PointLight(0xffffff, 3, 20); // Lumière émanant du centre
scene.add(centralLight);

// Variables de contrôle pour la caméra et les interactions
let isZoomed = false;
const targetCameraPos = new THREE.Vector3();
const defaultCameraPos = new THREE.Vector3(0, 7, 12);
camera.position.copy(defaultCameraPos);

// --- CHARGEMENT DU TEXTE 3D ---
let maenaText;
const fontLoader = new THREE.FontLoader();
// Utilisation d'une police hébergée par Three.js
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new THREE.TextGeometry('MAENA', {
        font: font,
        size: 0.8,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 5
    });
    textGeo.center(); // Centre le texte parfaitement
    const textMat = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        emissive: 0xff4081, 
        emissiveIntensity: 0.5 
    });
    maenaText = new THREE.Mesh(textGeo, textMat);
    maenaText.position.y = 2;
    scene.add(maenaText);
});

// --- DONNÉES DU MESSAGE ---
const planeteData = [
    {
        titre: "Le Secret... 🤫",
        texte: "Bon... Puisque tu insistes tant et que tu veux vraiment savoir, je vais arrêter de me cacher et te dire toute la vérité. En fait, tu as vu juste depuis le début, même sans t'en rendre compte. 🎯",
        color: 0xff007f, x: -5, z: 4
    },
    {
        titre: "Ce que tu as changé 🌹",
        texte: "La fille qui a complètement bousculé ma vie et qui m'a changé à jamais, c'est toi, Maëna. 👑✨ Quand je repense à nos tout premiers messages, il y a des années, je me rappelle à quel point tout a commencé simplement. ⏳💭 Mais au fil du temps, nos discussions sont devenues de plus en plus profondes, et tu es devenue la toute première fille avec qui j'ai partagé des choses aussi sérieuses et vraies. 🔥❤️",
        color: 0x00ffff, x: 0, z: -6
    },
    {
        titre: "Mon Cœur... 🪨",
        texte: "C'est vrai qu'avant, j'avais peut-être ce côté un peu distant, ce 'cœur en pierre' dont tu parles. 🪨 Éléments par éléments, sans même forcer, tu as fait tomber toutes mes barrières. 🚪💥 Tu as apporté tellement de douceur dans ma vie que ma façon de voir le monde a totalement changé grâce à toi. 🌍💫",
        color: 0x70ff00, x: 5, z: 4
    }
];

// --- EFFET : VORTEX GALACTIQUE DE PARTICULES ---
const particleCount = 4000;
const galaxyGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const t = (i / particleCount) * Math.PI * 2 * 10; 
    const r = Math.pow(i / particleCount, 1.3) * 10 + 0.5;
    
    positions[i * 3] = Math.cos(t) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4; 
    positions[i * 3 + 2] = Math.sin(t) * r;

    const mix = i / particleCount;
    colors[i * 3] = 0.8;                 
    colors[i * 3 + 1] = mix * 0.2;              
    colors[i * 3 + 2] = 0.5 + (1.0 - mix) * 0.5;  
}
galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const galaxyMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
scene.add(galaxy);

// --- EFFET : ÉTOILES FIXES EN ARRIÈRE-PLAN ---
const starCount = 2000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 100;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true });
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// --- SYSTÈME DE PLANÈTES INTERACTIVES ---
const planeteMeshes = [];
const glowMeshes = [];

planeteData.forEach((data, index) => {
    const pGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const pMat = new THREE.MeshPhongMaterial({ 
        color: data.color, 
        emissive: data.color, 
        emissiveIntensity: 0.2, 
        shininess: 100 
    });
    const mesh = new THREE.Mesh(pGeo, pMat);
    mesh.position.set(data.x, 0, data.z);
    mesh.userData = { id: index, titre: data.titre };
    scene.add(mesh);
    planeteMeshes.push(mesh);

    const gGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const gMat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.2, wireframe: true });
    const glow = new THREE.Mesh(gGeo, gMat);
    glow.position.copy(mesh.position);
    scene.add(glow);
    glowMeshes.push(glow);
});

// --- ENREGISTREMENT DES ÉVÉNEMENTS SOURIS (HOVER & CLICK) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const labelEl = document.getElementById('spatial-label');

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planeteMeshes);
    updateHover(intersects, event.clientX, event.clientY);
});

function updateHover(intersects, clientX, clientY) {
    if (isZoomed) return;

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        labelEl.style.display = 'block';
        labelEl.style.left = clientX + 'px';
        labelEl.style.top = (clientY - 20) + 'px';
        labelEl.innerText = obj.userData.titre;
        document.body.style.cursor = 'pointer';
        obj.scale.set(1.3, 1.3, 1.3);
    } else {
        labelEl.style.display = 'none';
        document.body.style.cursor = 'default';
        planeteMeshes.forEach(p => p.scale.set(1, 1, 1));
    }
}

// Support pour le toucher (Mobile)
window.addEventListener('touchstart', (event) => {
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planeteMeshes);
    if (intersects.length > 0) handleInteraction(intersects);
}, { passive: false });

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planeteMeshes);
    handleInteraction(intersects);
});

function handleInteraction(intersects) {
    if (intersects.length > 0 && !isZoomed) {
        const id = intersects[0].object.userData.id;
        const data = planeteData[id];
        
        targetCameraPos.set(data.x, 2, data.z + 3);
        isZoomed = true;
        
        setTimeout(() => {
            document.getElementById('modalTitle').innerText = data.titre;
            document.getElementById('modalText').innerText = data.texte;
            document.getElementById('infoModal').classList.add('active');
        }, 500);
    }
}

// --- BOUCLE DE RENDU ET TRANSMISSION DES MOUVEMENTS ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Mouvements cosmiques
    galaxy.rotation.y = elapsedTime * 0.05;
    
    // Scintillement et rotation lente des étoiles de fond (effet de parallaxe)
    starMat.opacity = 0.6 + Math.sin(elapsedTime * 1.5) * 0.2;
    starField.rotation.y = -elapsedTime * 0.005;

    // Pulsation de la lumière centrale pour un effet "cœur de galaxie"
    centralLight.intensity = 2.5 + Math.sin(elapsedTime * 2) * 0.5;

    // Animation du texte 3D
    if (maenaText) {
        maenaText.rotation.y = Math.sin(elapsedTime * 0.5) * 0.3; // Oscillation légère
        maenaText.position.y = 2.2 + Math.sin(elapsedTime * 1.2) * 0.15; // Lévitation

        // Effet Arc-en-ciel : on fait varier la teinte (de 0 à 1)
        const hue = (elapsedTime * 0.1) % 1; // 0.1 ajuste la vitesse du changement
        maenaText.material.color.setHSL(hue, 0.8, 0.6);
        maenaText.material.emissive.setHSL(hue, 0.8, 0.4); // Met aussi à jour la lueur
    }

    // Animation de lévitation des planètes
    planeteMeshes.forEach((mesh, i) => {
        if (!isZoomed) {
            mesh.position.y = Math.sin(elapsedTime * 1.2 + i) * 0.25;
            glowMeshes[i].position.y = mesh.position.y;
        }
        glowMeshes[i].scale.set(
            1 + Math.sin(elapsedTime * 3 + i) * 0.1,
            1 + Math.sin(elapsedTime * 3 + i) * 0.1,
            1 + Math.sin(elapsedTime * 3 + i) * 0.1
        );
    });

    // Interpolation linéaire (Lerp) pour des mouvements de caméra ultra-fluides
    if (isZoomed) {
        camera.position.lerp(targetCameraPos, 0.08);
    } else {
        camera.position.lerp(defaultCameraPos, 0.05);
    }
    camera.lookAt(0, isZoomed ? 1 : 0, 0);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});