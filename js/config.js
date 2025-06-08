/**
 * Motion Amplification Pro - Configuration
 * Centralized configuration for easy customization
 * 
 * @version 2.0.0
 */

window.MotionAmpConfig = {
    // Application Settings
    app: {
        name: "Motion Amplification Pro",
        version: "2.0.0",
        debugMode: false, // Set to true for development
        analyticsEnabled: false, // Set to true to enable analytics
        maxRetries: 3,
        timeout: 30000 // 30 seconds
    },

    // Performance Settings
    performance: {
        maxVideoSizeMB: {
            withGPU: 500,     // 500MB with GPU acceleration
            withoutGPU: 100   // 100MB without GPU acceleration
        },
        maxVideoDurationSeconds: {
            withGPU: 120,     // 2 minutes with GPU
            withoutGPU: 30    // 30 seconds without GPU
        },
        maxResolution: {
            withGPU: { width: 1920, height: 1080 },
            withoutGPU: { width: 1280, height: 720 }
        },
        frameProcessingBatchSize: 10,
        yieldControlInterval: 5, // frames
        memoryCleanupInterval: 30000 // 30 seconds
    },

    // Default Processing Parameters
    defaults: {
        amplification: 15,
        freqLow: 0.5,
        freqHigh: 3.0,
        pyramidLevels: 6,
        sigma: 1.5,
        chromaThreshold: 0.05,
        frameRate: 30
    },

    // Webcam Settings
    webcam: {
        defaultConstraints: {
            video: {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 }
            },
            audio: false
        },
        fallbackConstraints: [
            { video: { width: 640, height: 480, frameRate: 30 } },
            { video: { width: 320, height: 240, frameRate: 15 } },
            { video: true }
        ],
        retryDelay: 1000,
        maxRetries: 3,
        permissionTimeout: 10000
    },

    // WebGL Settings
    webgl: {
        enabled: true,
        fallbackToCPU: true,
        maxTextureSize: null, // Auto-detect
        preferredShaderPrecision: 'mediump',
        enableDebugging: false
    },

    // UI Settings
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
        progressUpdateInterval: 100,
        theme: 'dark', // 'light' or 'dark'
        showAdvancedControls: true,
        enableKeyboardShortcuts: true
    },

    // Export Settings
    export: {
        defaultFormat: 'webm',
        supportedFormats: ['webm', 'mp4'],
        quality: 0.9,
        frameRate: 30,
        maxExportSizeMB: 100
    },

    // Cache Settings
    cache: {
        enabled: true,
        maxSizeMB: 50,
        ttlHours: 24,
        cleanupInterval: 3600000 // 1 hour
    },

    // Error Handling
    errorHandling: {
        enableReporting: false, // Set to true to enable error reporting
        maxErrorLogSize: 100,
        enableUserFeedback: true,
        showDetailedErrors: false // Show only in debug mode
    },

    // Security Settings
    security: {
        enableCSP: true,
        allowedOrigins: ['*'], // For development - restrict in production
        maxFileSize: 1000 * 1024 * 1024, // 1GB absolute maximum
        enableSanitization: true
    },

    // Analytics (placeholder for future use)
    analytics: {
        provider: null, // 'google', 'matomo', etc.
        trackingId: null,
        enablePerformanceTracking: false,
        enableErrorTracking: false,
        respectDoNotTrack: true
    },

    // PWA Settings
    pwa: {
        enableInstallPrompt: true,
        enableBackgroundSync: true,
        enableNotifications: false, // Requires user permission
        enableOfflineMode: true,
        cacheStrategy: 'cache-first'
    },

    // Development Settings (only used when debugMode is true)
    development: {
        enableConsoleLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        enablePerformanceMonitoring: true,
        showMemoryUsage: true,
        enableTestMode: false
    },

    // Feature Flags
    features: {
        enableGPUProcessing: true,
        enableRealTimeProcessing: true,
        enableROISelection: true,
        enableVideoExport: true,
        enableMotionAnalysis: true,
        enableWebcamRecording: true,
        enableBackgroundProcessing: true,
        enableAdvancedPresets: true
    },

    // API Endpoints (for future server integration)
    api: {
        baseUrl: null, // Set to enable server-side processing
        endpoints: {
            process: '/api/process',
            analyze: '/api/analyze',
            export: '/api/export'
        },
        timeout: 60000,
        retries: 3
    },

    // Validation Rules
    validation: {
        amplification: { min: 1, max: 100 },
        frequency: { min: 0.1, max: 20 },
        pyramidLevels: { min: 2, max: 10 },
        sigma: { min: 0.1, max: 5 },
        chromaThreshold: { min: 0.001, max: 0.5 }
    },

    // Keyboard Shortcuts
    shortcuts: {
        processVideo: 'ctrl+p',
        playPause: 'space',
        exportFrame: 'ctrl+s',
        toggleGPU: 'ctrl+g',
        toggleROI: 'ctrl+r',
        openAnalysis: 'ctrl+a'
    },

    // Presets Configuration
    presets: {
        // Heartbeat detection optimized for facial videos
        heartbeat: {
            name: "💓 Heartbeat Detection",
            amplification: 25,
            freqLow: 0.8,
            freqHigh: 3.5,
            pyramidLevels: 6,
            sigma: 1.8,
            chromaThreshold: 0.03,
            description: "Optimized for detecting cardiovascular pulse in facial videos"
        },
        
        // Breathing analysis for chest movement
        breathing: {
            name: "🫁 Breathing Analysis",
            amplification: 18,
            freqLow: 0.1,
            freqHigh: 1.2,
            pyramidLevels: 7,
            sigma: 2.2,
            chromaThreshold: 0.02,
            description: "Reveals respiratory motion patterns in chest area"
        },

        // High-frequency mechanical vibrations
        vibration: {
            name: "📳 Mechanical Vibration",
            amplification: 35,
            freqLow: 5.0,
            freqHigh: 15.0,
            pyramidLevels: 4,
            sigma: 0.8,
            chromaThreshold: 0.08,
            description: "Amplifies high-frequency mechanical motion and vibrations"
        },

        // Structural motion for buildings and bridges
        structural: {
            name: "🏗️ Structural Motion",
            amplification: 22,
            freqLow: 0.1,
            freqHigh: 2.5,
            pyramidLevels: 8,
            sigma: 3.0,
            chromaThreshold: 0.015,
            description: "Detects building sway and structural vibrations"
        },

        // Subtle facial expressions and micro-movements
        micro: {
            name: "🔬 Micro-expressions",
            amplification: 40,
            freqLow: 1.0,
            freqHigh: 8.0,
            pyramidLevels: 5,
            sigma: 1.2,
            chromaThreshold: 0.12,
            description: "Reveals subtle facial expressions and micro-movements"
        },

        // Very slow plant movement and growth
        plant: {
            name: "🌱 Plant Movement",
            amplification: 15,
            freqLow: 0.05,
            freqHigh: 0.8,
            pyramidLevels: 7,
            sigma: 2.5,
            chromaThreshold: 0.01,
            description: "Captures slow plant movement and growth patterns"
        },

        // Thermal convection and heat patterns
        thermal: {
            name: "🌡️ Thermal Effects",
            amplification: 30,
            freqLow: 0.1,
            freqHigh: 1.0,
            pyramidLevels: 6,
            sigma: 2.0,
            chromaThreshold: 0.04,
            description: "Visualizes thermal convection patterns and heat effects"
        },

        // Maximum amplification for barely visible motion
        extreme: {
            name: "🚀 Extreme Amplification",
            amplification: 75,
            freqLow: 0.5,
            freqHigh: 10.0,
            pyramidLevels: 5,
            sigma: 1.5,
            chromaThreshold: 0.15,
            description: "Maximum amplification for barely visible motion - use with caution"
        }
    }
};

