// 3D Nöron Ağı - Kıvrımlı Beyin (Lumina Studio)
// Orijinal kıvrımlı geometri (folds), beyincik, 2400 nöron düğümü, akson çizgileri ve kart entegrasyonu

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- BEYİN BÖLGELERİ KONFİGÜRASYONU ---
const BEYIN_BOLGELERI = {
    OksipitalLob: { x: -3.5, y: -0.5, z: 0, radius: 1.5, color: 0x000000 },
    GorselKorteks: { x: -4.0, y: -0.5, z: 0, radius: 1.0, color: 0x000000 },
    VentralGorselYol: { x: -2.0, y: -2.0, z: 1.0, radius: 1.2, color: 0x000000 },
    DorsalGorselYol: { x: -2.0, y: 1.5, z: 1.0, radius: 1.2, color: 0x000000 },
    ParietalLob: { x: -1.0, y: 2.0, z: 0, radius: 2.0, color: 0x000000 },
    TemporalLob: { x: 0.5, y: -1.5, z: 2.0, radius: 2.0, color: 0x000000 },
    Hipokampus: { x: 0, y: -1.0, z: 0.5, radius: 1.0, color: 0x000000 },
    PrefrontalKorteks: { x: 3.5, y: 1.0, z: 0, radius: 2.0, color: 0x000000 },
    IsitselKorteks: { x: 1.0, y: -0.5, z: 2.5, radius: 1.0, color: 0x000000 },
    UstTemporalGirus: { x: 0.5, y: 0, z: 2.5, radius: 1.2, color: 0x000000 },
    FrontalDilAglari: { x: 2.5, y: 0.5, z: 1.5, radius: 1.5, color: 0x000000 },
    MotorKorteks: { x: 1.0, y: 2.5, z: 0, radius: 1.5, color: 0x000000 },
    Beyincik: { x: -3.0, y: -3.5, z: 0, radius: 1.5, color: 0x000000 },
    SolOksipitotemporal: { x: -2.5, y: -2.5, z: 1.5, radius: 1.2, color: 0x000000 },
    GorselKelimeBicimi: { x: -2.0, y: -2.5, z: 2.0, radius: 1.0, color: 0x000000 },
    BazalGangliyonlar: { x: 0.5, y: 0, z: 0.5, radius: 1.0, color: 0x000000 },
    Amigdala: { x: 1.0, y: -1.5, z: 0.8, radius: 0.8, color: 0x000000 }
};

// 5 Temel Öğrenme Modelinin Bölgelerle Eşleşmesi
const MODEL_CONFIG = {
    gorsel: {
        name: "Görsel Öğrenme (Visual)",
        colorHex: 0xA855F7, // Mor
        regions: ['OksipitalLob', 'GorselKorteks', 'VentralGorselYol', 'DorsalGorselYol', 'ParietalLob', 'Hipokampus', 'PrefrontalKorteks'],
        labelsText: "Oksipital Lob, Görsel Korteks, Ventral & Dorsal Yol, Hipokampus"
    },
    isitsel: {
        name: "İşitsel Öğrenme (Auditory)",
        colorHex: 0x10B981, // Canlı Yeşil
        regions: ['IsitselKorteks', 'TemporalLob', 'UstTemporalGirus', 'FrontalDilAglari', 'PrefrontalKorteks'],
        labelsText: "İşitsel Korteks, Temporal Lob, Üst Temporal Girus, Dil Ağları"
    },
    yazarak: {
        name: "Yazarak Öğrenme (Writing)",
        colorHex: 0xEC4899, // Pembe
        regions: ['PrefrontalKorteks', 'MotorKorteks', 'FrontalDilAglari', 'Beyincik', 'Hipokampus'],
        labelsText: "Motor Korteks, Prefrontal Korteks, Dil Ağları, Beyincik"
    },
    okuyarak: {
        name: "Okuyarak Öğrenme (Reading)",
        colorHex: 0x0284C7, // Elektrik Mavi
        regions: ['OksipitalLob', 'GorselKelimeBicimi', 'SolOksipitotemporal', 'TemporalLob', 'FrontalDilAglari', 'Hipokampus'],
        labelsText: "Görsel Kelime Biçimi, Oksipital Lob, Dil Ağları, Hipokampus"
    },
    deneyimsel: {
        name: "Deneyimsel Öğrenme (Experiential)",
        colorHex: 0xF59E0B, // Kehribar Sarı
        regions: ['MotorKorteks', 'Beyincik', 'BazalGangliyonlar', 'Amigdala', 'Hipokampus', 'ParietalLob'],
        labelsText: "Motor Korteks, Beyincik, Bazal Gangliyonlar, Amigdala, Hipokampus"
    }
};

