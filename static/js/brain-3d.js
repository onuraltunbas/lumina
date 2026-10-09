// 3D Interactive Neural Brain for Lumina Studio
// Connects with the 5 Learning Styles cards on hover/click and in the user Dashboard

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// BEYIN BÖLGELERİ VE KOORDİNAT TANIMLARI
const BEYIN_BOLGELERI = {
    OksipitalLob: { cx: 0.8, cy: -0.2, cz: 0.0, radius: 0.35 },
    GorselKorteksV1: { cx: 0.95, cy: -0.3, cz: 0.0, radius: 0.20 },
    VentralGorselYol: { cx: 0.5, cy: -0.5, cz: 0.25, radius: 0.30 },
    DorsalGorselYol: { cx: 0.4, cy: 0.4, cz: 0.25, radius: 0.30 },
    ParietalLob: { cx: 0.2, cy: 0.6, cz: 0.0, radius: 0.40 },
    TemporalLob: { cx: -0.1, cy: -0.4, cz: 0.45, radius: 0.40 },
    Hipokampus: { cx: -0.1, cy: -0.4, cz: 0.20, radius: 0.20 },
    PrefrontalKorteks: { cx: -0.7, cy: 0.3, cz: 0.0, radius: 0.45 },
    IsitselKorteks: { cx: -0.1, cy: -0.1, cz: 0.55, radius: 0.20 },
    UstTemporalGirus: { cx: -0.1, cy: -0.1, cz: 0.45, radius: 0.25 },
    FrontalDilAglari: { cx: -0.6, cy: 0.1, cz: 0.35, radius: 0.30 },
    MotorKorteks: { cx: -0.3, cy: 0.7, cz: 0.0, radius: 0.40 },
    Beyincik: { cx: 0.6, cy: -0.7, cz: 0.0, radius: 0.35 },
    BazalGangliyonlar: { cx: 0.0, cy: -0.1, cz: 0.0, radius: 0.20 },
    Amigdala: { cx: -0.2, cy: -0.4, cz: 0.15, radius: 0.15 },
    GorselKelimeBicimiAlani: { cx: 0.3, cy: -0.5, cz: 0.4, radius: 0.20 }
};

// 5 ÖĞRENME MODELİNİN BEYİN BÖLGELERİ EŞLEŞTİRMESİ
const MODEL_CONFIG = {
    gorsel: {
        name: "Görsel Öğrenme (Visual)",
        colorHex: 0xA855F7, // Mor / Purple
        regions: ['OksipitalLob', 'GorselKorteksV1', 'VentralGorselYol', 'DorsalGorselYol', 'ParietalLob', 'TemporalLob', 'Hipokampus', 'PrefrontalKorteks'],
        labelsText: "Oksipital Lob, Görsel Korteks (V1), Ventral & Dorsal Yol, Hipokampus"
    },
    isitsel: {
        name: "İşitsel Öğrenme (Auditory)",
        colorHex: 0x10B981, // Canlı Yeşil / Green
        regions: ['IsitselKorteks', 'TemporalLob', 'UstTemporalGirus', 'FrontalDilAglari', 'PrefrontalKorteks', 'ParietalLob', 'Hipokampus'],
        labelsText: "İşitsel Korteks, Üst Temporal Girus, Dil Ağları, Prefrontal Korteks"
    },
    yazarak: {
        name: "Yazarak Öğrenme (Writing)",
        colorHex: 0xEC4899, // Pembe / Pink
        regions: ['PrefrontalKorteks', 'MotorKorteks', 'ParietalLob', 'FrontalDilAglari', 'TemporalLob', 'Beyincik', 'Hipokampus'],
        labelsText: "Motor Korteks, Prefrontal Korteks, Dil Ağları, Beyincik"
    },
    okuyarak: {
        name: "Okuyarak Öğrenme (Reading)",
        colorHex: 0x0284C7, // Elektrik Mavi / Blue
        regions: ['OksipitalLob', 'GorselKelimeBicimiAlani', 'TemporalLob', 'FrontalDilAglari', 'PrefrontalKorteks', 'Hipokampus'],
        labelsText: "Görsel Kelime Biçimi Alanı, Oksipital Lob, Dil Ağları, Hipokampus"
    },
    deneyimsel: {
        name: "Deneyimsel Öğrenme (Experiential)",
        colorHex: 0xF59E0B, // Kehribar Sarı / Yellow-Amber
        regions: ['MotorKorteks', 'Beyincik', 'BazalGangliyonlar', 'Hipokampus', 'PrefrontalKorteks', 'ParietalLob', 'Amigdala'],
        labelsText: "Motor Korteks, Beyincik, Bazal Gangliyonlar, Amigdala, Hipokampus"
    }
};

