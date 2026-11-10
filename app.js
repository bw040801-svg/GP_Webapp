let scene, camera, cameraGroup, renderer, controls;cd
let activeTiles = {}; // Stores dynamically loaded terrain tiles
let raycaster, centerScreen;
let globalMeta;
let rockColors = {}; 
let geoWatchId = null;

let currentMode = null; 
let mapInstance = null;
let mapMarker = null;
let selectedLat = 22.3193, selectedLon = 114.1694;

let yawOffset = 0, pitchOffset = 0;
let isDragging = false, previousTouch = { x: 0, y: 0 };
let gpsSceneX = 0, gpsSceneZ = 0;

const GEOLOGY_DICT = {
    "Cmp": "Carboniferous Mai Po Member: mainly metasiltstone, metasandstone; graphite-bearing",
    "Cts": "Carboniferous Tai Shek Mo Member: mainly metasandstone with metaconglomerate and phyllite",
    "DBH": "Devonian Bluff Head Formation: mainly sandstone and siltstone",
    "EPC": "Eocene Ping Chau Formation: mainly dark grey thinly bedded siltstone and dolomitic siltstone",
    "JAC": "Jurassic Ap Lei Chau Formation: mainly fine ash vitric tuff",
    "JCB": "Jurassic Clear Water Bay Formation: mainly trachydacite and rhyolite lava",
    "JHI": "Jurassic High Island Formation: mainly fine ash tuff",
    "JLC": "Jurassic Lai Chi Chong Formation: mainly tuffite",
    "JLH": "Jurassic Long Harbour Formation: mainly coarse ash crystal tuff",
    "JLT": "Jurassic Lantau Formation: mainly rhyolite lava and tuff",
    "JMD": "Jurassic Mount Davis Formation: mainly coarse ash crystal tuff",
    "JMK": "Jurassic Mang Kung Uk Formation: mainly tuffaceous mudstone, siltstone and breccia",
    "JNM": "Jurassic Ngo Mei Chau Formation: mainly fine ash vitric welded tuff with lapilli tuff",
    "JSK": "Jurassic Sai Lau Kong Formation: mainly dacite lava with tuff, sandstone and siltstone",
    "JSM": "Jurassic Shing Mun Formation: mainly fine ash to coarse ash tuffs, tuff-breccia and tuffite",
    "JSS": "Jurassic Silverstrand Formation: mainly eutaxite",
    "JTC": "Jurassic Tolo Channel Formation: mainly mudstone and siltstone",
    "JTM": "Jurassic Tai Mo Shan Formation: mainly coarse ash crystal tuff",
    "JTS": "Jurassic Tsing Shan Formation: mainly sandstone, siltstone and mudstone with conglomerate and tuff",
    "JTU": "Jurassic Tuen Mun Formation: mainly andesite with tuff and tuffite",
    "JYT": "Jurassic Yim Tin Tsai Formation: mainly coarse ash crystal tuff",
    "Jcs": "Jurassic Cheung Shan Member, Lantau Formation: mainly eutaxite",
    "Jln": "Jurassic Lan Nai Wan Member: mainly tuffite and tuff",
    "Jmw": "Jurassic Tai Miu Wan Member: mainly trachydacite lava",
    "Jnl": "Jurassic Ngau Liu Member: mainly crystal and vitric tuff",
    "Jpk": "Jurassic Pak Kok Member: mainly siltstone, tuffite and tuff",
    "Jsl": "Jurassic Shek Lung Kung Member: mainly tuff breccia",
    "Jsp": "Jurassic Sunset Peak Member: mainly lapilli-ash crystal tuff",
    "Jtt": "Jurassic Tai Tun Member: mainly eutaxite",
    "KKO": "Cretaceous Kat O Formation: mainly calcareous breccia with conglomerate and coarse sandstone",
    "KPI": "Cretaceous Port Island Formation: mainly conglomerate and coarse sandstone with siltstone",
    "KPS": "Cretaceous Pat Sin Leng Formation: mainly sandstone and siltstone with conglomerate",
    "PTH": "Permian Tolo Harbour Formation: mainly mudstone, siltstone and sandstone",
    "a": "Andesite or andesite lava",
    "ap": "Aplite",
    "as": "Aegirine-bearing siltstone with dolomitic siltstone",
    "at": "Altered tuff and sedimentary rock",
    "az": "Zeolite-bearing siltstone with aegirine-bearing siltstone",
    "b": "Basalt",
    "bbt": "Block-bearing tuff",
    "br": "Sedimentary breccia",
    "bt": "Block-bearing tuff and tuffite",
    "ca": "Coarse ash tuff",
    "cat": "Coarse ash tuff",
    "cg": "Conglomerate",
    "cs": "Chert",
    "d": "Dacite",
    "dz": "Dolomitic siltstone with calcareous siltstone",
    "e": "Eutaxite",
    "fa": "Fine ash tuff",
    "gc": "Coarse-grained granite, grain size >6 mm",
    "gd": "Granodiorite",
    "gdf": "Fine-grained granodiorite, grain size <2 mm",
    "gdm": "Medium-grained granodiorite, grain size 2-6 mm",
    "gf": "Fine-grained granite, grain size <2 mm",
    "gfg": "Greisenised fine-grained granite",
    "gfm": "Fine- to medium-grained granite",
    "gm": "Medium-grained granite, grain size 2-6 mm",
    "gr": "Graphite schist or graphite bed",
    "l": "Lamprophyre",
    "lq": "Quartz latite",
    "lt": "Lapilli tuff",
    "m": "Mudstone",
    "mq": "Quartz monzonite",
    "p": "Pegmatite",
    "pQ": "Undifferentiated pre-Quaternary solid geology (offshore)",
    "q": "Quartz vein",
    "qz": "Quartzite",
    "r": "Rhyolite lava",
    "rdf": "Feldsparphyric rhyodacite",
    "rf": "Feldsparphyric rhyolite",
    "rh": "Rhyolite lava",
    "rq": "Quartzphyric rhyolite",
    "s": "Sandstone",
    "sl": "Siltstone",
    "sls": "Siltstone with sandstone",
    "sm": "Siltstone and dolomitic siltstone with mudstone",
    "sqf": "Fine-grained quartz syenite, grain size <2 mm",
    "sqm": "Medium-grained quartz syenite, grain size 2-6 mm",
    "ssl": "Sandstone and siltstone",
    "t": "Undifferentiated Tuff and tuffite",
    "ta": "Trachyte lava",
    "tb": "Tuff-breccia",
    "tbp": "Tuff-breccia and pyroclastic breccia",
    "tq": "Quartz trachyte",
    "tt": "Tuffite",
    "ug": "Microgranite",
    "v": "Vent material",
    "vt": "Vitric crystal tuff",
    "elm": "Holocene East Lamma Channel Member: mainly marine mud",
    "HHH": "Holocene Hang Hau Formation: undivided, mainly dark grey marine mud",
    "ms": "Holocene, marine sand, Hang Hau Formation",
    "msb": "Holocene, sand banks, Hang Hau Formation",
    "mss": "Holocene, sand sheets and channel infill, Hang Hau Formation",
    "PCK": "Pleistocene Chek Lap Kok Formation: undivided; clay, silt, sand and gravel",
    "Qa": "Quaternary, alluvium (undifferentiated)",
    "Qam": "Quaternary, estuarine deposits (undifferentiated)",
    "Qams": "Quaternary, estuarine mud and sand (undifferentiated)",
    "Qat": "Quaternary, terraced alluvium (undifferentiated)",
    "Qb": "Quaternary, beach deposits: mainly sand",
    "Qbb": "Quaternary, beach deposits: mainly cobbles and boulders",
    "Qbr": "Quaternary, beach deposits: mainly beach rock",
    "Qbs": "Quaternary, back shore deposits: mainly sand or gravel",
    "QCK": "Quaternary Chek Lap Kok Formation: mainly alluvium; some estuarine and marine deposits",
    "Qct": "Quaternary, channel and transgressive deposits",
    "Qd": "Quaternary, debris flow deposits (undifferentiated)",
    "Qdl": "Quaternary, slide deposits",
    "Qdt": "Quaternary, mixed debris flow and talus deposits",
    "QHH": "Quaternary Hang Hau Formation: mainly marine mud",
    "Qi": "Quaternary, estuarine deposits",
    "Qmm": "Quaternary, marine mud",
    "Qms": "Quaternary, marine sand",
    "Qpa": "Quaternary, Pleistocene, terraced alluvium",
    "Qpd": "Quaternary, Pleistocene, debris flow deposits",
    "Qrb": "Quaternary, raised beach deposits: mainly sand",
    "QSW": "Quaternary Sham Wat Formation: mainly estuarine and marine deposits",
    "Qt": "Quaternary, talus (rockfall) deposits",
    "tbm": "Holocene Telegraph Bay Member: mainly marine mud",
    "F": "Reclamation and Fill Bodies"
};

