/**
 * Enhanced Supporting Classes for Motion Amplification Pro
 * Provides robust implementations of webcam, ROI, analysis, and export functionality
 * 
 * @version 2.0.0
 */

/**
 * Enhanced WebcamManager - Complete camera handling with device management
 */
class EnhancedWebcamManager {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.devices = [];
        this.currentDeviceId = null;
        this.frameCallback = null;
        this.animationId = null;
        this.capabilities = null;
        this.settings = null;
    }
    
    async initialize() {
        try {
            await this.enumerateDevices();
            console.log('📹 Enhanced WebcamManager initialized');
        } catch (error) {
            console.error('Failed to initialize webcam manager:', error);
            throw error;
        }
    }
    
    async enumerateDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'videoinput');
            console.log(`Found ${this.devices.length} camera(s)`);
            return this.devices;
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            return [];
        }
    }
    
    async start(deviceId = null) {
        try {
            if (this.isActive) {
                await this.stop();
            }
            
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };
            
            console.log('🎥 Starting enhanced webcam...');
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.currentDeviceId = deviceId;
            
            // Get DOM elements
            this.video = document.getElementById('webcamVideo');
            this.canvas = document.getElementById('webcamCanvas');
            
            if (!this.video || !this.canvas) {
                throw new Error('Webcam video elements not found in DOM');
            }
            
            this.ctx = this.canvas.getContext('2d');
            
            // Setup video element
            this.video.srcObject = this.stream;
            this.video.autoplay = true;
            this.video.muted = true;
            this.video.playsInline = true;
            
            // Wait for video to be ready
            await new Promise((resolve, reject) => {
                this.video.addEventListener('loadedmetadata', resolve, { once: true });
                this.video.addEventListener('error', reject, { once: true });
                setTimeout(() => reject(new Error('Video load timeout')), 10000);
            });
            
            // Setup canvas size
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            // Get capabilities and settings
            const videoTrack = this.stream.getVideoTracks()[0];
            if (videoTrack) {
                try {
                    this.capabilities = videoTrack.getCapabilities();
                    this.settings = videoTrack.getSettings();
                } catch (e) {
                    console.warn('Could not get track capabilities/settings');
                }
            }
            
            this.isActive = true;
            this.startFrameCapture();
            
            console.log(`✅ Enhanced webcam started: ${this.video.videoWidth}x${this.video.videoHeight}`);
            
        } catch (error) {
            console.error('Failed to start enhanced webcam:', error);
            throw new Error('Failed to access webcam: ' + error.message);
        }
    }
    
    startFrameCapture() {
        if (!this.isActive) return;
        
        const captureFrame = () => {
            if (!this.isActive || !this.video || this.video.readyState < 2) {
                return;
            }
            
            try {
                // Draw current frame to canvas
                this.ctx.drawImage(
                    this.video, 
                    0, 0, 
                    this.canvas.width, 
                    this.canvas.height
                );
                
                // Call frame callback if set
                if (this.frameCallback) {
                    const frameData = this.getCurrentFrame();
                    if (frameData) {
                        this.frameCallback(frameData);
                    }
                }
                
            } catch (error) {
                console.warn('Frame capture error:', error);
            }
            
            this.animationId = requestAnimationFrame(captureFrame);
        };
        
        this.animationId = requestAnimationFrame(captureFrame);
    }
    
    setFrameCallback(callback) {
        this.frameCallback = callback;
    }
    
    stop() {
        console.log('🛑 Stopping enhanced webcam');
        
        // Stop animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Stop media stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log(`Stopped track: ${track.kind}`);
            });
            this.stream = null;
        }
        
        // Clear video element
        if (this.video) {
            this.video.srcObject = null;
            this.video.pause();
        }
        
        // Clear canvas
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.isActive = false;
        this.currentDeviceId = null;
        this.frameCallback = null;
        this.capabilities = null;
        this.settings = null;
        
        console.log('✅ Enhanced webcam stopped successfully');
    }
    
    getCurrentFrame() {
        if (!this.isActive || !this.video || this.video.readyState < 2) {
            return null;
        }
        
        try {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = this.video.videoWidth;
            tempCanvas.height = this.video.videoHeight;
            
            tempCtx.drawImage(this.video, 0, 0);
            
            return tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
        } catch (error) {
            console.error('Failed to capture current frame:', error);
            return null;
        }
    }
    
    getDevices() { return this.devices; }
    getCapabilities() { return this.capabilities; }
    getSettings() { return this.settings; }
    
    async switchDevice(deviceId) {
        if (deviceId === this.currentDeviceId) return;
        console.log(`🔄 Switching to device: ${deviceId}`);
        await this.start(deviceId);
    }
    
    getStatus() {
        return {
            isActive: this.isActive,
            deviceCount: this.devices.length,
            currentDevice: this.devices.find(d => d.deviceId === this.currentDeviceId),
            capabilities: this.capabilities,
            settings: this.settings,
            resolution: this.video ? {
                width: this.video.videoWidth,
                height: this.video.videoHeight
            } : null
        };
    }
}

