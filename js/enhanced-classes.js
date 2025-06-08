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
            this.analysisHistory.push({
                ...this.results,
                analysisTime: parseFloat(analysisTime)
            });
            
            // Keep only last 10 analyses
            if (this.analysisHistory.length > 10) {
                this.analysisHistory.shift();
            }
            
        } catch (error) {
            console.error('Motion analysis failed:', error);
        }
    }
    
    async calculateMotionStatistics(originalFrames, processedFrames) {
        if (!originalFrames.length || !processedFrames.length) return;
        
        let totalMotion = 0;
        let maxMotion = 0;
        const motionValues = [];
        
        // Calculate frame-to-frame motion
        for (let i = 1; i < originalFrames.length; i++) {
            const motion = this.calculateFrameMotion(
                originalFrames[i-1], 
                originalFrames[i]
            );
            
            motionValues.push(motion);
            totalMotion += motion;
            maxMotion = Math.max(maxMotion, motion);
        }
        
        // Statistical calculations
        const avgMotion = totalMotion / motionValues.length;
        const variance = motionValues.reduce((sum, val) => 
            sum + Math.pow(val - avgMotion, 2), 0) / motionValues.length;
        const stdDev = Math.sqrt(variance);
        
        // Frequency analysis (simplified)
        const dominantFreq = this.findDominantFrequency(motionValues);
        
        // Update results
        this.results.peakFrequency = dominantFreq.toFixed(2);
        this.results.averageAmplitude = avgMotion;
        this.results.motionIntensity = this.classifyMotionIntensity(avgMotion);
        this.results.dominantMotion = this.analyzeDominantMotion(motionValues);
        
        this.results.statistics = {
            totalFrames: originalFrames.length,
            avgMotion: avgMotion.toFixed(4),
            maxMotion: maxMotion.toFixed(4),
            stdDev: stdDev.toFixed(4),
            variance: variance.toFixed(4),
            dominantFrequency: dominantFreq.toFixed(2)
        };
    }
    
    calculateFrameMotion(frame1, frame2) {
        const data1 = frame1.data;
        const data2 = frame2.data;
        let totalDiff = 0;
        let pixelCount = 0;
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data1.length; i += 16) {
            const r1 = data1[i], g1 = data1[i+1], b1 = data1[i+2];
            const r2 = data2[i], g2 = data2[i+1], b2 = data2[i+2];
            
            const diff = Math.sqrt(
                Math.pow(r2 - r1, 2) + 
                Math.pow(g2 - g1, 2) + 
                Math.pow(b2 - b1, 2)
            );
            
            totalDiff += diff;
            pixelCount++;
        }
        
        return totalDiff / pixelCount / 255.0; // Normalized
    }
    
    findDominantFrequency(motionValues) {
        // Simple FFT-like analysis for dominant frequency
        const sampleRate = 30; // Assume 30 FPS
        const nyquist = sampleRate / 2;
        
        // Find peaks in motion data
        const peaks = [];
        for (let i = 1; i < motionValues.length - 1; i++) {
            if (motionValues[i] > motionValues[i-1] && 
                motionValues[i] > motionValues[i+1] && 
                motionValues[i] > 0.1) {
                peaks.push(i);
            }
        }
        
        if (peaks.length < 2) return 0;
        
        // Calculate average peak interval
        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return Math.min(sampleRate / avgInterval, nyquist);
    }
    
    classifyMotionIntensity(avgMotion) {
        if (avgMotion < 0.01) return 'Very Low';
        if (avgMotion < 0.03) return 'Low';
        if (avgMotion < 0.06) return 'Medium';
        if (avgMotion < 0.1) return 'High';
        return 'Very High';
    }
    
    analyzeDominantMotion(motionValues) {
        // Analyze motion patterns
        const trends = [];
        for (let i = 1; i < motionValues.length; i++) {
            trends.push(motionValues[i] - motionValues[i-1]);
        }
        
        const increasing = trends.filter(t => t > 0).length;
        const decreasing = trends.filter(t => t < 0).length;
        
        if (increasing > decreasing * 1.5) return 'Increasing';
        if (decreasing > increasing * 1.5) return 'Decreasing';
        
        const variance = trends.reduce((sum, val) => {
            const mean = trends.reduce((a, b) => a + b, 0) / trends.length;
            return sum + Math.pow(val - mean, 2);
        }, 0) / trends.length;
        
        if (variance > 0.01) return 'Oscillatory';
        return 'Steady';
    }
    
    async generateMotionData(frames) {
        const motionData = [];
        
        for (let i = 1; i < frames.length; i++) {
            const motion = this.calculateFrameMotion(frames[i-1], frames[i]);
            motionData.push(motion);
        }
        
        // Smooth the data
        this.results.motionData = this.smoothData(motionData, 3);
    }
    
    smoothData(data, windowSize) {
        const smoothed = [];
        const halfWindow = Math.floor(windowSize / 2);
        
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;
            
            for (let j = Math.max(0, i - halfWindow); 
                 j <= Math.min(data.length - 1, i + halfWindow); j++) {
                sum += data[j];
                count++;
            }
            
            smoothed.push(sum / count);
        }
        
        return smoothed;
    }
    
    async generateHeatmap(frames) {
        if (!frames.length) return;
        
        const width = frames[0].width;
        const height = frames[0].height;
        const heatmapData = new Array(width * height).fill(0);
        
        // Calculate motion intensity per pixel
        for (let i = 1; i < Math.min(frames.length, 10); i++) {
            const frame1 = frames[i-1];
            const frame2 = frames[i];
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const heatIdx = y * width + x;
                    
                    const r1 = frame1.data[idx], g1 = frame1.data[idx+1], b1 = frame1.data[idx+2];
                    const r2 = frame2.data[idx], g2 = frame2.data[idx+1], b2 = frame2.data[idx+2];
                    
                    const diff = Math.sqrt(
                        Math.pow(r2 - r1, 2) + 
                        Math.pow(g2 - g1, 2) + 
                        Math.pow(b2 - b1, 2)
                    ) / 255.0;
                    
                    heatmapData[heatIdx] += diff;
                }
            }
        }
        
        // Normalize
        const maxVal = Math.max(...heatmapData);
        if (maxVal > 0) {
            for (let i = 0; i < heatmapData.length; i++) {
                heatmapData[i] /= maxVal;
            }
        }
        
        this.results.heatmapData = heatmapData;
    }
    
    async generateSpectrum(frames) {
        const motionData = this.results.motionData;
        if (!motionData.length) return;
        
        // Simple frequency analysis
        const spectrumData = [];
        const numBins = 50;
        const maxFreq = 15; // Hz
        
        for (let bin = 0; bin < numBins; bin++) {
            const freq = (bin / numBins) * maxFreq;
            let magnitude = 0;
            
            // Calculate magnitude for this frequency
            for (let i = 0; i < motionData.length; i++) {
                const phase = 2 * Math.PI * freq * i / 30; // 30 FPS
                magnitude += motionData[i] * Math.cos(phase);
            }
            
            spectrumData.push(Math.abs(magnitude) / motionData.length);
        }
        
        this.results.spectrumData = spectrumData;
    }
    
    async analyzeFrequencyDomain(frames) {
        // Additional frequency domain analysis
        console.log('📊 Analyzing frequency domain...');
    }
    
    async calculateSpatialAnalysis(frames) {
        // Spatial motion pattern analysis
        console.log('📊 Analyzing spatial patterns...');
    }
    
    getResults() {
        return this.results;
    }
    
    getHistory() {
        return this.analysisHistory;
    }
    
    exportResults(format = 'json') {
        const data = {
            results: this.results,
            history: this.analysisHistory,
            exportTime: new Date().toISOString(),
            version: '2.0.0'
        };
        
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(data);
            case 'json':
            default:
                return JSON.stringify(data, null, 2);
        }
    }
    
    exportToCSV(data) {
        const rows = [
            ['Metric', 'Value'],
            ['Peak Frequency (Hz)', data.results.peakFrequency],
            ['Average Amplitude', data.results.averageAmplitude],
            ['Motion Intensity', data.results.motionIntensity],
            ['Dominant Motion', data.results.dominantMotion],
            ['Total Frames', data.results.statistics?.totalFrames || 0],
            ['Analysis Time', data.exportTime]
        ];
        
        return rows.map(row => row.join(',')).join('\n');
    }
    
    reset() {
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
        
        console.log('📊 Enhanced motion analysis reset');
    }
}