// Configuration utilities
window.MotionAmpConfig.utils = {
    // Get configuration value with fallback
    get: function(path, defaultValue = null) {
        const keys = path.split('.');
        let current = window.MotionAmpConfig;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    },

    // Set configuration value
    set: function(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = window.MotionAmpConfig;
        
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
    },

    // Validate configuration
    validate: function() {
        const errors = [];
        
        // Validate amplification ranges
        Object.keys(this.get('presets', {})).forEach(presetName => {
            const preset = this.get(`presets.${presetName}`);
            if (preset && preset.amplification) {
                const validation = this.get('validation.amplification');
                if (preset.amplification < validation.min || preset.amplification > validation.max) {
                    errors.push(`Preset ${presetName}: amplification out of range`);
                }
            }
        });

        return errors;
    },

    // Merge user configuration
    merge: function(userConfig) {
        function deepMerge(target, source) {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    target[key] = target[key] || {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        }
        
        return deepMerge(window.MotionAmpConfig, userConfig);
    },

    // Export configuration
    export: function() {
        return JSON.stringify(window.MotionAmpConfig, null, 2);
    },

    // Import configuration
    import: function(configJson) {
        try {
            const userConfig = JSON.parse(configJson);
            this.merge(userConfig);
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
};

// Initialize debug mode if enabled
if (window.MotionAmpConfig.app.debugMode) {
    console.log('🐛 Motion Amplification Pro - Debug Mode Enabled');
    console.log('⚙️ Configuration:', window.MotionAmpConfig);
    
    // Enable performance monitoring
    if (window.MotionAmpConfig.development.enablePerformanceMonitoring) {
        window.MotionAmpPerf = {
            marks: new Map(),
            measures: new Map(),
            
            mark: function(name) {
                this.marks.set(name, performance.now());
                if (performance.mark) performance.mark(name);
            },
            
            measure: function(name, startMark, endMark) {
                const start = this.marks.get(startMark) || 0;
                const end = this.marks.get(endMark) || performance.now();
                const duration = end - start;
                this.measures.set(name, duration);
                console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
                return duration;
            },
            
            getReport: function() {
                return {
                    marks: Object.fromEntries(this.marks),
                    measures: Object.fromEntries(this.measures)
                };
            }
        };
    }
}

console.log('⚙️ Motion Amplification Pro configuration loaded');