function initBrain() {
    const container = document.getElementById('brain-3d-container');
    if (!container) return;

    const statusText = document.getElementById('brain-status-text');
    const infoDot = document.querySelector('.brain-info-dot');
    const activeRegionsBadge = document.getElementById('brain-active-regions-badge');

    const scene = new THREE.Scene();

    const getWidth = () => container.clientWidth || 550;
    const getHeight = () => container.clientHeight || 580;

    const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 1, 1000);
    camera.position.set(-52, 14, 0); // Lateral bakış açısı

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(getWidth(), getHeight());
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(-20, 30, 20);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xaaccff, 1.2);
    fillLight.position.set(20, -10, -20);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0; 
    controls.minDistance = 20;
    controls.maxDistance = 150;

    // NÖRAL BEYİN GEOMETRİSİ ÜRETİMİ
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    const R_BASE = 14.5;
    const TOTAL_NEURONS = 1150;
    const neuronsRaw = [];

    // Gerçekçi beyin lobu dış sınır fonksiyonu
    function getBrainBoundary(theta, phi) {
        let r = R_BASE;
        r += 1.8 * Math.cos(2 * phi);
        r += 1.2 * Math.cos(4 * theta);
        const yNorm = Math.cos(phi);
        const xNorm = Math.sin(phi) * Math.cos(theta);
        const zNorm = Math.sin(phi) * Math.sin(theta);

        if (yNorm < -0.2 && xNorm > 0.1) {
            r += 1.5 * Math.sin((yNorm + 0.2) * Math.PI);
        }
        if (xNorm < -0.3 && yNorm > -0.1) {
            r += 1.4 * Math.cos(xNorm * Math.PI);
        }
        return r;
    }

    const tempRegions = Object.entries(BEYIN_BOLGELERI).map(([name, conf]) => ({
        name,
        center: new THREE.Vector3(conf.cx * R_BASE, conf.cy * R_BASE, conf.cz * R_BASE),
        radiusSq: (conf.radius * R_BASE) * (conf.radius * R_BASE)
    }));

    for (let i = 0; i < TOTAL_NEURONS; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const maxR = getBrainBoundary(theta, phi);
        const u = Math.pow(Math.random(), 0.65);
        const r = maxR * (0.28 + 0.72 * u);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        let z = r * Math.sin(phi) * Math.sin(theta);

        const hemisphere = (i % 2 === 0) ? 1 : -1;
        const zGap = 0.8;
        z = hemisphere * (Math.abs(z) * 0.78 + zGap);

        neuronsRaw.push({
            pos: new THREE.Vector3(x, y, z),
            index: i
        });
    }

    // Nöron Düğümleri (InstancedMesh)
    const sphereGeom = new THREE.SphereGeometry(1, 10, 10);
    const innerMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.35,
        metalness: 0.15,
        vertexColors: true
    });

    const outlineGeom = new THREE.SphereGeometry(1, 8, 8);
    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x1D1D1D,
        side: THREE.BackSide
    });

    const innerMesh = new THREE.InstancedMesh(sphereGeom, innerMaterial, TOTAL_NEURONS);
    const outlineMesh = new THREE.InstancedMesh(outlineGeom, outlineMaterial, TOTAL_NEURONS);

    const dummy = new THREE.Object3D();
    const defaultColor = new THREE.Color(0xffffff);
    const whiteColor = new THREE.Color(0xffffff);
    const tempGlowColor = new THREE.Color();
    const nodesData = [];
    const neuronRegions = [];

    for (let i = 0; i < TOTAL_NEURONS; i++) {
        const data = neuronsRaw[i];
        
        dummy.position.copy(data.pos);
        dummy.scale.setScalar(0.1);
        dummy.updateMatrix();
        innerMesh.setMatrixAt(i, dummy.matrix);
        outlineMesh.setMatrixAt(i, dummy.matrix);

        const inRegs = [];
        for (const reg of tempRegions) {
            const symCenter = reg.center.clone();
            symCenter.z = Math.sign(data.pos.z) * Math.abs(symCenter.z);
            if (data.pos.distanceToSquared(symCenter) < reg.radiusSq) {
                inRegs.push(reg.name);
            }
        }
        neuronRegions.push(inRegs);

        const nodeRadius = 0.05 + Math.random() * 0.15;
        innerMesh.setColorAt(i, defaultColor);
        
        nodesData.push({
            position: data.pos,
            baseScale: nodeRadius,
            currentMultiplier: 1.0,
            targetMultiplier: 1.0,
            pulseSpeed: 2 + Math.random() * 4,
            pulsePhase: Math.random() * Math.PI * 2,
            activePulse: false,
            baseColor: null
        });
    }
    
    innerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    outlineMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    brainGroup.add(innerMesh);
    brainGroup.add(outlineMesh);

    // Sinirsel bağlantı çizgileri (çizgi roman tarzı koyu konturlar)
    const maxConnectDistance = 2.5; 
    const maxConnectionsPerNeuron = 10;
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x1D1D1D, 
        transparent: true, 
        opacity: 0.5 
    });
    
    const linePoints = [];

    for (let i = 0; i < neuronsRaw.length; i++) {
        let connectionCount = 0;
        const neighbors = [];
        for (let j = 0; j < neuronsRaw.length; j++) {
            if(i !== j) {
                const dist = neuronsRaw[i].pos.distanceTo(neuronsRaw[j].pos);
                if(dist < maxConnectDistance) {
                    neighbors.push({index: j, distance: dist});
                }
            }
        }
        neighbors.sort((a, b) => a.distance - b.distance);

        for(let n=0; n<neighbors.length; n++) {
            if(i < neighbors[n].index) {
                linePoints.push(neuronsRaw[i].pos);
                linePoints.push(neuronsRaw[neighbors[n].index].pos);
            }
            connectionCount++;
            if (connectionCount >= maxConnectionsPerNeuron) break;
        }
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    brainGroup.add(lineSegments);

    // KART ETKİLEŞİMİ (AKTİF BÖLGELERİ VURGULAMA & YANIP SÖNME)
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

        for (let i = 0; i < neuronsRaw.length; i++) {
            const isActivated = neuronRegions[i].some(r => config.regions.includes(r));
            if (isActivated) {
                innerMesh.setColorAt(i, activeColor);
                nodesData[i].targetMultiplier = 1.75;
                nodesData[i].activePulse = true;
                nodesData[i].baseColor = activeColor.clone();
            } else {
                innerMesh.setColorAt(i, dimColor);
                nodesData[i].targetMultiplier = 0.8;
                nodesData[i].activePulse = false;
                nodesData[i].baseColor = null;
            }
        }
        if (innerMesh.instanceColor) {
            innerMesh.instanceColor.needsUpdate = true;
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

        for (let i = 0; i < neuronsRaw.length; i++) {
            innerMesh.setColorAt(i, whiteColor);
            nodesData[i].targetMultiplier = 1.0;
            nodesData[i].activePulse = false;
            nodesData[i].baseColor = null;
        }
        if (innerMesh.instanceColor) {
            innerMesh.instanceColor.needsUpdate = true;
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

    // Dışarıya metodları aç (Dashboard ve dinamik tetiklemeler için)
    window.activateBrainModel = activateModel;
    window.resetBrainModel = resetModel;

    // Kart hover & click olaylarını bağla (Hem ana sayfa hem de dashboard kartları)
    const cards = document.querySelectorAll('.service-model-card, .dashboard-score-card');
    cards.forEach(card => {
        const model = card.getAttribute('data-model');
        if (!model) return;

        card.addEventListener('mouseenter', () => {
            activateModel(model);
        });
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

    // Sayfa açılışında baskın model varsa otomatik aktive et
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

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        let colorNeedsUpdate = false;
        
        for(let i = 0; i < nodesData.length; i++) {
            const node = nodesData[i];
            
            // Hedef boyuta yumuşak geçiş
            node.currentMultiplier += (node.targetMultiplier - node.currentMultiplier) * 0.12;
            
            // Aktif bölgeler daha canlı nabız ve renk parıltısı ile yanıp söner
            const pulseAmp = node.activePulse ? 0.35 : 0.14;
            const pulseSpeed = node.activePulse ? (node.pulseSpeed * 1.8) : node.pulseSpeed;
            const pulse = Math.sin(elapsedTime * pulseSpeed + node.pulsePhase) * pulseAmp;
            
            const currentScale = node.baseScale * node.currentMultiplier * (1.0 + pulse);
            
            dummy.position.copy(node.position);
            dummy.scale.setScalar(currentScale);
            dummy.updateMatrix();
            innerMesh.setMatrixAt(i, dummy.matrix);
            
            // Dış çizgi roman konturu
            dummy.scale.setScalar(currentScale + 0.026); 
            dummy.updateMatrix();
            outlineMesh.setMatrixAt(i, dummy.matrix);

            // Yanıp sönen renk parıltısı (renkli renkli neon efekti)
            if (node.activePulse && node.baseColor) {
                const glowFactor = (Math.sin(elapsedTime * 4.5 + node.pulsePhase) + 1.0) * 0.5;
                tempGlowColor.copy(node.baseColor).lerp(whiteColor, glowFactor * 0.42);
                innerMesh.setColorAt(i, tempGlowColor);
                colorNeedsUpdate = true;
            }
        }
        
        innerMesh.instanceMatrix.needsUpdate = true;
        outlineMesh.instanceMatrix.needsUpdate = true;

        if (colorNeedsUpdate && innerMesh.instanceColor) {
            innerMesh.instanceColor.needsUpdate = true;
        }
        
        // Beyin yüzme (bobbing) efekti
        brainGroup.position.y = Math.sin(elapsedTime * 2.0) * 1.4;
        const squish = 1.0 + Math.sin(elapsedTime * 4.0) * 0.015;
        brainGroup.scale.set(1.0, squish, 1.0);
        
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