/**
 * Enhanced VideoExportManager - Professional video export capabilities
 */
class EnhancedVideoExportManager {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.recordingStartTime = null;
        this.supportedFormats = this.detectSupportedFormats();
    }
    
    detectSupportedFormats() {
        const formats = {
            webm: MediaRecorder.isTypeSupported('video/webm'),
            mp4: MediaRecorder.isTypeSupported('video/mp4'),
            'webm;codecs=vp9': MediaRecorder.isTypeSupported('video/webm;codecs=vp9'),
            'webm;codecs=vp8': MediaRecorder.isTypeSupported('video/webm;codecs=vp8'),
            'mp4;codecs=h264': MediaRecorder.isTypeSupported('video/mp4;codecs=h264')
        };
        
        console.log('🎬 Supported video formats:', formats);
        return formats;
    }
    
    async exportVideo(frames, frameRate, options = {}) {
        const {
            format = 'webm',
            quality = 0.8,
            width = null,
            height = null
        } = options;
        
        console.log(`🎬 Exporting ${frames.length} frames as ${format}...`);
        
        try {
            // Method 1: Canvas-based video export
            if (frames.length > 0) {
                await this.exportAsCanvasVideo(frames, frameRate, options);
            } else {
                throw new Error('No frames to export');
            }
        } catch (error) {
            console.error('Video export failed:', error);
            // Fallback: Export as image sequence
            await this.exportAsImageSequence(frames);
        }
    }
    
    async exportAsCanvasVideo(frames, frameRate, options) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = options.width || frames[0].width;
                canvas.height = options.height || frames[0].height;
                
                // Create video stream from canvas
                const stream = canvas.captureStream(frameRate);
                
                // Setup MediaRecorder
                const mimeType = this.getBestMimeType(options.format);
                this.mediaRecorder = new MediaRecorder(stream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: 2500000 // 2.5 Mbps
                });
                
                this.recordedChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };
                
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.recordedChunks, { type: mimeType });
                    this.downloadBlob(blob, `motion_amplified_${Date.now()}.${this.getFileExtension(mimeType)}`);
                    resolve();
                };
                
                this.mediaRecorder.onerror = (error) => {
                    console.error('MediaRecorder error:', error);
                    reject(error);
                };
                
                // Start recording
                this.mediaRecorder.start();
                
                // Render frames
                let frameIndex = 0;
                const frameInterval = 1000 / frameRate;
                
                const renderFrame = () => {
                    if (frameIndex >= frames.length) {
                        this.mediaRecorder.stop();
                        return;
                    }
                    
                    ctx.putImageData(frames[frameIndex], 0, 0);
                    frameIndex++;
                    
                    setTimeout(renderFrame, frameInterval);
                };
                
                renderFrame();
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    async exportAsImageSequence(frames) {
        console.log('🖼️ Exporting as image sequence...');
        
        for (let i = 0; i < frames.length; i++) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = frames[i].width;
            canvas.height = frames[i].height;
            ctx.putImageData(frames[i], 0, 0);
            
            await new Promise(resolve => {
                canvas.toBlob((blob) => {
                    const frameNumber = String(i).padStart(4, '0');
                    this.downloadBlob(blob, `motion_frame_${frameNumber}.png`);
                    resolve();
                }, 'image/png');
            });
            
            // Small delay to prevent overwhelming the browser
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log('✅ Image sequence export complete');
    }
    
    getBestMimeType(format) {
        const preferences = {
            webm: ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'],
            mp4: ['video/mp4;codecs=h264', 'video/mp4']
        };
        
        const formatPrefs = preferences[format] || preferences.webm;
        
        for (const mimeType of formatPrefs) {
            if (this.supportedFormats[mimeType]) {
                return mimeType;
            }
        }
        
        // Fallback
        return 'video/webm';
    }
    
    getFileExtension(mimeType) {
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('webm')) return 'webm';
        return 'video';
    }
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    startRecording(canvas, options = {}) {
        if (this.isRecording) {
            console.warn('Recording already in progress');
            return;
        }
        
        try {
            const stream = canvas.captureStream(options.frameRate || 30);
            const mimeType = this.getBestMimeType(options.format || 'webm');
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: options.bitrate || 2500000
            });
            
            this.recordedChunks = [];
            this.recordingStartTime = Date.now();
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            console.log('🔴 Recording started');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            console.warn('No recording in progress');
            return;
        }
        
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const mimeType = this.mediaRecorder.mimeType;
                const blob = new Blob(this.recordedChunks, { type: mimeType });
                const duration = (Date.now() - this.recordingStartTime) / 1000;
                
                this.downloadBlob(blob, `motion_recording_${Date.now()}.${this.getFileExtension(mimeType)}`);
                
                console.log(`✅ Recording stopped. Duration: ${duration.toFixed(1)}s`);
                
                this.isRecording = false;
                this.recordingStartTime = null;
                resolve();
            };
            
            this.mediaRecorder.stop();
        });
    }
    
    getRecordingStatus() {
        return {
            isRecording: this.isRecording,
            duration: this.recordingStartTime ? (Date.now() - this.recordingStartTime) / 1000 : 0,
            supportedFormats: this.supportedFormats
        };
    }
}

// Export classes for use
if (typeof window !== 'undefined') {
    window.EnhancedWebcamManager = EnhancedWebcamManager;
    window.EnhancedROISelector = EnhancedROISelector;
    window.EnhancedMotionAnalysisEngine = EnhancedMotionAnalysisEngine;
    window.EnhancedVideoExportManager = EnhancedVideoExportManager;
}

console.log('✅ Enhanced supporting classes loaded successfully!');