proj4.defs("EPSG:2326","+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs");

document.getElementById('btnLiveMode').addEventListener('click', startLiveMode);
document.getElementById('btnMapMode').addEventListener('click', openMapMode);
document.getElementById('confirmMapBtn').addEventListener('click', confirmMapLocation);

function generateColors(dictionary) {
    rockColors[0] = new THREE.Color("white"); 
    for (let id in dictionary) {
        const hue = (id * 137.508) % 360; 
        rockColors[id] = new THREE.Color(`hsl(${hue}, 70%, 50%)`);
    }
}

function openMapMode() {
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('mapScreen').style.display = 'block';
    
    if (!mapInstance) {
        mapInstance = L.map('leafletMap').setView([22.35, 114.12], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18, attribution: '© OpenStreetMap'
        }).addTo(mapInstance);

        mapInstance.on('click', function(e) {
            if (mapMarker) mapInstance.removeLayer(mapMarker);
            mapMarker = L.marker(e.latlng).addTo(mapInstance);
            selectedLat = e.latlng.lat;
            selectedLon = e.latlng.lng;
            document.getElementById('confirmMapBtn').style.display = 'block';
        });
    }
    setTimeout(() => mapInstance.invalidateSize(), 200);
}

async function confirmMapLocation() {
    currentMode = 'map';
    document.getElementById('mapScreen').style.display = 'none';
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        await DeviceOrientationEvent.requestPermission();
    }
    showUIElements();
    loadAppMetadata();
}

