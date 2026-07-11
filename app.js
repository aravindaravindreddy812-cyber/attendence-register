/**
 * VisionPass AI Attendance Portal - Main Application Logic
 * Clean, Robust, and Fail-Safe Client-Side Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. DEFAULT DATA CONFIGURATIONS
    // ----------------------------------------------------
    const DEFAULT_USERS = [
        {
            id: "EMP-2041",
            name: "Sarah Jenkins",
            department: "Engineering",
            role: "Staff",
            createdDate: "2026-07-01",
            photoDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%2300f2fe'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%2300f2fe'/></svg>"
        },
        {
            id: "EMP-2042",
            name: "David Chen",
            department: "Product",
            role: "Staff",
            createdDate: "2026-07-03",
            photoDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%239d4edd'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%239d4edd'/></svg>"
        },
        {
            id: "EMP-2043",
            name: "Elena Rostova",
            department: "Design",
            role: "Staff",
            createdDate: "2026-07-04",
            photoDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%233b82f6'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%233b82f6'/></svg>"
        },
        {
            id: "EMP-2044",
            name: "Marcus Vance",
            department: "Marketing",
            role: "Staff",
            createdDate: "2026-07-05",
            photoDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%23ef4444'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%23ef4444'/></svg>"
        }
    ];

    const DEFAULT_LOGS = [
        {
            logId: "LOG-001",
            userId: "EMP-2041",
            userName: "Sarah Jenkins",
            userPhoto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%2300f2fe'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%2300f2fe'/></svg>",
            department: "Engineering",
            timestamp: new Date().getTime() - 3600000 * 5,
            date: getTodayDateString(),
            time: "08:48:12",
            status: "Present"
        },
        {
            logId: "LOG-002",
            userId: "EMP-2042",
            userName: "David Chen",
            userPhoto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%239d4edd'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%239d4edd'/></svg>",
            department: "Product",
            timestamp: new Date().getTime() - 3600000 * 4,
            date: getTodayDateString(),
            time: "08:55:34",
            status: "Present"
        },
        {
            logId: "LOG-003",
            userId: "EMP-2043",
            userName: "Elena Rostova",
            userPhoto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%233b82f6'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%233b82f6'/></svg>",
            department: "Design",
            timestamp: new Date().getTime() - 3600000 * 3,
            date: getTodayDateString(),
            time: "09:08:44",
            status: "Present"
        },
        {
            logId: "LOG-004",
            userId: "EMP-2044",
            userName: "Marcus Vance",
            userPhoto: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='%23ef4444'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='%23ef4444'/></svg>",
            department: "Marketing",
            timestamp: new Date().getTime() - 3600000 * 2,
            date: getTodayDateString(),
            time: "09:21:05",
            status: "Late"
        }
    ];

    // LocalStorage database configuration
    let db = {
        users: JSON.parse(localStorage.getItem('vp_users')) || [],
        logs: JSON.parse(localStorage.getItem('vp_logs')) || [],
        settings: JSON.parse(localStorage.getItem('vp_settings')) || {
            shiftStart: "09:00",
            lateStart: "09:15",
            matchLatency: 3,
            matchAccuracy: 94,
            autoScan: true
        }
    };

    // If completely empty, seed data
    if (db.users.length === 0) {
        db.users = [...DEFAULT_USERS];
        db.logs = [...DEFAULT_LOGS];
        saveDatabase();
    }

    // ----------------------------------------------------
    // 2. STATE AND ENGINE PARAMETERS
    // ----------------------------------------------------
    let activeCameraStream = null;
    let registerCameraStream = null;
    
    let isVirtualCameraActive = false;
    let isRegisterVirtualCamActive = false;
    let virtualScannerCanvas = null;
    let virtualScannerStream = null;
    
    let virtualCamAnimationId = null;
    let registerVirtualCamAnimationId = null;
    let scannerOverlayAnimationId = null;

    let isScanning = false;
    let scanTimeoutId = null;
    let simulatedMatchTimeoutId = null;
    let weeklyChartInstance = null;
    let liveScanIntervalId = null;
    let isProcessingLiveScan = false;

    // Bounding Box simulation coordinates
    let faceX = 150;
    let faceY = 100;
    let faceW = 180;
    let faceH = 180;
    let vx = 1.2;
    let vy = 0.8;

    // ----------------------------------------------------
    // 3. CORE INITIALIZER
    // ----------------------------------------------------
    initApp();

    function initApp() {
        safeCreateIcons();
        try { initNavigation(); } catch (e) { console.error('Navigation init failed', e); }
        try { initDashboard(); } catch (e) { console.error('Dashboard init failed', e); }
        try { initUsersDirectory(); } catch (e) { console.error('Users directory init failed', e); }
        try { initLogsTab(); } catch (e) { console.error('Logs init failed', e); }
        try { initSettingsTab(); } catch (e) { console.error('Settings init failed', e); }
        try { initRegistrationModal(); } catch (e) { console.error('Registration modal init failed', e); }
        try { initScannerPage(); } catch (e) { console.error('Scanner page init failed', e); }
        
        window.addEventListener('resize', () => {
            adjustScannerCanvasSize();
        });
    }

    function safeCreateIcons() {
        if (window.lucide) {
            try {
                lucide.createIcons();
            } catch (e) {
                console.error("Lucide icon generation failed:", e);
            }
        }
    }

    function saveDatabase() {
        localStorage.setItem('vp_users', JSON.stringify(db.users));
        localStorage.setItem('vp_logs', JSON.stringify(db.logs));
        localStorage.setItem('vp_settings', JSON.stringify(db.settings));
    }

    function getTodayDateString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function formatTime(d) {
        return d.toTimeString().split(' ')[0];
    }

    // ----------------------------------------------------
    // 4. NAVIGATION / ROUTER
    // ----------------------------------------------------
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const panels = document.querySelectorAll('.panel');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = item.getAttribute('data-tab');
                
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                panels.forEach(p => {
                    p.classList.remove('active');
                    if (p.id === targetTab) {
                        p.classList.add('active');
                    }
                });

                // Page triggers
                if (targetTab === 'dashboard') {
                    refreshDashboardMetrics();
                    renderChart();
                } else if (targetTab === 'users') {
                    renderUsersGrid(db.users);
                } else if (targetTab === 'logs') {
                    renderLogsTable(db.logs);
                } else if (targetTab === 'scanner') {
                    adjustScannerCanvasSize();
                }

                // Shutdown active streams if moving away from portal
                if (targetTab !== 'scanner') {
                    stopScannerWebcam();
                }
            });
        });
    }

    // ----------------------------------------------------
    // 5. DASHBOARD CONTROLLER
    // ----------------------------------------------------
    function initDashboard() {
        refreshDashboardMetrics();
        renderChart();
    }

    function refreshDashboardMetrics() {
        const todayDate = getTodayDateString();
        const checkedInToday = db.logs.filter(log => log.date === todayDate);
        const presentCount = checkedInToday.filter(log => log.status === 'Present').length;
        const lateCount = checkedInToday.filter(log => log.status === 'Late').length;
        const absentCount = Math.max(0, db.users.length - (presentCount + lateCount));

        document.getElementById('stat-total-users').innerText = db.users.length;
        document.getElementById('stat-present').innerText = presentCount;
        document.getElementById('stat-late').innerText = lateCount;
        document.getElementById('stat-absent').innerText = absentCount;

        renderDashboardFeed(checkedInToday);
    }

    function renderDashboardFeed(todayLogs) {
        const feedList = document.getElementById('dashboard-feed-list');
        feedList.innerHTML = '';

        if (todayLogs.length === 0) {
            feedList.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); margin-top: 4rem;">
                    No check-ins logged today.
                </div>`;
            return;
        }

        const sortedLogs = [...todayLogs].sort((a, b) => b.timestamp - a.timestamp);

        sortedLogs.forEach(log => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-item';

            const avatarMarkup = log.userPhoto 
                ? `<img src="${log.userPhoto}" alt="${log.userName}" class="feed-avatar">`
                : `<div class="feed-avatar-placeholder">${log.userName.charAt(0)}</div>`;

            const statusClass = log.status === 'Present' ? 'status-present' : 'status-late';

            feedItem.innerHTML = `
                ${avatarMarkup}
                <div class="feed-info">
                    <div class="feed-name">${log.userName}</div>
                    <div class="feed-time">${log.time} &bull; ${log.department}</div>
                </div>
                <div class="feed-status ${statusClass}">${log.status}</div>
            `;
            feedList.appendChild(feedItem);
        });
    }

    function renderChart() {
        const chartCanvas = document.getElementById('weeklyChart');
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        const days = [];
        const presentData = [];
        const lateData = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            days.push(dateStr);

            const targetDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dayLogs = db.logs.filter(log => log.date === targetDateStr);
            
            presentData.push(dayLogs.filter(log => log.status === 'Present').length);
            lateData.push(dayLogs.filter(log => log.status === 'Late').length);
        }

        if (weeklyChartInstance) {
            weeklyChartInstance.destroy();
        }

        if (!window.Chart) {
            document.querySelector('.chart-container').innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);font-size:0.95rem;text-align:center;padding:2rem;">
                    <i data-lucide="wifi-off" style="width:36px;height:36px;color:var(--text-muted);margin-bottom:0.5rem;"></i>
                    <span>Analytics Chart Area</span>
                    <span style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">(Connect to internet for dynamic Chart.js graphing)</span>
                </div>
            `;
            safeCreateIcons();
            return;
        }

        const gradientPresent = ctx.createLinearGradient(0, 0, 0, 300);
        gradientPresent.addColorStop(0, '#00f2fe');
        gradientPresent.addColorStop(1, 'rgba(0, 242, 254, 0.05)');

        const gradientLate = ctx.createLinearGradient(0, 0, 0, 300);
        gradientLate.addColorStop(0, '#9d4edd');
        gradientLate.addColorStop(1, 'rgba(157, 78, 221, 0.05)');

        weeklyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Present',
                        data: presentData,
                        backgroundColor: gradientPresent,
                        borderColor: '#00f2fe',
                        borderWidth: 1.5,
                        borderRadius: 6
                    },
                    {
                        label: 'Late',
                        data: lateData,
                        backgroundColor: gradientLate,
                        borderColor: '#9d4edd',
                        borderWidth: 1.5,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Outfit' } } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', font: { family: 'Outfit' }, stepSize: 1 } }
                }
            }
        });
    }

    // ----------------------------------------------------
    // 6. FACIAL RECOGNITION SCANNER PORTAL
    // ----------------------------------------------------
    const webcamVideo = document.getElementById('webcam-video');
    const trackerCanvas = document.getElementById('tracker-canvas');
    const trackerCtx = trackerCanvas.getContext('2d');
    const btnToggleCamera = document.getElementById('btn-toggle-camera');
    const btnSimulateMatch = document.getElementById('btn-simulate-match');
    const btnStartSimulator = document.getElementById('btn-start-simulator');
    const btnEnrollFromScanner = document.getElementById('btn-enroll-from-scanner');
    const btnUploadPhoto = document.getElementById('btn-upload-photo');
    const btnScanUpload = document.getElementById('btn-scan-upload');
    const scannerPhotoUpload = document.getElementById('scanner-photo-upload');
    const scannerLiveToggle = document.getElementById('setting-live-scan');
    const scannerView = document.getElementById('scanner-view');
    const scannerPlaceholder = document.getElementById('scanner-placeholder');
    const scannerBanner = document.getElementById('scanner-banner');
    const scannerBannerText = document.getElementById('scanner-banner-text');
    const faceGuide = document.getElementById('face-guide');
    const scanBox = document.getElementById('scan-box');
    const scanLabel = document.getElementById('scan-label');
    const scannerLogEl = document.getElementById('scanner-log');
    let scannerUploadDataUrl = null;
    let scannerCurrentFrameDataUrl = null;

    function initScannerPage() {
        btnToggleCamera.addEventListener('click', toggleCameraScanner);
        btnSimulateMatch.addEventListener('click', manualSimulateMatch);
        if (btnStartSimulator) btnStartSimulator.addEventListener('click', () => {
            startVirtualScannerMode();
        });
        if (btnEnrollFromScanner) btnEnrollFromScanner.addEventListener('click', enrollFromScanner);
        if (btnUploadPhoto && scannerPhotoUpload) {
            btnUploadPhoto.addEventListener('click', () => scannerPhotoUpload.click());
        }
        if (scannerPhotoUpload) {
            scannerPhotoUpload.addEventListener('change', handleScannerPhotoFile);
        }
        if (btnScanUpload) {
            btnScanUpload.addEventListener('click', scanUploadedPhoto);
        }
        if (scannerLiveToggle) {
            scannerLiveToggle.addEventListener('change', () => {
                if (scannerLiveToggle.checked && isScanning && !isVirtualCameraActive) {
                    startLiveScanLoop();
                } else {
                    stopLiveScanLoop();
                }
            });
        }

        if (scannerLogEl) appendScannerLog('Scanner initialized.');
        if (!btnToggleCamera) appendScannerLog('ERROR: Start Camera button not found in DOM');
        else appendScannerLog('Start Camera button ready');
        try {
            appendScannerLog(`Page origin: ${location.protocol}//${location.hostname}:${location.port}`);
        } catch (e) {}
    }

    function appendScannerLog(msg) {
        try {
            const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
            if (scannerLogEl) {
                scannerLogEl.innerText = line + '\n' + scannerLogEl.innerText;
            }
            console.debug('ScannerLog:', msg);
        } catch (e) { console.debug('Log append failed', e); }
    }

    function enrollFromScanner() {
        // Ensure some camera feed is available
        if (!activeCameraStream && !isVirtualCameraActive) {
            showToast('Camera Inactive', 'Start the scanner camera first to capture a face.', 'error');
            return;
        }

        // Capture frame from live scanner feed or simulate snapshot
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');

        if (!isVirtualCameraActive && webcamVideo && webcamVideo.readyState >= 2) {
            try {
                ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
                capturedPhotoDataUrl = canvas.toDataURL('image/jpeg');
            } catch (e) {
                console.warn('Failed to capture from real webcam:', e);
                // fallback to virtual snapshot
                drawVirtualEnrollSnapshot(ctx, canvas.width, canvas.height);
            }
        } else {
            drawVirtualEnrollSnapshot(ctx, canvas.width, canvas.height);
        }

        // Open the registration modal and prefill snapshot
        openRegisterModal(capturedPhotoDataUrl);
        showToast('Captured', 'Snapshot taken from scanner and loaded into enrollment form.', 'success');
    }

    function drawVirtualEnrollSnapshot(ctx, w, h) {
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, 0, w, h);
        const colors = ['#00f2fe', '#9d4edd', '#10b981', '#f59e0b', '#3b82f6'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = '#11152c';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 80, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(w/2, h/2 - 25, 28, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#4facfe';
        ctx.beginPath();
        ctx.ellipse(w/2, h - 40, 52, 36, 0, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'rgba(79,172,254,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 75, 0, 2*Math.PI);
        ctx.stroke();
        capturedPhotoDataUrl = ctx.canvas.toDataURL('image/jpeg');
    }

    function toggleCameraScanner() {
        appendScannerLog('Start Camera clicked');
        // Check permissions API if available
        try {
            if (navigator.permissions && navigator.permissions.query) {
                navigator.permissions.query({ name: 'camera' }).then(p => {
                    appendScannerLog('Camera permission state: ' + p.state);
                }).catch(() => {});
            }
        } catch (e) {}

        if (activeCameraStream || isVirtualCameraActive) {
            stopScannerWebcam();
        } else {
            startScannerWebcam();
        }
    }

    function startScannerWebcam() {
        scannerBanner.className = 'scanner-status-banner scanning visible';
        scannerBannerText.innerText = 'Initializing Camera...';
        btnToggleCamera.disabled = true;
        // getUserMedia requires a secure context (https or localhost). Detect insecure contexts and inform the user.
        const isSecureContext = (window.isSecureContext === true) || (location.protocol === 'https:') || (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
        if (!isSecureContext) {
            btnToggleCamera.disabled = false;
            scannerBannerText.innerText = 'Camera blocked: insecure context.';
            appendScannerLog('Blocked: insecure context - use https or localhost.');
            showToast('Camera Blocked', 'Camera access requires HTTPS or running from http://localhost. Run a local server (e.g., Live Server extension) and retry.', 'error');
            return;
        }

        const tryGetDevices = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                scannerBannerText.innerText = 'Camera unsupported in this context.';
                btnToggleCamera.disabled = false;
                showToast('Camera Unsupported', 'Your browser or context does not permit camera access.', 'error');
                return;
            }

            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = devices.some(d => d.kind === 'videoinput');
                if (!hasVideo) {
                    scannerBannerText.innerText = 'No camera detected.';
                    btnToggleCamera.disabled = false;
                    showToast('No Camera Found', 'No video input devices were detected.', 'error');
                    return;
                }

                // Request camera with user-facing facingMode
                const constraints = { video: { width: 640, height: 480, facingMode: 'user' } };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                activeCameraStream = stream;
                webcamVideo.srcObject = stream;
                webcamVideo.onloadedmetadata = () => {
                    webcamVideo.play();
                    webcamVideo.style.display = 'block';
                    isVirtualCameraActive = false;

                    btnToggleCamera.disabled = false;
                    btnToggleCamera.className = 'btn btn-secondary';
                    document.getElementById('camera-btn-text').innerText = 'Stop Camera Scanner';
                    // When a real webcam is active prefer live matching over simulation
                    btnSimulateMatch.disabled = true;
                    scannerPlaceholder.style.display = 'none';
                    scannerView.classList.add('scanning');

                    adjustScannerCanvasSize();
                    startFaceScannerEngine();
                    showToast('Camera Connected', 'Real webcam feed loaded successfully.', 'success');
                };
            } catch (err) {
                console.warn('Camera initialization failed:', err);
                btnToggleCamera.disabled = false;
                scannerBannerText.innerText = 'Camera initialization failed.';
                appendScannerLog('Camera error: ' + (err && err.message ? err.message : String(err)));
                showToast('Camera Error', 'Failed to access camera. Allow permissions or use the simulator.', 'error');
            }
        };

        tryGetDevices();
    }

    function startVirtualScannerMode() {
        isVirtualCameraActive = true;
        
        btnToggleCamera.disabled = false;
        btnToggleCamera.className = 'btn btn-secondary';
        document.getElementById('camera-btn-text').innerText = 'Stop Camera Scanner';
        btnSimulateMatch.disabled = false;
        scannerPlaceholder.style.display = 'none';
        scannerView.classList.add('scanning');
        
        adjustScannerCanvasSize();
        
        const stream = createVirtualScannerStream();
        if (stream) {
            virtualScannerStream = stream;
            activeCameraStream = stream;
            webcamVideo.srcObject = stream;
            webcamVideo.style.display = 'block';
            webcamVideo.play().catch(() => {});
        }

        // Loop virtual grid drawings
        runVirtualScannerFeedLoop();
        
        startFaceScannerEngine();
        showToast('Simulator Active', 'Virtual scanning environment loaded.', 'info');
    }

    function createVirtualScannerStream() {
        if (virtualScannerCanvas) {
            return virtualScannerCanvas.captureStream(15);
        }
        virtualScannerCanvas = document.createElement('canvas');
        virtualScannerCanvas.width = scannerView.clientWidth || 640;
        virtualScannerCanvas.height = scannerView.clientHeight || 480;
        const ctx = virtualScannerCanvas.getContext('2d');

        const drawFrame = () => {
            if (!isVirtualCameraActive) return;
            const w = virtualScannerCanvas.width;
            const h = virtualScannerCanvas.height;

            ctx.fillStyle = '#08111f';
            ctx.fillRect(0, 0, w, h);

            const gradient = ctx.createLinearGradient(0, 0, w, h);
            gradient.addColorStop(0, 'rgba(0, 242, 254, 0.15)');
            gradient.addColorStop(1, 'rgba(157, 78, 221, 0.12)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += 30) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            const time = Date.now() / 400;
            ctx.fillStyle = 'rgba(0, 242, 254, 0.08)';
            ctx.beginPath();
            ctx.arc(w/2 + Math.sin(time) * 30, h/2 + Math.cos(time) * 20, 72, 0, 2*Math.PI);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '12px monospace';
            ctx.fillText('CAMERA SIMULATION MODE', 22, h - 28);
            ctx.fillText(`${new Date().toLocaleTimeString()}`, 22, h - 12);

            requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);
        return virtualScannerCanvas.captureStream(15);
    }

    function runVirtualScannerFeedLoop() {
        if (!isVirtualCameraActive) return;

        const loop = () => {
            if (!isVirtualCameraActive) return;
            const w = trackerCanvas.width;
            const h = trackerCanvas.height;
            const time = new Date().getTime();

            // Background matrix fill
            trackerCtx.clearRect(0, 0, w, h);
            trackerCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            trackerCtx.fillRect(0, 0, w, h);

            // Tech scanner grid lines
            trackerCtx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
            trackerCtx.lineWidth = 1;
            const step = 40;
            for (let x = 0; x < w; x += step) {
                trackerCtx.beginPath();
                trackerCtx.moveTo(x, 0);
                trackerCtx.lineTo(x, h);
                trackerCtx.stroke();
            }
            for (let y = 0; y < h; y += step) {
                trackerCtx.beginPath();
                trackerCtx.moveTo(0, y);
                trackerCtx.lineTo(w, y);
                trackerCtx.stroke();
            }

            // Dotted circle target
            trackerCtx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
            trackerCtx.lineWidth = 1.5;
            trackerCtx.beginPath();
            trackerCtx.arc(w/2, h/2, Math.min(w, h)*0.25, 0, 2 * Math.PI);
            trackerCtx.stroke();

            // Silhouette contour outline representation
            trackerCtx.strokeStyle = 'rgba(157, 78, 221, 0.35)';
            trackerCtx.lineWidth = 2.5;
            trackerCtx.beginPath();
            trackerCtx.ellipse(w/2, h/2 - 15, w*0.12, h*0.22, 0, 0, 2 * Math.PI);
            trackerCtx.moveTo(w/2 - w*0.18, h);
            trackerCtx.quadraticCurveTo(w/2 - w*0.15, h - h*0.15, w/2 - w*0.06, h - h*0.15);
            trackerCtx.lineTo(w/2 + w*0.06, h - h*0.15);
            trackerCtx.quadraticCurveTo(w/2 + w*0.15, h - h*0.15, w/2 + w*0.18, h);
            trackerCtx.stroke();

            // Screen Labels
            trackerCtx.fillStyle = 'rgba(0, 242, 254, 0.7)';
            trackerCtx.font = 'bold 11px monospace';
            trackerCtx.textAlign = 'center';
            trackerCtx.fillText("VIRTUAL RADAR SCANNER ACTIVE", w/2, 25);

            if (Math.floor(time / 650) % 2 === 0) {
                trackerCtx.fillStyle = '#ef4444';
                trackerCtx.beginPath();
                trackerCtx.arc(w/2 - 105, 21, 4.5, 0, 2*Math.PI);
                trackerCtx.fill();
            }

            virtualCamAnimationId = requestAnimationFrame(loop);
        };
        virtualCamAnimationId = requestAnimationFrame(loop);
    }

    function stopScannerWebcam() {
        if (activeCameraStream) {
            activeCameraStream.getTracks().forEach(track => track.stop());
            activeCameraStream = null;
        }

        if (virtualScannerStream) {
            virtualScannerStream.getTracks().forEach(track => track.stop());
            virtualScannerStream = null;
        }
        if (virtualScannerCanvas) {
            virtualScannerCanvas = null;
        }

        isVirtualCameraActive = false;
        if (virtualCamAnimationId) cancelAnimationFrame(virtualCamAnimationId);

        webcamVideo.srcObject = null;
        webcamVideo.style.display = 'block';

        btnToggleCamera.className = 'btn btn-primary';
        document.getElementById('camera-btn-text').innerText = 'Start Camera Scanner';
        btnSimulateMatch.disabled = true;
        scannerPlaceholder.style.display = 'flex';
        scannerView.className = 'scanner-view-container';
        scannerBanner.className = 'scanner-status-banner idle visible';
        scannerBannerText.innerText = 'Camera Standby';

        stopFaceScannerEngine();
        showToast('Scanner Idle', 'Face scanner placed on standby.', 'info');
    }

    function adjustScannerCanvasSize() {
        trackerCanvas.width = scannerView.clientWidth;
        trackerCanvas.height = scannerView.clientHeight;
        
        faceX = Math.round(trackerCanvas.width * 0.35);
        faceY = Math.round(trackerCanvas.height * 0.25);
        faceW = Math.round(trackerCanvas.width * 0.3);
        faceH = Math.round(trackerCanvas.width * 0.3);
    }

    function startFaceScannerEngine() {
        isScanning = true;
        drawScannerOverlayFrame();

        // If a real webcam is active, run live scanning against enrolled profiles
        if (!isVirtualCameraActive) {
            startLiveScanLoop();
        }

        if (db.settings.autoScan) {
            scheduleNextSimulatedScan();
        }
    }

    function stopFaceScannerEngine() {
        isScanning = false;
        if (scannerOverlayAnimationId) cancelAnimationFrame(scannerOverlayAnimationId);
        if (scanTimeoutId) clearTimeout(scanTimeoutId);
        if (simulatedMatchTimeoutId) clearTimeout(simulatedMatchTimeoutId);
        stopLiveScanLoop();
        
        if (!isVirtualCameraActive) {
            trackerCtx.clearRect(0, 0, trackerCanvas.width, trackerCanvas.height);
        }
        
        scanBox.style.display = 'none';
        faceGuide.style.display = 'none';
    }

    function startLiveScanLoop() {
        stopLiveScanLoop();
        // run a scan every 1800ms while scanning
        liveScanIntervalId = setInterval(() => {
            if (!isScanning || isVirtualCameraActive) return;
            performLiveScanOnce();
        }, 1800);
    }

    function stopLiveScanLoop() {
        if (liveScanIntervalId) {
            clearInterval(liveScanIntervalId);
            liveScanIntervalId = null;
        }
        isProcessingLiveScan = false;
    }

    async function performLiveScanOnce() {
        if (isProcessingLiveScan) return;
        if (!webcamVideo || webcamVideo.readyState < 2) return;
        if (!db.users || db.users.length === 0) return;

        isProcessingLiveScan = true;

        // Capture current frame
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        try {
            ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            isProcessingLiveScan = false;
            return;
        }

        const frameDataUrl = canvas.toDataURL('image/jpeg');

        // Compute similarity against stored profiles (parallel)
        const results = await Promise.all(db.users.map(async user => {
            const sim = await computeImageSimilarity(user.photoDataUrl, frameDataUrl);
            return { user, similarity: sim };
        }));

        results.sort((a, b) => b.similarity - a.similarity);
        const top = results[0];
        if (top && top.similarity >= db.settings.matchAccuracy) {
            // Visual feedback
            scanBox.style.borderColor = 'var(--accent-green)';
            scanBox.style.boxShadow = 'var(--glow-green)';
            scanLabel.innerText = `${top.user.name} (${top.similarity}%)`;
            scanLabel.style.background = 'var(--accent-green)';
            scannerView.className = 'scanner-view-container match-success';
            scannerBanner.className = 'scanner-status-banner success visible';
            scannerBannerText.innerText = 'Biometric Authenticated';

            // Log attendance (function checks duplicates)
            logAttendanceRecord(top.user);

            // give UI a moment before resuming
            setTimeout(() => {
                if (isScanning) {
                    scannerView.className = 'scanner-view-container scanning';
                    scannerBanner.className = 'scanner-status-banner scanning visible';
                    scannerBannerText.innerText = 'Searching Profiles...';
                    scanBox.style.borderColor = 'var(--accent-cyan)';
                    scanBox.style.boxShadow = 'var(--glow-cyan)';
                    scanLabel.innerText = 'Analyzing...';
                    scanLabel.style.background = 'var(--accent-cyan)';
                }
            }, 2500);
        }

        isProcessingLiveScan = false;
    }

    function scheduleNextSimulatedScan() {
        if (!isScanning) return;
        // Do not schedule simulated scans when a real camera is active and live-scan is enabled
        if (!isVirtualCameraActive && scannerLiveToggle && scannerLiveToggle.checked) return;
        const latency = (db.settings.matchLatency + Math.random() * 4) * 1000;
        
        scanTimeoutId = setTimeout(() => {
            if (isScanning && db.users.length > 0) {
                simulateFaceMatchProcess();
            } else {
                scheduleNextSimulatedScan();
            }
        }, latency);
    }

    function manualSimulateMatch() {
        if (!isScanning) return;
        if (db.users.length === 0) {
            showToast('Roster Empty', 'Please enroll a profile directory first.', 'error');
            return;
        }
        btnSimulateMatch.disabled = true;
        simulateFaceMatchProcess();
    }

    function simulateFaceMatchProcess() {
        if (scanTimeoutId) clearTimeout(scanTimeoutId);

        const randomIndex = Math.floor(Math.random() * db.users.length);
        const selectedUser = db.users[randomIndex];

        scannerBanner.className = 'scanner-status-banner scanning visible';
        scannerBannerText.innerText = 'Locking Facial Coordinates...';
        
        vx = 0.25;
        vy = 0.15;

        simulatedMatchTimeoutId = setTimeout(() => {
            scannerBannerText.innerText = 'Analyzing Biometrics...';
            scanBox.style.borderColor = 'var(--accent-purple)';
            scanBox.style.boxShadow = 'var(--glow-purple)';
            scanLabel.innerText = 'Matching: 89%';
            scanLabel.style.background = 'var(--accent-purple)';

            simulatedMatchTimeoutId = setTimeout(() => {
                const successRate = Math.floor(75 + Math.random() * 24);
                const isMatchValid = successRate >= db.settings.matchAccuracy;

                if (isMatchValid) {
                    scanBox.style.borderColor = 'var(--accent-green)';
                    scanBox.style.boxShadow = 'var(--glow-green)';
                    scanLabel.innerText = `${selectedUser.name} (${successRate}%)`;
                    scanLabel.style.background = 'var(--accent-green)';
                    
                    scannerView.className = 'scanner-view-container match-success';
                    scannerBanner.className = 'scanner-status-banner success visible';
                    scannerBannerText.innerText = 'Biometric Authenticated';

                    logAttendanceRecord(selectedUser);
                } else {
                    scanBox.style.borderColor = 'var(--accent-red)';
                    scanBox.style.boxShadow = 'var(--glow-red)';
                    scanLabel.innerText = 'Unknown Face';
                    scanLabel.style.background = 'var(--accent-red)';
                    
                    scannerView.className = 'scanner-view-container match-fail';
                    scannerBanner.className = 'scanner-status-banner fail visible';
                    scannerBannerText.innerText = 'Identity Unrecognized';
                    showToast('Access Blocked', 'Signature mismatch database fingerprint.', 'error');
                }

                // Reset back to searching loop
                simulatedMatchTimeoutId = setTimeout(() => {
                    if (isScanning) {
                        scannerView.className = 'scanner-view-container scanning';
                        scannerBanner.className = 'scanner-status-banner scanning visible';
                        scannerBannerText.innerText = 'Searching Profiles...';
                        scanBox.style.borderColor = 'var(--accent-cyan)';
                        scanBox.style.boxShadow = 'var(--glow-cyan)';
                        scanLabel.innerText = 'Analyzing...';
                        scanLabel.style.background = 'var(--accent-cyan)';
                        
                        vx = 1.3;
                        vy = 0.9;
                        btnSimulateMatch.disabled = false;
                        
                        if (db.settings.autoScan) {
                            scheduleNextSimulatedScan();
                        }
                    }
                }, 3500);

            }, 1200);
        }, 1200);
    }

    function logAttendanceRecord(user) {
        const todayDate = getTodayDateString();
        const alreadyCheckedIn = db.logs.some(log => log.userId === user.id && log.date === todayDate);
        if (alreadyCheckedIn) {
            showToast('Access Cleared', `${user.name} already logged attendance.`, 'info');
            return;
        }

        const now = new Date();
        const timeStr = formatTime(now);
        
        let status = "Present";
        const [shiftH, shiftM] = db.settings.lateStart.split(':').map(Number);
        const checkH = now.getHours();
        const checkM = now.getMinutes();

        if (checkH > shiftH || (checkH === shiftH && checkM > shiftM)) {
            status = "Late";
        }

        const logEntry = {
            logId: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: user.id,
            userName: user.name,
            userPhoto: user.photoDataUrl,
            department: user.department,
            timestamp: now.getTime(),
            date: todayDate,
            time: timeStr,
            status: status
        };

        db.logs.push(logEntry);
        saveDatabase();

        showToast('Check-in Logged', `${user.name} checked in at ${timeStr} (${status}).`, status === 'Present' ? 'success' : 'info');
        refreshDashboardMetrics();
    }

    function handleScannerPhotoFile(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            scannerUploadDataUrl = reader.result;
            if (btnScanUpload) btnScanUpload.disabled = false;
            showToast('Upload Ready', `Reference photo loaded for scanning.`, 'success');
        };
        reader.readAsDataURL(file);
    }

    async function scanUploadedPhoto() {
        if (!scannerUploadDataUrl) {
            showToast('No Upload', 'Please upload a reference photo first.', 'error');
            return;
        }

        scannerBanner.className = 'scanner-status-banner scanning visible';
        scannerBannerText.innerText = 'Scanning uploaded photo...';
        scannerView.classList.add('scanning');

        captureCurrentFrameForScan();
        const fileName = scannerPhotoUpload?.files?.[0]?.name || '';
        let matchedUser = findMatchingUserFromUpload(fileName, scannerUploadDataUrl);

        if (!matchedUser) {
            const uploadSimilarityResults = await Promise.all(db.users.map(async user => {
                const similarity = await computeImageSimilarity(user.photoDataUrl, scannerUploadDataUrl);
                return { user, similarity };
            }));

            uploadSimilarityResults.sort((a, b) => b.similarity - a.similarity);
            if (uploadSimilarityResults.length > 0 && uploadSimilarityResults[0].similarity >= 90) {
                matchedUser = uploadSimilarityResults[0].user;
            }
        }

        if (!matchedUser) {
            const idList = db.users.map(user => `${user.id} (${user.name})`).join('\n');
            const selection = prompt(`Unable to auto-match photo. Enter the user ID to log attendance:\n${idList}`);
            if (selection) {
                matchedUser = db.users.find(user => user.id.toLowerCase() === selection.trim().toLowerCase());
            }
        }

        if (matchedUser) {
            let similarityText = '';
            if (scannerCurrentFrameDataUrl) {
                const cameraSimilarity = await computeImageSimilarity(matchedUser.photoDataUrl, scannerCurrentFrameDataUrl);
                similarityText = cameraSimilarity ? ` Approximate scan confidence ${cameraSimilarity}%` : '';
            }
            logAttendanceRecord(matchedUser);
            showToast('Photo Scan Complete', `Attendance recorded for ${matchedUser.name}.${similarityText}`, 'success');
        } else {
            showToast('No Match Found', 'The uploaded photo did not match any stored profile.', 'error');
        }
    }

    function findMatchingUserFromUpload(fileName, dataUrl) {
        if (!db.users || db.users.length === 0) return null;

        const exactMatch = db.users.find(user => user.photoDataUrl === dataUrl);
        if (exactMatch) return exactMatch;

        const normalizedName = fileName.toLowerCase();
        if (normalizedName) {
            const byName = db.users.find(user => {
                const name = user.name.toLowerCase();
                const userId = user.id.toLowerCase();
                return normalizedName.includes(name.split(' ')[0]) || normalizedName.includes(userId) || userId.includes(normalizedName);
            });
            if (byName) return byName;
        }

        return null;
    }

    function getCurrentCameraMatchText(matchedUser) {
        return '';
    }

    function captureCurrentFrameForScan() {
        if (!webcamVideo || !scannerUploadDataUrl) return;
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        try {
            ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
            scannerCurrentFrameDataUrl = canvas.toDataURL('image/jpeg');
        } catch (e) {
            scannerCurrentFrameDataUrl = null;
        }
    }

    async function computeImageSimilarity(dataUrlA, dataUrlB) {
        if (!dataUrlA || !dataUrlB) return 0;

        const loadImage = src => new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });

        const [imgA, imgB] = await Promise.all([loadImage(dataUrlA), loadImage(dataUrlB)]);
        if (!imgA || !imgB) return 0;

        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const getPixels = img => {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            return ctx.getImageData(0, 0, size, size).data;
        };

        const dataA = getPixels(imgA);
        const dataB = getPixels(imgB);

        let diff = 0;
        for (let i = 0; i < dataA.length; i += 4) {
            diff += Math.abs(dataA[i] - dataB[i]);
            diff += Math.abs(dataA[i+1] - dataB[i+1]);
            diff += Math.abs(dataA[i+2] - dataB[i+2]);
        }

        const maxDiff = size * size * 255 * 3;
        const similarity = Math.round(Math.max(0, 100 - (diff / maxDiff) * 100));
        return similarity;
    }

    function drawScannerOverlayFrame() {
        if (!isScanning) return;
        
        if (!isVirtualCameraActive) {
            trackerCtx.clearRect(0, 0, trackerCanvas.width, trackerCanvas.height);
        }

        faceX += vx;
        faceY += vy;

        const maxMoveX = trackerCanvas.width - faceW - 20;
        const maxMoveY = trackerCanvas.height - faceH - 20;

        if (faceX > maxMoveX || faceX < 20) vx *= -1;
        if (faceY > maxMoveY || faceY < 20) vy *= -1;

        scanBox.style.display = 'block';
        scanBox.style.left = `${faceX}px`;
        scanBox.style.top = `${faceY}px`;
        scanBox.style.width = `${faceW}px`;
        scanBox.style.height = `${faceH}px`;

        faceGuide.style.display = 'block';
        faceGuide.style.left = `${faceX - 20}px`;
        faceGuide.style.top = `${faceY - 20}px`;
        faceGuide.style.width = `${faceW + 40}px`;
        faceGuide.style.height = `${faceH + 40}px`;

        // Draw tracking coordinate nodes on canvas overlay
        const cx = faceX + (faceW / 2);
        const cy = faceY + (faceH / 2);

        trackerCtx.fillStyle = 'rgba(0, 242, 254, 0.65)';
        const dots = [
            { x: -0.22, y: -0.15 }, { x: 0.22, y: -0.15 }, // Eyes
            { x: 0, y: 0.05 }, // Nose
            { x: -0.18, y: 0.26 }, { x: 0, y: 0.32 }, { x: 0.18, y: 0.26 }, // Mouth
            { x: -0.35, y: 0.05 }, { x: 0.35, y: 0.05 } // Face bounds
        ];

        dots.forEach(pt => {
            const px = cx + (pt.x * faceW);
            const py = cy + (pt.y * faceH);
            trackerCtx.beginPath();
            trackerCtx.arc(px, py, 3, 0, 2 * Math.PI);
            trackerCtx.fill();
        });

        scannerOverlayAnimationId = requestAnimationFrame(drawScannerOverlayFrame);
    }

    // ----------------------------------------------------
    // 7. USER DIRECTORY
    // ----------------------------------------------------
    const userSearchInput = document.getElementById('user-search');
    const filterUserDept = document.getElementById('filter-user-dept');
    const filterUserRole = document.getElementById('filter-user-role');
    const usersGridContainer = document.getElementById('users-grid-container');
    function initUsersDirectory() {
        renderUsersGrid(db.users);
        userSearchInput.addEventListener('input', applyUserFilters);
        filterUserDept.addEventListener('change', applyUserFilters);
        filterUserRole.addEventListener('change', applyUserFilters);
    }
    function renderUsersGrid(usersList) {
        usersGridContainer.innerHTML = '';
        if (usersList.length === 0) {
            usersGridContainer.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i data-lucide="info" style="margin:0 auto 1rem; width:48px; height:48px; stroke-width:1.5; color:var(--text-muted);"></i>
                    <p>No user records found matching filters.</p>
                </div>
            `;
            safeCreateIcons();
            return;
        }
        usersList.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'card user-card';
            
            const avatarMarkup = user.photoDataUrl 
                ? `<img src="${user.photoDataUrl}" class="user-card-avatar" alt="${user.name}">`
                : `<div class="user-card-avatar" style="display:flex;align-items:center;justify-content:center;font-weight:700;font-size:2rem;color:var(--bg-primary);background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));">${user.name.charAt(0)}</div>`;
            userCard.innerHTML = `
                <div class="user-card-actions">
                    <button class="btn-icon-danger btn-delete-user" data-id="${user.id}" title="Remove user profile">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
                <div class="user-card-header">
                    ${avatarMarkup}
                    <h3 class="user-card-name">${user.name}</h3>
                    <span class="user-card-role">${user.role}</span>
                </div>
                <div class="user-card-details">
                    <div class="detail-row">
                        <span class="detail-label">ID Code:</span>
                        <span style="font-weight:600; color:var(--text-primary);">${user.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Department:</span>
                        <span>${user.department}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Registered:</span>
                        <span>${user.createdDate}</span>
                    </div>
                </div>
            `;
            userCard.querySelector('.btn-delete-user').addEventListener('click', () => {
                deleteUserProfile(user.id);
            });
            usersGridContainer.appendChild(userCard);
        });
        safeCreateIcons();
    }
    function applyUserFilters() {
        const query = userSearchInput.value.toLowerCase().trim();
        const dept = filterUserDept.value;
        const role = filterUserRole.value;
        const filtered = db.users.filter(user => {
            const matchesQuery = user.name.toLowerCase().includes(query) || 
                                 user.id.toLowerCase().includes(query) || 
                                 user.department.toLowerCase().includes(query);
            const matchesDept = dept === 'all' || user.department === dept;
            const matchesRole = role === 'all' || user.role === role;
            return matchesQuery && matchesDept && matchesRole;
        });
        renderUsersGrid(filtered);
    }
    function deleteUserProfile(userId) {
        if (confirm(`Remove facial profile code ${userId} from directory?`)) {
            db.users = db.users.filter(user => user.id !== userId);
            saveDatabase();
            applyUserFilters();
            refreshDashboardMetrics();
            showToast('Profile Deleted', `Purged ${userId} from biometric registry.`, 'success');
        }
    }
    // ----------------------------------------------------
    // 8. USER ENROLLMENT PORTAL (MODALS)
    // ----------------------------------------------------
    const registerModal = document.getElementById('register-modal');
    const btnOpenRegisterModal = document.getElementById('btn-open-register-modal');
    const btnCloseRegisterModal = document.getElementById('btn-close-register-modal');
    const btnCancelRegister = document.getElementById('btn-cancel-register');
    const formRegisterUser = document.getElementById('form-register-user');
    
    const registerVideo = document.getElementById('register-video');
    const snapshotPreview = document.getElementById('snapshot-preview');
    const btnRegisterStartCam = document.getElementById('btn-register-start-cam');
    const btnRegisterSnap = document.getElementById('btn-register-snap');
    const btnRegisterUpload = document.getElementById('btn-register-upload');
    const btnRegisterRetake = document.getElementById('btn-register-retake');
    const registerPhotoUpload = document.getElementById('register-photo-upload');
    const registerTargetOverlay = document.getElementById('register-target-overlay');
    let capturedPhotoDataUrl = null;
    function initRegistrationModal() {
        if (btnOpenRegisterModal) btnOpenRegisterModal.addEventListener('click', openRegisterModal);
        else console.warn('Register modal open button not found');

        if (btnCloseRegisterModal) btnCloseRegisterModal.addEventListener('click', closeRegisterModal);
        if (btnCancelRegister) btnCancelRegister.addEventListener('click', closeRegisterModal);
        if (btnRegisterStartCam) btnRegisterStartCam.addEventListener('click', startRegisterWebcam);
        if (btnRegisterUpload && registerPhotoUpload) {
            btnRegisterUpload.addEventListener('click', () => registerPhotoUpload.click());
        }
        if (registerPhotoUpload) registerPhotoUpload.addEventListener('change', handleRegisterPhotoUpload);
        if (btnRegisterSnap) btnRegisterSnap.addEventListener('click', captureUserSnapshot);
        if (btnRegisterRetake) btnRegisterRetake.addEventListener('click', retakeUserSnapshot);
        if (formRegisterUser) formRegisterUser.addEventListener('submit', handleRegistrationSubmit);
    }
    // Accept optional preloadedPhoto (dataURL) to show a captured snapshot immediately
    function openRegisterModal(preloadedPhoto) {
        registerModal.classList.add('active');
        formRegisterUser.reset();
        if (registerPhotoUpload) registerPhotoUpload.value = '';
        snapshotPreview.style.display = 'none';
        registerVideo.style.display = 'block';
        registerTargetOverlay.style.display = 'block';
        btnRegisterSnap.disabled = true;
        btnRegisterRetake.style.display = 'none';
        btnRegisterStartCam.style.display = 'inline-flex';
        btnRegisterStartCam.disabled = false;
        isRegisterVirtualCamActive = false;

        if (preloadedPhoto) {
            capturedPhotoDataUrl = preloadedPhoto;
            snapshotPreview.src = capturedPhotoDataUrl;
            snapshotPreview.style.display = 'block';
            registerVideo.style.display = 'none';
            registerTargetOverlay.style.display = 'none';
            const tempCanvas = document.getElementById('register-virtual-canvas');
            if (tempCanvas) tempCanvas.style.display = 'none';
            btnRegisterStartCam.style.display = 'none';
            btnRegisterSnap.disabled = true;
            btnRegisterRetake.style.display = 'inline-flex';
        } else {
            capturedPhotoDataUrl = null;
            // auto-start webcam when the registration form opens for demo
            startRegisterWebcam();
        }
    }
    function closeRegisterModal() {
        registerModal.classList.remove('active');
        stopRegisterWebcam();
    }
    function startRegisterWebcam() {
        btnRegisterStartCam.disabled = true;
        
        const requestRegisterCamera = () => {
            navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
                .then(stream => {
                    registerCameraStream = stream;
                    registerVideo.srcObject = stream;
                    registerVideo.play();
                    registerVideo.style.display = 'block';
                    isRegisterVirtualCamActive = false;
                    
                    btnRegisterSnap.disabled = false;
                    btnRegisterStartCam.style.display = 'none';
                })
                .catch(err => {
                    console.warn("Register camera blocked. Loading virtual snapshot engine.", err);
                    initializeVirtualRegisterCamera();
                });
        };
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            requestRegisterCamera();
        } else {
            console.warn("Camera streaming unsupported in this context.");
            initializeVirtualRegisterCamera();
        }
    }
    function initializeVirtualRegisterCamera() {
        isRegisterVirtualCamActive = true;
        registerVideo.style.display = 'none';
        btnRegisterSnap.disabled = false;
        btnRegisterStartCam.style.display = 'none';
        
        runVirtualRegisterFeed();
        showToast('Virtual Cam Active', 'Biometric scanner ready.', 'info');
    }
    function runVirtualRegisterFeed() {
        if (!isRegisterVirtualCamActive) return;
        
        const container = document.querySelector('.camera-preview-container');
        let tempCanvas = document.getElementById('register-virtual-canvas');
        
        if (!tempCanvas) {
            tempCanvas = document.createElement('canvas');
            tempCanvas.id = 'register-virtual-canvas';
            tempCanvas.style.width = '100%';
            tempCanvas.style.height = '100%';
            tempCanvas.style.objectFit = 'cover';
            tempCanvas.style.position = 'absolute';
            tempCanvas.style.top = '0';
            tempCanvas.style.left = '0';
            tempCanvas.style.zIndex = '4';
            container.appendChild(tempCanvas);
        }
        
        tempCanvas.style.display = 'block';
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 280;
        tempCanvas.height = 210;
        const loop = () => {
            if (!isRegisterVirtualCamActive) {
                tempCanvas.style.display = 'none';
                return;
            }
            const w = tempCanvas.width;
            const h = tempCanvas.height;
            tempCtx.fillStyle = '#11152c';
            tempCtx.fillRect(0, 0, w, h);
            
            tempCtx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
            tempCtx.lineWidth = 1;
            for (let x = 0; x < w; x += 30) {
                tempCtx.beginPath();
                tempCtx.moveTo(x, 0);
                tempCtx.lineTo(x, h);
                tempCtx.stroke();
            }
            tempCtx.strokeStyle = 'var(--accent-cyan)';
            tempCtx.lineWidth = 2;
            tempCtx.beginPath();
            tempCtx.arc(w/2, h/2 - 10, 45, 0, 2 * Math.PI);
            tempCtx.stroke();
            tempCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            tempCtx.font = 'bold 9px monospace';
            tempCtx.textAlign = 'center';
            tempCtx.fillText("Biometric Registration Feed", w/2, h - 25);
            
            registerVirtualCamAnimationId = requestAnimationFrame(loop);
        };
        registerVirtualCamAnimationId = requestAnimationFrame(loop);
    }

    function handleRegisterPhotoUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            capturedPhotoDataUrl = reader.result;
            snapshotPreview.src = capturedPhotoDataUrl;
            snapshotPreview.style.display = 'block';
            registerVideo.style.display = 'none';
            registerTargetOverlay.style.display = 'none';
            btnRegisterSnap.disabled = true;
            btnRegisterRetake.style.display = 'inline-flex';
            btnRegisterStartCam.style.display = 'none';
            stopRegisterWebcam();
            showToast('Photo Uploaded', 'Registration image ready.', 'success');
        };
        reader.readAsDataURL(file);
    }
    // Shut down registry stream
    function stopRegisterWebcam() {
        if (registerCameraStream) {
            registerCameraStream.getTracks().forEach(track => track.stop());
            registerCameraStream = null;
        }
        registerVideo.srcObject = null;
        isRegisterVirtualCamActive = false;
        if (registerVirtualCamAnimationId) cancelAnimationFrame(registerVirtualCamAnimationId);
        
        const tempCanvas = document.getElementById('register-virtual-canvas');
        if (tempCanvas) tempCanvas.style.display = 'none';
    }
    function captureUserSnapshot() {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (isRegisterVirtualCamActive) {
            ctx.fillStyle = '#0a0d1a';
            ctx.fillRect(0, 0, 320, 240);
            
            const colors = ['#00f2fe', '#9d4edd', '#10b981', '#f59e0b', '#3b82f6'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = '#11152c';
            ctx.beginPath();
            ctx.arc(160, 120, 80, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(160, 95, 28, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = '#4facfe';
            ctx.beginPath();
            ctx.ellipse(160, 190, 52, 40, 0, Math.PI, 2 * Math.PI);
            ctx.fill();
            
            ctx.strokeStyle = 'var(--accent-cyan)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(160, 120, 75, 0, 2*Math.PI);
            ctx.stroke();
            capturedPhotoDataUrl = canvas.toDataURL('image/jpeg');
        } else if (registerCameraStream) {
            ctx.drawImage(registerVideo, 0, 0, canvas.width, canvas.height);
            capturedPhotoDataUrl = canvas.toDataURL('image/jpeg');
        }
        snapshotPreview.src = capturedPhotoDataUrl;
        snapshotPreview.style.display = 'block';
        registerVideo.style.display = 'none';
        registerTargetOverlay.style.display = 'none';
        
        const tempCanvas = document.getElementById('register-virtual-canvas');
        if (tempCanvas) tempCanvas.style.display = 'none';
        btnRegisterSnap.disabled = true;
        btnRegisterRetake.style.display = 'inline-flex';
        
        stopRegisterWebcam();
        showToast('Snapshot Saved', 'Biometric signature mapped.', 'success');
    }
    function retakeUserSnapshot() {
        capturedPhotoDataUrl = null;
        snapshotPreview.style.display = 'none';
        registerVideo.style.display = 'block';
        registerTargetOverlay.style.display = 'block';
        btnRegisterRetake.style.display = 'none';
        btnRegisterSnap.disabled = false;
        
        startRegisterWebcam();
    }
    function handleRegistrationSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('reg-name').value.trim();
        const id = document.getElementById('reg-user-id').value.trim();
        const dept = document.getElementById('reg-department').value;
        const role = document.getElementById('reg-role').value;
        
        const idExists = db.users.some(user => user.id.toUpperCase() === id.toUpperCase());
        if (idExists) {
            showToast('Enrollment Blocked', `ID Code ${id} is already in use.`, 'error');
            return;
        }
        const newUser = {
            id: id,
            name: name,
            department: dept,
            role: role,
            createdDate: getTodayDateString(),
            photoDataUrl: capturedPhotoDataUrl || generateSVGAvatarFallback(name)
        };
        db.users.push(newUser);
        saveDatabase();
        
        showToast('Enrolled', `${name} added to security roster.`, 'success');
        closeRegisterModal();
        applyUserFilters();
        refreshDashboardMetrics();
    }
    function generateSVGAvatarFallback(name) {
        const colors = ['%2300f2fe', '%239d4edd', '%233b82f6', '%2310b981', '%23f59e0b', '%23ef4444'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2311152c'/><circle cx='50' cy='38' r='18' fill='white'/><path d='M20,80 C20,62 35,55 50,55 C65,55 80,62 80,80' fill='white'/></svg>`;
    }
    // ----------------------------------------------------
    // 9. ATTENDANCE LOGS DIRECTORY
    // ----------------------------------------------------
    const logSearchUser = document.getElementById('log-search-user');
    const logFilterDate = document.getElementById('log-filter-date');
    const logFilterStatus = document.getElementById('log-filter-status');
    const logFilterDept = document.getElementById('log-filter-dept');
    const btnClearLogsFilters = document.getElementById('btn-clear-logs-filters');
    const logsTableBody = document.getElementById('logs-table-body');
    const btnExportLogs = document.getElementById('btn-export-logs');
    function initLogsTab() {
        renderLogsTable(db.logs);
        
        logSearchUser.addEventListener('input', applyLogFilters);
        logFilterDate.addEventListener('change', applyLogFilters);
        logFilterStatus.addEventListener('change', applyLogFilters);
        logFilterDept.addEventListener('change', applyLogFilters);
        btnClearLogsFilters.addEventListener('click', resetLogsFilters);
        btnExportLogs.addEventListener('click', exportLogsToCSV);
    }
    function renderLogsTable(logsList) {
        logsTableBody.innerHTML = '';
        if (logsList.length === 0) {
            logsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        No logs matched filter parameters.
                    </td>
                </tr>
            `;
            return;
        }
        const sorted = [...logsList].sort((a, b) => b.timestamp - a.timestamp);
        sorted.forEach(log => {
            const tr = document.createElement('tr');
            const badgeClass = log.status === 'Present' ? 'badge-present' : 
                               log.status === 'Late' ? 'badge-late' : 'badge-absent';
            const avatarMarkup = log.userPhoto 
                ? `<img src="${log.userPhoto}" class="table-avatar" alt="${log.userName}">`
                : `<div class="table-avatar-placeholder">${log.userName.charAt(0)}</div>`;
            tr.innerHTML = `
                <td>
                    <div class="table-user-cell">
                        ${avatarMarkup}
                        <span style="font-weight:600; color:var(--text-primary);">${log.userName}</span>
                    </div>
                </td>
                <td><span style="font-family:monospace; font-size:0.85rem;">${log.userId}</span></td>
                <td>${log.department}</td>
                <td>${log.date}</td>
                <td>${log.time}</td>
                <td><span class="${badgeClass}">${log.status}</span></td>
            `;
            logsTableBody.appendChild(tr);
        });
    }
    function applyLogFilters() {
        const query = logSearchUser.value.toLowerCase().trim();
        const dateVal = logFilterDate.value;
        const status = logFilterStatus.value;
        const dept = logFilterDept.value;
        const filtered = db.logs.filter(log => {
            const matchesQuery = log.userName.toLowerCase().includes(query) || 
                                 log.userId.toLowerCase().includes(query);
            const matchesDate = !dateVal || log.date === dateVal;
            const matchesStatus = status === 'all' || log.status === status;
            const matchesDept = dept === 'all' || log.department === dept;
            return matchesQuery && matchesDate && matchesStatus && matchesDept;
        });
        renderLogsTable(filtered);
    }
    function resetLogsFilters() {
        logSearchUser.value = '';
        logFilterDate.value = '';
        logFilterStatus.value = 'all';
        logFilterDept.value = 'all';
        renderLogsTable(db.logs);
    }
    function exportLogsToCSV() {
        if (db.logs.length === 0) {
            showToast('Export Error', 'No data logs found to compile.', 'error');
            return;
        }
        let csv = "LogID,UserID,Name,Department,Date,Time,Status\n";
        db.logs.forEach(log => {
            csv += [log.logId, log.userId, `"${log.userName}"`, log.department, log.date, log.time, log.status].join(",") + "\n";
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `VisionPass_LogExport_${getTodayDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Export Completed', 'CSV Spreadsheet saved successfully.', 'success');
    }
    // ----------------------------------------------------
    // 10. SYSTEM CONFIGURATION / SETTINGS
    // ----------------------------------------------------
    const settingShiftStart = document.getElementById('setting-shift-start');
    const settingLateStart = document.getElementById('setting-late-start');
    const settingMatchLatency = document.getElementById('setting-match-latency');
    const settingMatchAccuracy = document.getElementById('setting-match-accuracy');
    const settingAutoScan = document.getElementById('setting-auto-scan');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnLoadDemoData = document.getElementById('btn-load-demo-data');
    const btnClearDatabase = document.getElementById('btn-clear-database');
    const btnStartDemo = document.getElementById('btn-start-demo');
    function initSettingsTab() {
        settingShiftStart.value = db.settings.shiftStart;
        settingLateStart.value = db.settings.lateStart;
        settingMatchLatency.value = db.settings.matchLatency;
        settingMatchAccuracy.value = db.settings.matchAccuracy;
        settingAutoScan.checked = db.settings.autoScan;
        btnSaveSettings.addEventListener('click', saveSystemSettings);
        btnLoadDemoData.addEventListener('click', forceLoadDemoData);
        btnClearDatabase.addEventListener('click', clearApplicationDatabase);
        if (btnStartDemo) btnStartDemo.addEventListener('click', startDemoMode);
    }

    function startDemoMode() {
        // Create two demo student registrations if not present
        const demo1 = {
            id: `STU-${Math.floor(1000 + Math.random()*9000)}`,
            name: 'Demo Student A',
            department: 'Computer Science',
            role: 'Student',
            createdDate: getTodayDateString(),
            photoDataUrl: generateSVGAvatarFallback('Demo Student A')
        };
        const demo2 = {
            id: `STU-${Math.floor(1000 + Math.random()*9000)}`,
            name: 'Demo Student B',
            department: 'Computer Science',
            role: 'Student',
            createdDate: getTodayDateString(),
            photoDataUrl: generateSVGAvatarFallback('Demo Student B')
        };

        db.users.push(demo1, demo2);
        saveDatabase();
        renderUsersGrid(db.users);
        refreshDashboardMetrics();

        // Ensure virtual scanner is active for demo
        if (!isVirtualCameraActive && !activeCameraStream) {
            startVirtualScannerMode();
        }

        // enable simulate button and schedule scans
        btnSimulateMatch.disabled = false;
        db.settings.autoScan = true;
        saveDatabase();
        scheduleNextSimulatedScan();

        showToast('Demo Mode', 'Two demo students added and scanner started.', 'info');
    }

    // Expose a safe global bridge so inline HTML onclick can trigger demo mode
    try {
        window.startDemoMode = startDemoMode;
        window.openFaceRegistration = openRegisterModal;
        window.enrollFaceFromScanner = enrollFromScanner;
    } catch (e) {
        console.warn('Could not expose global demo/register handlers', e);
    }
    function saveSystemSettings() {
        db.settings.shiftStart = settingShiftStart.value;
        db.settings.lateStart = settingLateStart.value;
        db.settings.matchLatency = parseInt(settingMatchLatency.value, 10);
        db.settings.matchAccuracy = parseInt(settingMatchAccuracy.value, 10);
        db.settings.autoScan = settingAutoScan.checked;
        saveDatabase();
        showToast('Settings Saved', 'System configurations updated.', 'success');
        refreshDashboardMetrics();
    }
    function forceLoadDemoData() {
        if (confirm("Import mock demo roster and attendance history logs?")) {
            db.users = [...db.users, ...DEFAULT_USERS.map(u => ({...u, id: u.id + "-DEMO" + Math.floor(Math.random()*100)}))];
            
            for (let i = 0; i < 15; i++) {
                const user = db.users[Math.floor(Math.random() * db.users.length)];
                const dateObj = new Date();
                dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 6));
                const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                
                const h = 8 + Math.floor(Math.random() * 2);
                const m = Math.floor(Math.random() * 59);
                const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
                db.logs.push({
                    logId: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                    userId: user.id,
                    userName: user.name,
                    userPhoto: user.photoDataUrl,
                    department: user.department,
                    timestamp: dateObj.getTime(),
                    date: dateStr,
                    time: timeStr,
                    status: (h === 9 && m > 15) || h > 9 ? "Late" : "Present"
                });
            }
            saveDatabase();
            showToast('Demo Data Loaded', 'Sample profiles and logs imported.', 'success');
            refreshDashboardMetrics();
            renderChart();
            renderUsersGrid(db.users);
            renderLogsTable(db.logs);
        }
    }
    function clearApplicationDatabase() {
        if (confirm("Permanently wipe employee directory and attendance history logs from local memory?")) {
            localStorage.clear();
            db.users = [];
            db.logs = [];
            db.settings = {
                shiftStart: "09:00",
                lateStart: "09:15",
                matchLatency: 3,
                matchAccuracy: 94,
                autoScan: true
            };
            saveDatabase();
            
            showToast('System Reset', 'Local memory databases wiped clean.', 'info');
            refreshDashboardMetrics();
            renderChart();
            renderUsersGrid(db.users);
            renderLogsTable(db.logs);
        }
    }
    // ----------------------------------------------------
    // 11. TOAST NOTIFICATIONS SERVICE
    // ----------------------------------------------------
    function showToast(title, message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'check-circle';
        if (type === 'error') icon = 'alert-octagon';
        if (type === 'info') icon = 'info';
        toast.innerHTML = `
            <i data-lucide="${icon}" class="toast-icon ${type}"></i>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        safeCreateIcons();
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 4500);
    }
});