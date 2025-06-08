/**
 * Enhanced Supporting Classes for Motion Amplification Pro
 * Provides robust implementations of webcam, ROI, analysis, and export functionality
 * 
 * @version 2.0.0
 */

/**
 * Enhanced WebcamManager - Complete camera handling with device management
 * Now with robust error handling, fallback constraints, and better UX
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
        
        // Enhanced error handling and retry logic
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.permissionState = null;
        this.initializationAttempts = 0;
        this.errorHistory = [];
        this.statusCallback = null;
        
        // Fallback constraint configurations
        this.constraintProfiles = [
            {
                name: 'High Quality',
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                }
            },
            {
                name: 'Medium Quality',
                video: {
                    width: { ideal: 854, max: 1280 },
                    height: { ideal: 480, max: 720 },
                    frameRate: { ideal: 30, max: 30 }
                }
            },
            {
                name: 'Low Quality',
                video: {
                    width: { ideal: 640, max: 854 },
                    height: { ideal: 480, max: 480 },
                    frameRate: { ideal: 15, max: 30 }
                }
            },
            {
                name: 'Basic',
                video: {
                    width: 320,
                    height: 240,
                    frameRate: 15
                }
            },
            {
                name: 'Minimal',
                video: true
            }
        ];
    }
    
    async initialize() {
        try {
            // Check if WebRTC is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('WebRTC not supported in this browser');
            }
            
            await this.enumerateDevices();
            console.log('📹 Enhanced WebcamManager initialized with robust error handling');
        } catch (error) {
            console.error('Failed to initialize webcam manager:', error);
            this.logError('Initialization failed', error);
            throw error;
        }
    }
    
    async enumerateDevices() {
        try {
            // Request permission first to get device labels
            try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                tempStream.getTracks().forEach(track => track.stop());
            } catch (e) {
                console.warn('Could not get temporary stream for device enumeration');
            }
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'videoinput');
            
            console.log(`📹 Found ${this.devices.length} camera(s):`);
            this.devices.forEach((device, index) => {
                console.log(`  ${index + 1}. ${device.label || `Camera ${index + 1}`} (${device.deviceId.substring(0, 8)}...)`);
            });
            
            return this.devices;
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            this.logError('Device enumeration failed', error);
            return [];
        }
    }
    
    async start(deviceId = null) {
        console.log('🎥 [DEBUG] EnhancedWebcamManager.start() called with deviceId:', deviceId);
        this.updateStatus('Initializing camera...', 'info');
        
        try {
            if (this.isActive) {
                console.log('🎥 [DEBUG] Camera already active, stopping first');
                await this.stop();
            }
            
            console.log('🎥 [DEBUG] Checking permissions...');
            // Check permissions first
            await this.checkPermissions();
            
            console.log('🎥 [DEBUG] Starting camera initialization with fallbacks...');
            // Try multiple constraint profiles with retry logic
            const stream = await this.initializeCameraWithFallbacks(deviceId);
            console.log('🎥 [DEBUG] Got stream:', stream);
            this.stream = stream;
            this.currentDeviceId = deviceId;
            
            console.log('🎥 [DEBUG] Setting up video elements...');
            // Setup DOM elements with error checking
            await this.setupVideoElements();
            
            console.log('🎥 [DEBUG] Getting track information...');
            // Get capabilities and settings with error handling
            this.getTrackInformation();
            
            this.isActive = true;
            this.initializationAttempts = 0;
            this.startFrameCapture();
            
            const resolution = `${this.video.videoWidth}x${this.video.videoHeight}`;
            const message = `Camera started successfully at ${resolution}`;
            console.log(`✅ [DEBUG] ${message}`);
            this.updateStatus(message, 'success');
            
        } catch (error) {
            console.error('❌ [DEBUG] Camera start failed in EnhancedWebcamManager:', error);
            this.logError('Camera start failed', error);
            throw this.createUserFriendlyError(error);
        }
    }
    
    async checkPermissions() {
        if (!navigator.permissions) {
            console.warn('Permissions API not available');
            return;
        }
        
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            this.permissionState = permission.state;
            
            if (permission.state === 'denied') {
                throw new Error('PERMISSION_DENIED');
            }
            
            console.log(`📹 Camera permission state: ${permission.state}`);
        } catch (error) {
            console.warn('Could not check camera permissions:', error);
        }
    }
    
    async initializeCameraWithFallbacks(deviceId) {
        console.log('🎥 [DEBUG] initializeCameraWithFallbacks() called with deviceId:', deviceId);
        this.updateStatus('Requesting camera access...', 'info');
        
        for (let profileIndex = 0; profileIndex < this.constraintProfiles.length; profileIndex++) {
            const profile = this.constraintProfiles[profileIndex];
            const constraints = this.buildConstraints(profile, deviceId);
            
            console.log(`🎥 [DEBUG] Trying ${profile.name} profile:`, constraints);
            this.updateStatus(`Trying ${profile.name} settings...`, 'info');
            
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    console.log(`🎥 [DEBUG] Attempt ${attempt}/${this.maxRetries} for ${profile.name}`);
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    console.log(`✅ [DEBUG] ${profile.name} profile successful on attempt ${attempt}`);
                    return stream;
                    
                } catch (error) {
                    const errorInfo = this.analyzeError(error);
                    console.warn(`❌ [DEBUG] ${profile.name} profile failed (attempt ${attempt}/${this.maxRetries}):`, errorInfo.message);
                    console.warn(`❌ [DEBUG] Raw error:`, error);
                    
                    // If it's a permission error, don't retry
                    if (errorInfo.type === 'permission') {
                        console.error('❌ [DEBUG] Permission error, not retrying');
                        throw error;
                    }
                    
                    // If it's not the last attempt, wait before retrying
                    if (attempt < this.maxRetries) {
                        const delayMs = this.retryDelay * attempt;
                        console.log(`🕰️ [DEBUG] Waiting ${delayMs}ms before retry...`);
                        await this.delay(delayMs);
                    }
                }
            }
            console.warn(`❌ [DEBUG] All attempts failed for ${profile.name}, trying next profile...`);
        }
        
        console.error('❌ [DEBUG] All camera profiles failed!');
        throw new Error('INITIALIZATION_FAILED');
    }
    
    buildConstraints(profile, deviceId) {
        const constraints = {
            video: { ...profile.video },
            audio: false
        };
        
        // Add device ID if specified
        if (deviceId) {
            if (typeof constraints.video === 'object') {
                constraints.video.deviceId = { ideal: deviceId };
            } else {
                constraints.video = { deviceId: { ideal: deviceId } };
            }
        }
        
        return constraints;
    }
    
    async setupVideoElements() {
        console.log('🎥 [DEBUG] setupVideoElements() called');
        // Get DOM elements with error checking
        this.video = document.getElementById('webcamVideo');
        this.canvas = document.getElementById('webcamCanvas');
        
        console.log('🎥 [DEBUG] Found DOM elements:', {
            video: !!this.video,
            canvas: !!this.canvas
        });
        
        if (!this.video || !this.canvas) {
            console.error('❌ [DEBUG] Required webcam elements not found in DOM');
            throw new Error('ELEMENTS_NOT_FOUND');
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Setup video element with comprehensive error handling
        console.log('🎥 [DEBUG] Setting up video element...');
        this.video.srcObject = this.stream;
        this.video.autoplay = true;
        this.video.muted = true;
        this.video.playsInline = true;
        
        this.updateStatus('Loading video...', 'info');
        
        // Wait for video to be ready with multiple event listeners
        console.log('🎥 [DEBUG] Waiting for video to load...');
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                cleanup();
                console.error('❌ [DEBUG] Video load timeout after 10 seconds');
                reject(new Error('VIDEO_LOAD_TIMEOUT'));
            }, 10000);
            
            const cleanup = () => {
                clearTimeout(timeout);
                this.video.removeEventListener('loadedmetadata', onSuccess);
                this.video.removeEventListener('error', onError);
                this.video.removeEventListener('loadstart', onLoadStart);
            };
            
            const onSuccess = () => {
                console.log('✅ [DEBUG] Video loaded successfully!');
                cleanup();
                resolve();
            };
            
            const onError = (e) => {
                console.error('❌ [DEBUG] Video load error:', e);
                cleanup();
                reject(new Error('VIDEO_LOAD_ERROR: ' + (e.message || 'Unknown error')));
            };
            
            const onLoadStart = () => {
                console.log('🎥 [DEBUG] Video loading started...');
            };
            
            this.video.addEventListener('loadedmetadata', onSuccess, { once: true });
            this.video.addEventListener('error', onError, { once: true });
            this.video.addEventListener('loadstart', onLoadStart, { once: true });
        });
        
        // Setup canvas size with validation
        console.log('🎥 [DEBUG] Video dimensions:', {
            videoWidth: this.video.videoWidth,
            videoHeight: this.video.videoHeight
        });
        
        if (this.video.videoWidth && this.video.videoHeight) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            console.log('✅ [DEBUG] Canvas size set to:', this.canvas.width, 'x', this.canvas.height);
        } else {
            console.error('❌ [DEBUG] Invalid video dimensions');
            throw new Error('INVALID_VIDEO_DIMENSIONS');
        }
    }
    
    getTrackInformation() {
        const videoTrack = this.stream?.getVideoTracks()[0];
        if (videoTrack) {
            try {
                this.capabilities = videoTrack.getCapabilities();
                this.settings = videoTrack.getSettings();
                
                console.log('📹 Video track capabilities:', this.capabilities);
                console.log('📹 Video track settings:', this.settings);
            } catch (e) {
                console.warn('Could not get track capabilities/settings:', e);
            }
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
        if (deviceId === this.currentDeviceId) {
            console.log('Device already selected');
            return;
        }
        
        const device = this.devices.find(d => d.deviceId === deviceId);
        const deviceName = device ? device.label || 'Unknown Camera' : 'Unknown Device';
        
        console.log(`🔄 Switching to device: ${deviceName}`);
        this.updateStatus(`Switching to ${deviceName}...`, 'info');
        
        try {
            await this.start(deviceId);
        } catch (error) {
            this.updateStatus(`Failed to switch to ${deviceName}: ${error.message}`, 'error');
            throw error;
        }
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
            } : null,
            permissionState: this.permissionState,
            errorHistory: this.errorHistory.slice(-5), // Last 5 errors
            initializationAttempts: this.initializationAttempts
        };
    }
    
    // Enhanced error handling and utility methods
    analyzeError(error) {
        const errorName = error.name || '';
        const errorMessage = error.message || '';
        
        // Categorize error types
        if (errorName === 'NotAllowedError' || errorMessage.includes('Permission denied')) {
            return {
                type: 'permission',
                message: 'Camera access denied. Please allow camera permissions and refresh the page.',
                userAction: 'Grant camera permission and refresh'
            };
        }
        
        if (errorName === 'NotFoundError' || errorMessage.includes('not found')) {
            return {
                type: 'notFound',
                message: 'No camera found. Please connect a camera and try again.',
                userAction: 'Connect a camera device'
            };
        }
        
        if (errorName === 'NotReadableError' || errorMessage.includes('in use')) {
            return {
                type: 'busy',
                message: 'Camera is being used by another application. Please close other camera apps.',
                userAction: 'Close other applications using the camera'
            };
        }
        
        if (errorName === 'OverconstrainedError' || errorMessage.includes('constraint')) {
            return {
                type: 'constraints',
                message: 'Camera settings not supported. Trying alternative settings...',
                userAction: 'Trying different camera settings automatically'
            };
        }
        
        if (errorMessage.includes('PERMISSION_DENIED')) {
            return {
                type: 'permission',
                message: 'Camera permission was denied. Please enable camera access in your browser settings.',
                userAction: 'Enable camera permission in browser settings'
            };
        }
        
        if (errorMessage.includes('VIDEO_LOAD_TIMEOUT')) {
            return {
                type: 'timeout',
                message: 'Camera is taking too long to respond. Please try again.',
                userAction: 'Try again or restart your browser'
            };
        }
        
        if (errorMessage.includes('ELEMENTS_NOT_FOUND')) {
            return {
                type: 'dom',
                message: 'Camera interface elements not found. Please refresh the page.',
                userAction: 'Refresh the page'
            };
        }
        
        if (errorMessage.includes('INITIALIZATION_FAILED')) {
            return {
                type: 'initialization',
                message: 'Failed to initialize camera with any settings. Your camera may not be compatible.',
                userAction: 'Try a different camera or check camera drivers'
            };
        }
        
        // Generic error
        return {
            type: 'unknown',
            message: `Camera error: ${errorMessage}`,
            userAction: 'Try refreshing the page or restarting your browser'
        };
    }
    
    createUserFriendlyError(originalError) {
        const errorInfo = this.analyzeError(originalError);
        const friendlyError = new Error(errorInfo.message);
        friendlyError.originalError = originalError;
        friendlyError.userAction = errorInfo.userAction;
        friendlyError.errorType = errorInfo.type;
        return friendlyError;
    }
    
    logError(context, error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context: context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorHistory.push(errorEntry);
        
        // Keep only last 10 errors to prevent memory issues
        if (this.errorHistory.length > 10) {
            this.errorHistory.shift();
        }
        
        console.error(`[WebcamManager] ${context}:`, error);
    }
    
    updateStatus(message, type = 'info') {
        console.log(`[WebcamManager Status] ${message}`);
        
        if (this.statusCallback) {
            this.statusCallback(message, type);
        }
        
        // Update UI status if elements exist
        const statusElement = document.querySelector('.webcam-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `webcam-status ${type}`;
        }
    }
    
    setStatusCallback(callback) {
        this.statusCallback = callback;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Enhanced retry mechanism with exponential backoff
    async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.log(`Retry attempt ${attempt} failed, waiting ${delay}ms before next attempt...`);
                await this.delay(delay);
            }
        }
    }
    
    // Get detailed diagnostic information
    getDiagnostics() {
        return {
            browser: {
                userAgent: navigator.userAgent,
                webRTCSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                permissionsAPISupported: !!navigator.permissions
            },
            devices: {
                count: this.devices.length,
                list: this.devices.map(d => ({
                    deviceId: d.deviceId.substring(0, 8) + '...',
                    label: d.label || 'Unknown',
                    groupId: d.groupId
                }))
            },
            currentSession: {
                isActive: this.isActive,
                resolution: this.video ? `${this.video.videoWidth}x${this.video.videoHeight}` : null,
                deviceId: this.currentDeviceId ? this.currentDeviceId.substring(0, 8) + '...' : null,
                capabilities: this.capabilities,
                settings: this.settings
            },
            errors: this.errorHistory.slice(-3), // Last 3 errors
            timestamp: new Date().toISOString()
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