async function startLiveMode() {
    currentMode = 'live';
    document.getElementById('menuScreen').style.display = 'none';
    
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try { await DeviceMotionEvent.requestPermission(); } catch (e) { console.error(e); }
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById('cameraFeed');
        video.srcObject = stream;
        video.style.display = 'block';
    } catch (err) { console.error("Camera access denied", err); }
    
    showUIElements();
    loadAppMetadata();
}

function showUIElements() {
    document.getElementById('ui').style.display = 'block';
    document.getElementById('bottomSliders').style.display = 'block';
    document.getElementById('crosshair').style.display = 'block';
    document.getElementById('compassBox').style.display = 'block';
}

// Data Architecture Change: We only load metadata initially. Tiles are fetched on-demand.
async function loadAppMetadata() {
    document.getElementById('infoText').innerText = "Connecting to tile server...";
    globalMeta = await (await fetch('data/meta.json')).json();
    generateColors(globalMeta.rock_dictionary);
    initThreeJS();
}

function initThreeJS() {
    scene = new THREE.Scene();
    const initialDistance = parseInt(document.getElementById('viewDistance').value);
    scene.fog = new THREE.Fog(0x87CEEB, initialDistance * 0.5, initialDistance);
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, initialDistance);
    cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    document.body.appendChild(renderer.domElement);

    controls = new THREE.DeviceOrientationControls(camera);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(0, 5000, 0); 
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x666666));

    raycaster = new THREE.Raycaster();
    centerScreen = new THREE.Vector2(0, 0);

    const distSlider = document.getElementById('viewDistance');
    distSlider.addEventListener('input', (e) => document.getElementById('distVal').innerText = e.target.value);
    distSlider.addEventListener('change', (e) => {
        const dist = parseInt(e.target.value);
        camera.far = dist;
        camera.updateProjectionMatrix();
        scene.fog.near = dist * 0.5;
        scene.fog.far = dist;
        checkAndLoadTiles(dist);
    });

    const opSlider = document.getElementById('opacitySlider');
    opSlider.addEventListener('input', (e) => {
        const op = parseFloat(e.target.value);
        document.getElementById('opacityVal').innerText = op;
        // Update opacity across all currently loaded tiles
        for (let key in activeTiles) {
            if (activeTiles[key].isLoaded) {
                activeTiles[key].group.children[1].material.opacity = op;
            }
        }
    });

    // Invisible touch controls for calibration
    renderer.domElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousTouch.x = e.touches[0].clientX;
        previousTouch.y = e.touches[0].clientY;
    }, {passive: false});

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - previousTouch.x;
            const deltaY = e.touches[0].clientY - previousTouch.y;
            yawOffset += deltaX * 0.002;
            pitchOffset += deltaY * 0.002;
            cameraGroup.rotation.set(pitchOffset, yawOffset, 0, 'YXZ');
            previousTouch.x = e.touches[0].clientX;
            previousTouch.y = e.touches[0].clientY;
        }
    }, {passive: false});
    renderer.domElement.addEventListener('touchend', () => isDragging = false);

    window.addEventListener('resize', onWindowResize);

    if (currentMode === 'live') {
        startGPSWatcher(); 
    } else if (currentMode === 'map') {
        setCameraToLocation(selectedLat, selectedLon);
        document.getElementById('gpsText').innerText = "Mode: Virtual Map View";
    }
    
    animate();
}