function initBrain() {
    const container = document.getElementById('brain-3d-container');
    if (!container) return;

    const statusText = document.getElementById('brain-status-text');
    const infoDot = document.querySelector('.brain-info-dot');
    const activeRegionsBadge = document.getElementById('brain-active-regions-badge');

    const getWidth = () => container.clientWidth || 550;
    const getHeight = () => container.clientHeight || 580;

    // --- TEMEL SAHNE KURULUMU ---
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(getWidth(), getHeight());
    renderer.setClearColor(0x000000, 0); // Tam şeffaf
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 100);
    camera.position.set(12, 2, 12); // Yandan görünüm odaklı kamera

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 35;

    // Mobil dokunmatik cihazlarda sayfa kaydırmasını kilitlemeyi önle
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) {
        controls.enableZoom = false;
    }
    renderer.domElement.style.touchAction = 'pan-y';

    // Işıklandırma (Toon/Cel shading için yönlü ışık)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // Ana Grup Merkezi
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // --- SOLUK BEYİN KIVRIMLARI (GYRUS/SULCUS) MANTIĞI ---
    const foldGeometry = new THREE.SphereGeometry(4, 128, 128);
    const posAttribute = foldGeometry.attributes.position;
    const v3 = new THREE.Vector3();

    for (let i = 0; i < posAttribute.count; i++) {
        v3.fromBufferAttribute(posAttribute, i);
        
        // Büyük beyin eliptik yapısı (yandan uzun)
        v3.x *= 1.3;
        v3.y *= 1.0;
        v3.z *= 0.8;
        
        // Matematiksel dalgalarla kıvrım (folds) oluşturma
        const noise = Math.sin(v3.x * 4) * Math.cos(v3.y * 4) * Math.sin(v3.z * 4) * 0.3;
        v3.addScaledVector(v3.clone().normalize(), noise);
        
        posAttribute.setXYZ(i, v3.x, v3.y, v3.z);
    }
    foldGeometry.computeVertexNormals();

    const foldMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.04, // Çok soluk, hayalet kıvrım hissi
        shininess: 10,
        side: THREE.DoubleSide,
        depthWrite: false // İçteki çizgilerin ve nöronların z-buffer testinde kaybolmasını önler
    });
    const foldsMesh = new THREE.Mesh(foldGeometry, foldMaterial);
    foldsMesh.renderOrder = 0;
    brainGroup.add(foldsMesh);

    // Beyincik (Cerebellum) Kıvrımları
    const cerebellumFoldGeom = new THREE.SphereGeometry(1.5, 64, 64);
    const cPos = cerebellumFoldGeom.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
        v3.fromBufferAttribute(cPos, i);
        const cNoise = Math.sin(v3.x * 8) * Math.sin(v3.y * 12) * 0.15;
        v3.addScaledVector(v3.clone().normalize(), cNoise);
        cPos.setXYZ(i, v3.x, v3.y, v3.z);
    }
    cerebellumFoldGeom.computeVertexNormals();
    const cerebellumFolds = new THREE.Mesh(cerebellumFoldGeom, foldMaterial);
    cerebellumFolds.position.set(-3.2, -3.2, 0);
    cerebellumFolds.renderOrder = 0;
    brainGroup.add(cerebellumFolds);

    // --- NÖRON AĞI ÜRETİMİ (2400 NOKTA) ---
    const nodeCount = 2400;
    const nodes = [];
    const nodeBaseScales = [];
    const nodeRegions = [];
    const nodeActiveState = new Uint8Array(nodeCount);

    // Nöron için Cel Shading Materyali (Yumuşatılmış koyu gri dış çizgi)
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x4B5563, side: THREE.BackSide });
    const fillMaterial = new THREE.MeshToonMaterial({ color: 0xffffff }); // Default Beyaz

    const nodeGeometry = new THREE.SphereGeometry(1, 8, 8);
    const instancedMesh = new THREE.InstancedMesh(nodeGeometry, fillMaterial, nodeCount);
    const outlineMesh = new THREE.InstancedMesh(nodeGeometry, outlineMaterial, nodeCount);

    const dummy = new THREE.Object3D();
    const defaultWhite = new THREE.Color(0xffffff);

    let i = 0;
    while (i < nodeCount) {
        const isCerebellum = Math.random() > 0.85;
        let x, y, z;
        if (isCerebellum) {
            const uC = Math.pow(Math.random(), 0.7);
            const r = (0.15 + 0.85 * uC) * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            x = -3.2 + r * Math.sin(phi) * Math.cos(theta);
            y = -3.2 + r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } else {
            // Merkezdeki aşırı yoğunluğu azaltan dengeli radyal dağılım
            const u = Math.pow(Math.random(), 0.6);
            const r = (0.18 + 0.82 * u) * 4.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            x = r * Math.sin(phi) * Math.cos(theta) * 1.3; 
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi) * 0.8; 
            if (x < -2.5 && y < -2) continue; // Beyincik boşluğu
        }

        // Kıvrımlara uyum sağlaması için noktaları dalgalandırma
        const noise = Math.sin(x * 4) * Math.cos(y * 4) * Math.sin(z * 4) * 0.3;
        x += noise * (x / 4);
        y += noise * (y / 4);
        z += noise * (z / 4);

        const posVec = new THREE.Vector3(x, y, z);
        nodes.push(posVec);

        // Hangi bölgelere girdiğini hesapla
        const inRegs = [];
        for (const [rName, rData] of Object.entries(BEYIN_BOLGELERI)) {
            const dx = x - rData.x;
            const dy = y - rData.y;
            const dz1 = z - rData.z;
            const dz2 = z - (-rData.z);
            const dist1 = Math.sqrt(dx*dx + dy*dy + dz1*dz1);
            const dist2 = Math.sqrt(dx*dx + dy*dy + dz2*dz2);
            if (dist1 <= rData.radius || dist2 <= rData.radius) {
                inRegs.push(rName);
            }
        }
        nodeRegions.push(inRegs);

        const scale = 0.026 + Math.random() * 0.042;
        nodeBaseScales.push(scale);

        dummy.position.set(x, y, z);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Dış çizgi (Outline) matrisi
        dummy.scale.set(scale * 1.3, scale * 1.3, scale * 1.3);
        dummy.updateMatrix();
        outlineMesh.setMatrixAt(i, dummy.matrix);

        instancedMesh.setColorAt(i, defaultWhite);
        i++;
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    outlineMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    brainGroup.add(outlineMesh);
    brainGroup.add(instancedMesh);

    // --- BAĞLANTILAR (AKSONLAR) ---
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x71717A, // Yumuşak nöral gri (koyu siyah yerine estetik gri)
        transparent: true,
        opacity: 0.40, // Dengeli ve net şeffaflık
        depthWrite: false
    });

    const linePositions = [];
    const maxDist = 0.95; 
    const maxConns = 10;

    for (let j = 0; j < nodes.length; j++) {
        let conns = 0;
        for (let k = j + 1; k < nodes.length; k++) {
            if (nodes[j].distanceTo(nodes[k]) < maxDist) {
                linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
                linePositions.push(nodes[k].x, nodes[k].y, nodes[k].z);
                conns++;
                if (conns >= maxConns) break;
            }
        }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMaterial);
    lines.renderOrder = 1;
    brainGroup.add(lines);

    // Tema durumuna göre çizgi ve hat tonunu dinamik uyarla
    function syncLineTheme() {
        const isDark = document.documentElement.classList.contains('dark-theme');
        lineMaterial.color.setHex(isDark ? 0x94A3B8 : 0x71717A);
        lineMaterial.opacity = isDark ? 0.35 : 0.40;
        outlineMaterial.color.setHex(isDark ? 0x383452 : 0x4B5563);
    }
    syncLineTheme();
    window.addEventListener('luminathemechange', syncLineTheme);

    outlineMesh.renderOrder = 2;
    instancedMesh.renderOrder = 3;

    // --- MODEL AKTİVASYONU & RENKLENDİRME ---
    let currentActiveModel = null;

    function activateModel(modelKey) {
        if (!modelKey) {
            resetModel();
            return;
        }
        currentActiveModel = modelKey;

        const config = MODEL_CONFIG[modelKey];
        if (!config) return;

        const activeColor = new THREE.Color(config.colorHex);
        const dimColor = new THREE.Color(0xD1D5DB); // Pasif nöronlar yumuşak gri

        for (let idx = 0; idx < nodeCount; idx++) {
            const isActivated = nodeRegions[idx].some(r => config.regions.includes(r));
            if (isActivated) {
                instancedMesh.setColorAt(idx, activeColor);
                nodeActiveState[idx] = 1;
            } else {
                instancedMesh.setColorAt(idx, dimColor);
                nodeActiveState[idx] = 0;
            }
        }
        if (instancedMesh.instanceColor) {
            instancedMesh.instanceColor.needsUpdate = true;
        }

        if (statusText) {
            statusText.innerHTML = `🧠 <strong>${config.name}</strong> Aktif`;
        }
        if (infoDot) {
            infoDot.style.backgroundColor = '#' + config.colorHex.toString(16).padStart(6, '0');
        }
        if (activeRegionsBadge) {
            activeRegionsBadge.style.display = 'block';
            activeRegionsBadge.innerHTML = `<span style="color:#71717A;font-size:10px;text-transform:uppercase;">Aktif Loblar & Ağlar:</span><br/><strong>${config.labelsText}</strong>`;
        }
    }

    function resetModel() {
        currentActiveModel = null;
        for (let idx = 0; idx < nodeCount; idx++) {
            instancedMesh.setColorAt(idx, defaultWhite);
            nodeActiveState[idx] = 0;
        }
        if (instancedMesh.instanceColor) {
            instancedMesh.instanceColor.needsUpdate = true;
        }

        if (statusText) {
            statusText.innerHTML = `🖱️ Kartların üzerine gel & aktifleşen lobları gör`;
        }
        if (infoDot) {
            infoDot.style.backgroundColor = '#10B981';
        }
        if (activeRegionsBadge) {
            activeRegionsBadge.style.display = 'none';
        }
    }

    // Window global fonksiyonları (Dashboard için)
    window.activateBrainModel = activateModel;
    window.resetBrainModel = resetModel;

    // Kart hover & click olaylarını bağla
    const cards = document.querySelectorAll('.service-model-card, .dashboard-score-card');
    cards.forEach(card => {
        const model = card.getAttribute('data-model');
        if (!model) return;

        card.addEventListener('mouseenter', () => activateModel(model));
        card.addEventListener('mouseleave', () => {
            const anyActive = document.querySelector('.service-model-card.is-active, .dashboard-score-card.is-active');
            if (anyActive) {
                activateModel(anyActive.getAttribute('data-model'));
            } else if (container.getAttribute('data-dominant-model')) {
                activateModel(container.getAttribute('data-dominant-model'));
            } else {
                resetModel();
            }
        });
        card.addEventListener('click', () => {
            const wasActive = card.classList.contains('is-active');
            cards.forEach(c => c.classList.remove('is-active'));
            if (!wasActive) {
                card.classList.add('is-active');
                activateModel(model);
            } else if (container.getAttribute('data-dominant-model')) {
                activateModel(container.getAttribute('data-dominant-model'));
            } else {
                resetModel();
            }
        });
    });

    // Açılışta baskın model varsa aktive et
    const dominantModel = container.getAttribute('data-dominant-model');
    if (dominantModel && MODEL_CONFIG[dominantModel]) {
        activateModel(dominantModel);
    }

    // Boyut güncellemesi
    function onResize() {
        const w = getWidth();
        const h = getHeight();
        if (w && h) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    }
    window.addEventListener('resize', onResize, false);
    if (window.ResizeObserver) {
        new ResizeObserver(onResize).observe(container);
    }

    // --- ANİMASYON DÖNGÜSÜ ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Genel yavaş dönüş ve süzülme
        brainGroup.rotation.y = t * 0.05;
        brainGroup.position.y = Math.sin(t * 0.5) * 0.2;

        // Nefes alma (Pulsing) animasyonu
        for (let idx = 0; idx < nodeCount; idx++) {
            const base = nodeBaseScales[idx];
            const isAct = nodeActiveState[idx] === 1;
            // Aktif bölgeler belirgin şekilde nabız atar
            const pScale = isAct 
                ? (base * 1.35 * (1 + Math.sin(t * 3.5 + idx) * 0.28))
                : (base * (1 + Math.sin(t * 2.0 + idx) * 0.2));

            dummy.position.copy(nodes[idx]);
            dummy.scale.set(pScale, pScale, pScale);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(idx, dummy.matrix);

            dummy.scale.set(pScale * 1.3, pScale * 1.3, pScale * 1.3);
            dummy.updateMatrix();
            outlineMesh.setMatrixAt(idx, dummy.matrix);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        outlineMesh.instanceMatrix.needsUpdate = true;

        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrain);
} else {
    initBrain();
}