/**
 * Enhanced ROISelector - Interactive region of interest selection
 */
class EnhancedROISelector {
    constructor() {
        this.isSelecting = false;
        this.isEnabled = false;
        this.selectedRegion = null;
        this.selectionCanvas = null;
        this.selectionCtx = null;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.callback = null;
    }
    
    initialize(targetElement) {
        if (!targetElement) {
            console.error('ROI target element not provided');
            return;
        }
        
        this.targetElement = targetElement;
        this.createSelectionCanvas();
        this.setupEventListeners();
        console.log('🎯 Enhanced ROI Selector initialized');
    }
    
    createSelectionCanvas() {
        this.selectionCanvas = document.createElement('canvas');
        this.selectionCanvas.className = 'roi-selection-canvas';
        this.selectionCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 10;
            border: 2px dashed #00ff00;
            background: rgba(0, 255, 0, 0.1);
            display: none;
        `;
        
        this.selectionCtx = this.selectionCanvas.getContext('2d');
        
        if (this.targetElement.parentNode) {
            this.targetElement.parentNode.appendChild(this.selectionCanvas);
        }
    }
    
    setupEventListeners() {
        this.targetElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.targetElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.targetElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.targetElement.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Touch events for mobile
        this.targetElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.targetElement.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.targetElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    enable() {
        this.isEnabled = true;
        this.targetElement.style.cursor = 'crosshair';
        console.log('🎯 ROI selection enabled');
    }
    
    disable() {
        this.isEnabled = false;
        this.isSelecting = false;
        this.targetElement.style.cursor = 'default';
        this.hideSelection();
        console.log('🎯 ROI selection disabled');
    }
    
    handleMouseDown(e) {
        if (!this.isEnabled) return;
        
        const rect = this.targetElement.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.isSelecting = true;
        
        this.updateSelection();
    }
    
    handleMouseMove(e) {
        if (!this.isEnabled || !this.isSelecting) return;
        
        const rect = this.targetElement.getBoundingClientRect();
        this.currentX = e.clientX - rect.left;
        this.currentY = e.clientY - rect.top;
        
        this.updateSelection();
    }
    
    handleMouseUp(e) {
        if (!this.isEnabled || !this.isSelecting) return;
        
        this.finishSelection();
    }
    
    handleMouseLeave(e) {
        if (this.isSelecting) {
            this.finishSelection();
        }
    }
    
    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown(touch);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove(touch);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp(e);
    }
    
    updateSelection() {
        const width = Math.abs(this.currentX - this.startX);
        const height = Math.abs(this.currentY - this.startY);
        const left = Math.min(this.startX, this.currentX);
        const top = Math.min(this.startY, this.currentY);
        
        this.selectionCanvas.style.display = 'block';
        this.selectionCanvas.style.left = left + 'px';
        this.selectionCanvas.style.top = top + 'px';
        this.selectionCanvas.width = width;
        this.selectionCanvas.height = height;
    }
    
    finishSelection() {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        
        const width = Math.abs(this.currentX - this.startX);
        const height = Math.abs(this.currentY - this.startY);
        const left = Math.min(this.startX, this.currentX);
        const top = Math.min(this.startY, this.currentY);
        
        // Minimum selection size
        if (width < 10 || height < 10) {
            this.hideSelection();
            return;
        }
        
        this.selectedRegion = { x: left, y: top, width, height };
        
        console.log('🎯 ROI selected:', this.selectedRegion);
        
        if (this.callback) {
            this.callback(this.selectedRegion);
        }
    }
    
    hideSelection() {
        this.selectionCanvas.style.display = 'none';
    }
    
    clearSelection() {
        this.selectedRegion = null;
        this.hideSelection();
        console.log('🎯 ROI selection cleared');
    }
    
    setCallback(callback) {
        this.callback = callback;
    }
    
    getSelection() {
        return this.selectedRegion;
    }
}

/**
 * Enhanced MotionAnalysisEngine - Comprehensive motion analysis
 */
class EnhancedMotionAnalysisEngine {
    constructor() {
        this.results = {
            peakFrequency: 0,
            averageAmplitude: 0,
            motionIntensity: 'Low',
            dominantMotion: 'None',
            motionData: [],
            heatmapData: [],
            spectrumData: [],
            statistics: {},
            timestamp: null
        };
        
        this.analysisHistory = [];
    }
    
    async analyzeMotion(originalFrames, processedFrames) {
        console.log('📊 Starting enhanced motion analysis...');
        
        const startTime = performance.now();
        this.results.timestamp = new Date().toISOString();
        
        try {
            // Parallel analysis for better performance
            await Promise.all([
                this.calculateMotionStatistics(originalFrames, processedFrames),
                this.generateMotionData(originalFrames),
                this.generateHeatmap(processedFrames),
                this.generateSpectrum(originalFrames),
                this.analyzeFrequencyDomain(originalFrames),
                this.calculateSpatialAnalysis(originalFrames)
            ]);
            
            const analysisTime = (performance.now() - startTime).toFixed(2);
            console.log(`✅ Enhanced motion analysis complete in ${analysisTime}ms`);
            
            // Store in history
            this.analysisHistory.push({\n                ...this.results,\n                analysisTime: parseFloat(analysisTime)\n            });\n            \n            // Keep only last 10 analyses\n            if (this.analysisHistory.length > 10) {\n                this.analysisHistory.shift();\n            }\n            \n        } catch (error) {\n            console.error('Motion analysis failed:', error);\n        }\n    }\n    \n    async calculateMotionStatistics(originalFrames, processedFrames) {\n        if (!originalFrames.length || !processedFrames.length) return;\n        \n        let totalMotion = 0;\n        let maxMotion = 0;\n        const motionValues = [];\n        \n        // Calculate frame-to-frame motion\n        for (let i = 1; i < originalFrames.length; i++) {\n            const motion = this.calculateFrameMotion(\n                originalFrames[i-1], \n                originalFrames[i]\n            );\n            \n            motionValues.push(motion);\n            totalMotion += motion;\n            maxMotion = Math.max(maxMotion, motion);\n        }\n        \n        // Statistical calculations\n        const avgMotion = totalMotion / motionValues.length;\n        const variance = motionValues.reduce((sum, val) => \n            sum + Math.pow(val - avgMotion, 2), 0) / motionValues.length;\n        const stdDev = Math.sqrt(variance);\n        \n        // Frequency analysis (simplified)\n        const dominantFreq = this.findDominantFrequency(motionValues);\n        \n        // Update results\n        this.results.peakFrequency = dominantFreq.toFixed(2);\n        this.results.averageAmplitude = avgMotion;\n        this.results.motionIntensity = this.classifyMotionIntensity(avgMotion);\n        this.results.dominantMotion = this.analyzeDominantMotion(motionValues);\n        \n        this.results.statistics = {\n            totalFrames: originalFrames.length,\n            avgMotion: avgMotion.toFixed(4),\n            maxMotion: maxMotion.toFixed(4),\n            stdDev: stdDev.toFixed(4),\n            variance: variance.toFixed(4),\n            dominantFrequency: dominantFreq.toFixed(2)\n        };\n    }\n    \n    calculateFrameMotion(frame1, frame2) {\n        const data1 = frame1.data;\n        const data2 = frame2.data;\n        let totalDiff = 0;\n        let pixelCount = 0;\n        \n        // Sample every 4th pixel for performance\n        for (let i = 0; i < data1.length; i += 16) {\n            const r1 = data1[i], g1 = data1[i+1], b1 = data1[i+2];\n            const r2 = data2[i], g2 = data2[i+1], b2 = data2[i+2];\n            \n            const diff = Math.sqrt(\n                Math.pow(r2 - r1, 2) + \n                Math.pow(g2 - g1, 2) + \n                Math.pow(b2 - b1, 2)\n            );\n            \n            totalDiff += diff;\n            pixelCount++;\n        }\n        \n        return totalDiff / pixelCount / 255.0; // Normalized\n    }\n    \n    findDominantFrequency(motionValues) {\n        // Simple FFT-like analysis for dominant frequency\n        const sampleRate = 30; // Assume 30 FPS\n        const nyquist = sampleRate / 2;\n        \n        // Find peaks in motion data\n        const peaks = [];\n        for (let i = 1; i < motionValues.length - 1; i++) {\n            if (motionValues[i] > motionValues[i-1] && \n                motionValues[i] > motionValues[i+1] && \n                motionValues[i] > 0.1) {\n                peaks.push(i);\n            }\n        }\n        \n        if (peaks.length < 2) return 0;\n        \n        // Calculate average peak interval\n        const intervals = [];\n        for (let i = 1; i < peaks.length; i++) {\n            intervals.push(peaks[i] - peaks[i-1]);\n        }\n        \n        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;\n        return Math.min(sampleRate / avgInterval, nyquist);\n    }\n    \n    classifyMotionIntensity(avgMotion) {\n        if (avgMotion < 0.01) return 'Very Low';\n        if (avgMotion < 0.03) return 'Low';\n        if (avgMotion < 0.06) return 'Medium';\n        if (avgMotion < 0.1) return 'High';\n        return 'Very High';\n    }\n    \n    analyzeDominantMotion(motionValues) {\n        // Analyze motion patterns\n        const trends = [];\n        for (let i = 1; i < motionValues.length; i++) {\n            trends.push(motionValues[i] - motionValues[i-1]);\n        }\n        \n        const increasing = trends.filter(t => t > 0).length;\n        const decreasing = trends.filter(t => t < 0).length;\n        \n        if (increasing > decreasing * 1.5) return 'Increasing';\n        if (decreasing > increasing * 1.5) return 'Decreasing';\n        \n        const variance = trends.reduce((sum, val) => {\n            const mean = trends.reduce((a, b) => a + b, 0) / trends.length;\n            return sum + Math.pow(val - mean, 2);\n        }, 0) / trends.length;\n        \n        if (variance > 0.01) return 'Oscillatory';\n        return 'Steady';\n    }\n    \n    async generateMotionData(frames) {\n        const motionData = [];\n        \n        for (let i = 1; i < frames.length; i++) {\n            const motion = this.calculateFrameMotion(frames[i-1], frames[i]);\n            motionData.push(motion);\n        }\n        \n        // Smooth the data\n        this.results.motionData = this.smoothData(motionData, 3);\n    }\n    \n    smoothData(data, windowSize) {\n        const smoothed = [];\n        const halfWindow = Math.floor(windowSize / 2);\n        \n        for (let i = 0; i < data.length; i++) {\n            let sum = 0;\n            let count = 0;\n            \n            for (let j = Math.max(0, i - halfWindow); \n                 j <= Math.min(data.length - 1, i + halfWindow); j++) {\n                sum += data[j];\n                count++;\n            }\n            \n            smoothed.push(sum / count);\n        }\n        \n        return smoothed;\n    }\n    \n    async generateHeatmap(frames) {\n        if (!frames.length) return;\n        \n        const width = frames[0].width;\n        const height = frames[0].height;\n        const heatmapData = new Array(width * height).fill(0);\n        \n        // Calculate motion intensity per pixel\n        for (let i = 1; i < Math.min(frames.length, 10); i++) {\n            const frame1 = frames[i-1];\n            const frame2 = frames[i];\n            \n            for (let y = 0; y < height; y++) {\n                for (let x = 0; x < width; x++) {\n                    const idx = (y * width + x) * 4;\n                    const heatIdx = y * width + x;\n                    \n                    const r1 = frame1.data[idx], g1 = frame1.data[idx+1], b1 = frame1.data[idx+2];\n                    const r2 = frame2.data[idx], g2 = frame2.data[idx+1], b2 = frame2.data[idx+2];\n                    \n                    const diff = Math.sqrt(\n                        Math.pow(r2 - r1, 2) + \n                        Math.pow(g2 - g1, 2) + \n                        Math.pow(b2 - b1, 2)\n                    ) / 255.0;\n                    \n                    heatmapData[heatIdx] += diff;\n                }\n            }\n        }\n        \n        // Normalize\n        const maxVal = Math.max(...heatmapData);\n        if (maxVal > 0) {\n            for (let i = 0; i < heatmapData.length; i++) {\n                heatmapData[i] /= maxVal;\n            }\n        }\n        \n        this.results.heatmapData = heatmapData;\n    }\n    \n    async generateSpectrum(frames) {\n        const motionData = this.results.motionData;\n        if (!motionData.length) return;\n        \n        // Simple frequency analysis\n        const spectrumData = [];\n        const numBins = 50;\n        const maxFreq = 15; // Hz\n        \n        for (let bin = 0; bin < numBins; bin++) {\n            const freq = (bin / numBins) * maxFreq;\n            let magnitude = 0;\n            \n            // Calculate magnitude for this frequency\n            for (let i = 0; i < motionData.length; i++) {\n                const phase = 2 * Math.PI * freq * i / 30; // 30 FPS\n                magnitude += motionData[i] * Math.cos(phase);\n            }\n            \n            spectrumData.push(Math.abs(magnitude) / motionData.length);\n        }\n        \n        this.results.spectrumData = spectrumData;\n    }\n    \n    async analyzeFrequencyDomain(frames) {\n        // Additional frequency domain analysis\n        console.log('📊 Analyzing frequency domain...');\n    }\n    \n    async calculateSpatialAnalysis(frames) {\n        // Spatial motion pattern analysis\n        console.log('📊 Analyzing spatial patterns...');\n    }\n    \n    getResults() {\n        return this.results;\n    }\n    \n    getHistory() {\n        return this.analysisHistory;\n    }\n    \n    exportResults(format = 'json') {\n        const data = {\n            results: this.results,\n            history: this.analysisHistory,\n            exportTime: new Date().toISOString(),\n            version: '2.0.0'\n        };\n        \n        switch (format.toLowerCase()) {\n            case 'csv':\n                return this.exportToCSV(data);\n            case 'json':\n            default:\n                return JSON.stringify(data, null, 2);\n        }\n    }\n    \n    exportToCSV(data) {\n        const rows = [\n            ['Metric', 'Value'],\n            ['Peak Frequency (Hz)', data.results.peakFrequency],\n            ['Average Amplitude', data.results.averageAmplitude],\n            ['Motion Intensity', data.results.motionIntensity],\n            ['Dominant Motion', data.results.dominantMotion],\n            ['Total Frames', data.results.statistics?.totalFrames || 0],\n            ['Analysis Time', data.exportTime]\n        ];\n        \n        return rows.map(row => row.join(',')).join('\\n');\n    }\n    \n    reset() {\n        this.results = {\n            peakFrequency: 0,\n            averageAmplitude: 0,\n            motionIntensity: 'Low',\n            dominantMotion: 'None',\n            motionData: [],\n            heatmapData: [],\n            spectrumData: [],\n            statistics: {},\n            timestamp: null\n        };\n        \n        console.log('📊 Enhanced motion analysis reset');\n    }\n}\n\n/**\n * Enhanced VideoExportManager - Professional video export capabilities\n */\nclass EnhancedVideoExportManager {\n    constructor() {\n        this.mediaRecorder = null;\n        this.recordedChunks = [];\n        this.isRecording = false;\n        this.recordingStartTime = null;\n        this.supportedFormats = this.detectSupportedFormats();\n    }\n    \n    detectSupportedFormats() {\n        const formats = {\n            webm: MediaRecorder.isTypeSupported('video/webm'),\n            mp4: MediaRecorder.isTypeSupported('video/mp4'),\n            'webm;codecs=vp9': MediaRecorder.isTypeSupported('video/webm;codecs=vp9'),\n            'webm;codecs=vp8': MediaRecorder.isTypeSupported('video/webm;codecs=vp8'),\n            'mp4;codecs=h264': MediaRecorder.isTypeSupported('video/mp4;codecs=h264')\n        };\n        \n        console.log('🎬 Supported video formats:', formats);\n        return formats;\n    }\n    \n    async exportVideo(frames, frameRate, options = {}) {\n        const {\n            format = 'webm',\n            quality = 0.8,\n            width = null,\n            height = null\n        } = options;\n        \n        console.log(`🎬 Exporting ${frames.length} frames as ${format}...`);\n        \n        try {\n            // Method 1: Canvas-based video export\n            if (frames.length > 0) {\n                await this.exportAsCanvasVideo(frames, frameRate, options);\n            } else {\n                throw new Error('No frames to export');\n            }\n        } catch (error) {\n            console.error('Video export failed:', error);\n            // Fallback: Export as image sequence\n            await this.exportAsImageSequence(frames);\n        }\n    }\n    \n    async exportAsCanvasVideo(frames, frameRate, options) {\n        return new Promise((resolve, reject) => {\n            try {\n                const canvas = document.createElement('canvas');\n                const ctx = canvas.getContext('2d');\n                \n                // Set canvas size\n                canvas.width = options.width || frames[0].width;\n                canvas.height = options.height || frames[0].height;\n                \n                // Create video stream from canvas\n                const stream = canvas.captureStream(frameRate);\n                \n                // Setup MediaRecorder\n                const mimeType = this.getBestMimeType(options.format);\n                this.mediaRecorder = new MediaRecorder(stream, {\n                    mimeType: mimeType,\n                    videoBitsPerSecond: 2500000 // 2.5 Mbps\n                });\n                \n                this.recordedChunks = [];\n                \n                this.mediaRecorder.ondataavailable = (event) => {\n                    if (event.data.size > 0) {\n                        this.recordedChunks.push(event.data);\n                    }\n                };\n                \n                this.mediaRecorder.onstop = () => {\n                    const blob = new Blob(this.recordedChunks, { type: mimeType });\n                    this.downloadBlob(blob, `motion_amplified_${Date.now()}.${this.getFileExtension(mimeType)}`);\n                    resolve();\n                };\n                \n                this.mediaRecorder.onerror = (error) => {\n                    console.error('MediaRecorder error:', error);\n                    reject(error);\n                };\n                \n                // Start recording\n                this.mediaRecorder.start();\n                \n                // Render frames\n                let frameIndex = 0;\n                const frameInterval = 1000 / frameRate;\n                \n                const renderFrame = () => {\n                    if (frameIndex >= frames.length) {\n                        this.mediaRecorder.stop();\n                        return;\n                    }\n                    \n                    ctx.putImageData(frames[frameIndex], 0, 0);\n                    frameIndex++;\n                    \n                    setTimeout(renderFrame, frameInterval);\n                };\n                \n                renderFrame();\n                \n            } catch (error) {\n                reject(error);\n            }\n        });\n    }\n    \n    async exportAsImageSequence(frames) {\n        console.log('🖼️ Exporting as image sequence...');\n        \n        for (let i = 0; i < frames.length; i++) {\n            const canvas = document.createElement('canvas');\n            const ctx = canvas.getContext('2d');\n            \n            canvas.width = frames[i].width;\n            canvas.height = frames[i].height;\n            ctx.putImageData(frames[i], 0, 0);\n            \n            await new Promise(resolve => {\n                canvas.toBlob((blob) => {\n                    const frameNumber = String(i).padStart(4, '0');\n                    this.downloadBlob(blob, `motion_frame_${frameNumber}.png`);\n                    resolve();\n                }, 'image/png');\n            });\n            \n            // Small delay to prevent overwhelming the browser\n            if (i % 10 === 0) {\n                await new Promise(resolve => setTimeout(resolve, 100));\n            }\n        }\n        \n        console.log('✅ Image sequence export complete');\n    }\n    \n    getBestMimeType(format) {\n        const preferences = {\n            webm: ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'],\n            mp4: ['video/mp4;codecs=h264', 'video/mp4']\n        };\n        \n        const formatPrefs = preferences[format] || preferences.webm;\n        \n        for (const mimeType of formatPrefs) {\n            if (this.supportedFormats[mimeType]) {\n                return mimeType;\n            }\n        }\n        \n        // Fallback\n        return 'video/webm';\n    }\n    \n    getFileExtension(mimeType) {\n        if (mimeType.includes('mp4')) return 'mp4';\n        if (mimeType.includes('webm')) return 'webm';\n        return 'video';\n    }\n    \n    downloadBlob(blob, filename) {\n        const url = URL.createObjectURL(blob);\n        const a = document.createElement('a');\n        a.href = url;\n        a.download = filename;\n        document.body.appendChild(a);\n        a.click();\n        document.body.removeChild(a);\n        URL.revokeObjectURL(url);\n    }\n    \n    startRecording(canvas, options = {}) {\n        if (this.isRecording) {\n            console.warn('Recording already in progress');\n            return;\n        }\n        \n        try {\n            const stream = canvas.captureStream(options.frameRate || 30);\n            const mimeType = this.getBestMimeType(options.format || 'webm');\n            \n            this.mediaRecorder = new MediaRecorder(stream, {\n                mimeType: mimeType,\n                videoBitsPerSecond: options.bitrate || 2500000\n            });\n            \n            this.recordedChunks = [];\n            this.recordingStartTime = Date.now();\n            \n            this.mediaRecorder.ondataavailable = (event) => {\n                if (event.data.size > 0) {\n                    this.recordedChunks.push(event.data);\n                }\n            };\n            \n            this.mediaRecorder.start();\n            this.isRecording = true;\n            \n            console.log('🔴 Recording started');\n            \n        } catch (error) {\n            console.error('Failed to start recording:', error);\n        }\n    }\n    \n    stopRecording() {\n        if (!this.isRecording || !this.mediaRecorder) {\n            console.warn('No recording in progress');\n            return;\n        }\n        \n        return new Promise((resolve) => {\n            this.mediaRecorder.onstop = () => {\n                const mimeType = this.mediaRecorder.mimeType;\n                const blob = new Blob(this.recordedChunks, { type: mimeType });\n                const duration = (Date.now() - this.recordingStartTime) / 1000;\n                \n                this.downloadBlob(blob, `motion_recording_${Date.now()}.${this.getFileExtension(mimeType)}`);\n                \n                console.log(`✅ Recording stopped. Duration: ${duration.toFixed(1)}s`);\n                \n                this.isRecording = false;\n                this.recordingStartTime = null;\n                resolve();\n            };\n            \n            this.mediaRecorder.stop();\n        });\n    }\n    \n    getRecordingStatus() {\n        return {\n            isRecording: this.isRecording,\n            duration: this.recordingStartTime ? (Date.now() - this.recordingStartTime) / 1000 : 0,\n            supportedFormats: this.supportedFormats\n        };\n    }\n}\n\n// Export classes for use\nif (typeof window !== 'undefined') {\n    window.EnhancedWebcamManager = EnhancedWebcamManager;\n    window.EnhancedROISelector = EnhancedROISelector;\n    window.EnhancedMotionAnalysisEngine = EnhancedMotionAnalysisEngine;\n    window.EnhancedVideoExportManager = EnhancedVideoExportManager;\n}\n\nconsole.log('✅ Enhanced supporting classes loaded successfully!');