async function setCameraToLocation(lat, lon) {
    const hk1980 = proj4("WGS84", "EPSG:2326", [lon, lat]);
    gpsSceneX = hk1980[0] - globalMeta.origin_x;
    gpsSceneZ = globalMeta.origin_y - hk1980[1];

    const dist = parseInt(document.getElementById('viewDistance').value);
    await checkAndLoadTiles(dist);

    const ground = sampleCell(gpsSceneX, gpsSceneZ);
    let gpsGroundElev = ground ? ground.elev : 20; 
    
    cameraGroup.position.set(gpsSceneX, gpsGroundElev + 2, gpsSceneZ);
}

function startGPSWatcher() {
    if (!navigator.geolocation) {
        document.getElementById('gpsText').innerText = "GPS not supported.";
        return;
    }
    document.getElementById('gpsText').innerText = "Acquiring GPS signal...";
    
    geoWatchId = navigator.geolocation.watchPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        if (lat > 50) { 
            lat = 22.411; lon = 114.124; 
            document.getElementById('gpsText').innerText = "GPS: Spoofed to HK (Tai Mo Shan)";
        } else {
            document.getElementById('gpsText').innerText = `GPS: Live (${position.coords.accuracy.toFixed(1)}m)`;
        }
        setCameraToLocation(lat, lon);
    }, (error) => {
        document.getElementById('gpsText').innerText = "GPS Signal Lost.";
    }, { enableHighAccuracy: true, maximumAge: 0 });
}

// ----------------- TILE MANAGER LOGIC -----------------
async function checkAndLoadTiles(distanceMeters) {
    const centerTr = Math.floor(gpsSceneZ / (globalMeta.tile_size * globalMeta.resolution));
    const centerTc = Math.floor(gpsSceneX / (globalMeta.tile_size * globalMeta.resolution));
    
    const radiusTiles = Math.ceil(distanceMeters / (globalMeta.tile_size * globalMeta.resolution));
    const requiredTiles = new Set();
    
    for (let r = centerTr - radiusTiles; r <= centerTr + radiusTiles; r++) {
        for (let c = centerTc - radiusTiles; c <= centerTc + radiusTiles; c++) {
            const tileStr = `${r}_${c}`;
            if (globalMeta.valid_tiles.includes(tileStr)) {
                requiredTiles.add(tileStr);
            }
        }
    }

    // Unload distant tiles
    for (let key in activeTiles) {
        if (!requiredTiles.has(key)) {
            if (activeTiles[key].isLoaded) {
                scene.remove(activeTiles[key].group);
                activeTiles[key].group.children.forEach(child => {
                    child.geometry.dispose();
                    child.material.dispose();
                });
            }
            delete activeTiles[key];
        }
    }

    // Load newly required tiles
    const loadPromises = [];
    for (let key of requiredTiles) {
        if (!activeTiles[key]) {
            activeTiles[key] = { isLoaded: false };
            loadPromises.push(loadTileData(key));
        }
    }
    
    await Promise.all(loadPromises);
}

async function loadTileData(key) {
    try {
        const [demRes, lithRes] = await Promise.all([
            fetch(`data/dem_${key}.bin`),
            fetch(`data/lith_${key}.bin`)
        ]);

        if (!demRes.ok || !lithRes.ok) return;

        const demBuffer = new Float32Array(await demRes.arrayBuffer());
        const lithBuffer = new Uint8Array(await lithRes.arrayBuffer());

        const [tr, tc] = key.split('_').map(Number);
        
        const startCol = tc * globalMeta.tile_size;
        const startRow = tr * globalMeta.tile_size;
        const endCol = Math.min(startCol + globalMeta.tile_size, globalMeta.cols);
        const endRow = Math.min(startRow + globalMeta.tile_size, globalMeta.rows);
        const cols = endCol - startCol;
        const rows = endRow - startRow;

        const STRIDE = 4;   // 1 = 5 m mesh, 2 = 10 m, 4 = 20 m, 8 = 40 m
	const res = globalMeta.resolution, nodata = globalMeta.nodata;
	const nx = Math.ceil(cols / STRIDE), ny = Math.ceil(rows / STRIDE);
	const geometry = new THREE.PlaneGeometry(cols * res, rows * res, nx - 1, ny - 1);
	geometry.deleteAttribute('normal');
	geometry.deleteAttribute('uv');
	const pos = geometry.attributes.position.array;
	const colors = new Float32Array(nx * ny * 3);
	let v = 0;
	for (let r = 0; r < ny; r++) {
	    for (let c = 0; c < nx; c++, v++) {
	        const i = Math.min(r * STRIDE, rows - 1) * cols + Math.min(c * STRIDE, cols - 1);
        	pos[v * 3 + 2] = demBuffer[i] < -500 ? 0 : demBuffer[i];
	        const col = rockColors[lithBuffer[i]] || rockColors[0];
	        colors[v * 3] = col.r; colors[v * 3 + 1] = col.g; colors[v * 3 + 2] = col.b;
	    }
	}
	geometry.attributes.position.needsUpdate = true;
	geometry.computeBoundingSphere();
        
        const chunkCenterX = startCol * globalMeta.resolution + (cols * globalMeta.resolution) / 2;
        const chunkCenterZ = startRow * globalMeta.resolution + (rows * globalMeta.resolution) / 2;
        geometry.translate(chunkCenterX, 0, chunkCenterZ);

        const currentOpacity = parseFloat(document.getElementById('opacitySlider').value);
        
        const occluderMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true });
        const occluderMesh = new THREE.Mesh(geometry, occluderMat);
        occluderMesh.renderOrder = 0;

	const colorMat = new THREE.MeshBasicMaterial({
	    vertexColors: true, side: THREE.DoubleSide,
	    transparent: true, opacity: currentOpacity, depthWrite: false,
	    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
	});
        const colorMesh = new THREE.Mesh(geometry, colorMat);
        colorMesh.renderOrder = 1;
        
        // Embed the binary array directly into the mesh so the raycaster can read it later!
        colorMesh.userData = { lithBuffer: lithBuffer, startCol: startCol, startRow: startRow, cols: cols };

        const group = new THREE.Group();
        group.add(occluderMesh);
        group.add(colorMesh);
        scene.add(group);
        
        activeTiles[key] = { isLoaded: true, group: group, dem: demBuffer, lith: lithBuffer, cols: cols, rows: rows };
        document.getElementById('infoText').innerHTML = `Tiles active: ${Object.keys(activeTiles).length}`;
    } catch(e) {
        console.error("Failed to load tile", key, e);
    }
}

function sampleCell(x, z) {
    const res = globalMeta.resolution, ts = globalMeta.tile_size;
    const col = Math.floor(x / res), row = Math.floor(z / res);
    const tc = Math.floor(col / ts), tr = Math.floor(row / ts);
    const tile = activeTiles[`${tr}_${tc}`];
    if (!tile || !tile.isLoaded) return null;
    const i = (row - tr * ts) * tile.cols + (col - tc * ts);
    const e = tile.dem[i];
    return { elev: e < -500 ? 0 : e, rock: tile.lith[i] };
}

function pickCentreRay() {
    const origin = new THREE.Vector3(), dir = new THREE.Vector3();
    camera.getWorldPosition(origin);
    camera.getWorldDirection(dir);
    const step = globalMeta.resolution;
    for (let t = step; t < camera.far; t += step) {
        const x = origin.x + dir.x * t, y = origin.y + dir.y * t, z = origin.z + dir.z * t;
        if (dir.y > 0 && y > 1000) break;          // pointing at the sky
        const cell = sampleCell(x, z);
        if (cell && y <= cell.elev) return { x, y, z, rock: cell.rock };
    }
    return null;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCompass() {
    let dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    let heading = Math.atan2(dir.x, -dir.z) * (180 / Math.PI);
    if (heading < 0) heading += 360;
    
    let card = "N";
    if (heading > 22.5 && heading <= 67.5) card = "NE";
    else if (heading > 67.5 && heading <= 112.5) card = "E";
    else if (heading > 112.5 && heading <= 157.5) card = "SE";
    else if (heading > 157.5 && heading <= 202.5) card = "S";
    else if (heading > 202.5 && heading <= 247.5) card = "SW";
    else if (heading > 247.5 && heading <= 292.5) card = "W";
    else if (heading > 292.5 && heading <= 337.5) card = "NW";
    
    document.getElementById('compassBox').innerText = `${Math.round(heading)}° ${card}`;
}

function updateRaycaster() {
    const hit = pickCentreRay();
    const expBox = document.getElementById('explanationBox');
    if (!hit) {
        expBox.style.display = 'none';
        document.getElementById('infoText').innerHTML = "Aim at terrain...";
        return;
    }
    const rockCode = globalMeta.rock_dictionary[hit.rock] || "";
    const easting = globalMeta.origin_x + hit.x;
    const northing = globalMeta.origin_y - hit.z;
    document.getElementById('infoText').innerHTML =
        `<b>Target Locked:</b><br><span style="color:#00ff00; font-weight:bold;">Code: ${rockCode}</span><br>` +
        `Elev: ~${Math.round(hit.y)} m<br>` +
        `<span style="font-size: 0.85em; color: #ccc;">HK1980: E ${Math.round(easting)}, N ${Math.round(northing)}</span>`;
    expBox.style.display = 'block';
    expBox.innerHTML = GEOLOGY_DICT[rockCode] || "Unmapped";
}

let lastHud = 0, frames = 0, fpsStart = 0;
function animate(now = 0) {
    requestAnimationFrame(animate);
    controls.update();
    frames++;
    if (now - fpsStart >= 1000) {
        document.getElementById('fpsText').innerText = frames + " fps";
        frames = 0; fpsStart = now;
    }
    if (now - lastHud > 150) { lastHud = now; updateCompass(); updateRaycaster(); }
    renderer.render(scene, camera);
}