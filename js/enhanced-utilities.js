/**
 * Motion Amplification Pro - Enhanced Utilities
 * Additional utilities and improvements for better performance and reliability
 * 
 * @version 2.0.1
 */

/**
 * Performance Monitor for tracking application performance
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.enabled = window.MotionAmpConfig?.development?.enablePerformanceMonitoring || false;
        this.memoryCheckInterval = null;
        this.startMemoryMonitoring();
    }
    
    startTiming(label) {
        if (!this.enabled) return;
        this.metrics.set(`${label}_start`, performance.now());
        console.log(`⏱️ Started timing: ${label}`);
    }
    
    endTiming(label) {
        if (!this.enabled) return;
        const startTime = this.metrics.get(`${label}_start`);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.metrics.set(label, duration);
            console.log(`✅ ${label}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            
            // Log warning if memory usage is high
            if (memory.used / memory.limit > 0.8) {
                console.warn('⚠️ High memory usage detected:', memory);
            }
            
            return memory;
        }
        return null;
    }
    
    startMemoryMonitoring() {
        if (!this.enabled) return;
        
        this.memoryCheckInterval = setInterval(() => {
            const memory = this.getMemoryUsage();
            if (memory) {
                this.metrics.set('memory_snapshot', {
                    timestamp: Date.now(),
                    ...memory
                });
            }
        }, 10000); // Check every 10 seconds
    }
    
    stopMemoryMonitoring() {
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
            this.memoryCheckInterval = null;
        }
    }
    
    getReport() {
        const report = {
            metrics: Object.fromEntries(this.metrics),
            memory: this.getMemoryUsage(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.log('📊 Performance Report:', report);
        return report;
    }
    
    cleanup() {
        this.stopMemoryMonitoring();
        this.metrics.clear();
    }
}

/**
 * Enhanced Error Handler with better reporting and recovery
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 20;
        this.errorCallbacks = new Set();
        this.initializeGlobalHandlers();
    }
    
    initializeGlobalHandlers() {
        // Enhanced error event handler
        window.addEventListener('error', (event) => {
            const errorInfo = {
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.logError(errorInfo);
        });
        
        // Enhanced promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            const errorInfo = {
                type: 'promise_rejection',
                message: 'Unhandled Promise Rejection',
                reason: String(event.reason),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.logError(errorInfo);
            
            // Prevent the default browser console error
            event.preventDefault();
        });
        
        // WebGL context loss handler
        document.addEventListener('webglcontextlost', (event) => {
            console.warn('🎮 WebGL context lost, attempting recovery...');
            this.logError({
                type: 'webgl_context_lost',
                message: 'WebGL context was lost',
                timestamp: new Date().toISOString()
            });
        });
    }
    
    logError(errorInfo) {
        // Add error to collection
        this.errors.push(errorInfo);
        
        // Maintain maximum error count
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Enhanced error logging with categorization
        const category = this.categorizeError(errorInfo);
        console.error(`🚨 [${category}] Error logged:`, errorInfo);
        
        // Notify error callbacks
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorInfo);
            } catch (e) {
                console.warn('Error in error callback:', e);
            }
        });
        
        // Auto-recovery attempts for certain error types
        this.attemptAutoRecovery(errorInfo);
    }
    
    categorizeError(errorInfo) {
        if (errorInfo.message?.includes('WebGL')) return 'WebGL';
        if (errorInfo.message?.includes('camera') || errorInfo.message?.includes('webcam')) return 'Camera';
        if (errorInfo.message?.includes('memory') || errorInfo.message?.includes('heap')) return 'Memory';
        if (errorInfo.message?.includes('network') || errorInfo.message?.includes('fetch')) return 'Network';
        if (errorInfo.type === 'promise_rejection') return 'Promise';
        return 'General';
    }
    
    attemptAutoRecovery(errorInfo) {
        const category = this.categorizeError(errorInfo);
        
        switch (category) {
            case 'WebGL':
                setTimeout(() => {
                    if (window.motionAmp?.gpuProcessor) {
                        try {
                            window.motionAmp.gpuProcessor.initialize();
                            console.log('✅ WebGL auto-recovery attempt completed');
                        } catch (e) {
                            console.warn('❌ WebGL auto-recovery failed:', e);
                        }
                    }
                }, 2000);
                break;
                
            case 'Camera':
                setTimeout(() => {
                    if (window.motionAmp?.webcamManager) {
                        console.log('🎥 Attempting camera recovery...');
                        // Recovery will be handled by the webcam manager's retry logic
                    }
                }, 1000);
                break;
                
            case 'Memory':
                // Suggest garbage collection
                if (window.gc) {
                    setTimeout(() => {
                        window.gc();
                        console.log('🧹 Manual garbage collection triggered');
                    }, 1000);
                }
                break;
        }
    }
    
    onError(callback) {
        this.errorCallbacks.add(callback);
    }
    
    offError(callback) {
        this.errorCallbacks.delete(callback);
    }
    
    getErrorReport() {
        return {
            errors: this.errors,
            summary: this.getErrorSummary(),
            timestamp: new Date().toISOString(),
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                } : null
            }
        };
    }
    
    getErrorSummary() {
        const summary = {};
        this.errors.forEach(error => {
            const category = this.categorizeError(error);
            summary[category] = (summary[category] || 0) + 1;
        });
        return summary;
    }
    
    clearErrors() {
        this.errors = [];
        console.log('🧹 Error log cleared');
    }
}

/**
 * Memory Manager for better resource handling
 */
class MemoryManager {
    constructor() {
        this.cleanupTasks = new Set();
        this.autoCleanupInterval = null;
        this.memoryThreshold = 0.8; // 80% of available memory
        this.startAutoCleanup();
    }
    
    addCleanupTask(task, priority = 'normal') {
        this.cleanupTasks.add({ task, priority, timestamp: Date.now() });
    }
    
    removeCleanupTask(task) {
        this.cleanupTasks.forEach(item => {
            if (item.task === task) {
                this.cleanupTasks.delete(item);
            }
        });
    }
    
    executeCleanup(forced = false) {
        console.log('🧹 Executing memory cleanup...');
        
        const tasks = Array.from(this.cleanupTasks);
        
        // Sort by priority (high -> normal -> low)
        tasks.sort((a, b) => {
            const priorities = { high: 3, normal: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
        
        let cleanedCount = 0;
        tasks.forEach(({ task, priority }) => {
            try {
                if (typeof task === 'function') {
                    task();
                    cleanedCount++;
                } else if (typeof task === 'object' && task.cleanup) {
                    task.cleanup();
                    cleanedCount++;
                }
            } catch (error) {
                console.warn('⚠️ Cleanup task failed:', error);
            }
        });
        
        // Force garbage collection if available
        if (window.gc && (forced || this.shouldForceGC())) {
            window.gc();
            console.log('🗑️ Forced garbage collection');
        }
        
        console.log(`✅ Memory cleanup completed: ${cleanedCount} tasks executed`);
        return cleanedCount;
    }
    
    shouldForceGC() {
        if (!performance.memory) return false;
        
        const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        return usage > this.memoryThreshold;
    }
    
    getMemoryStatus() {
        if (!performance.memory) {
            return { available: false };
        }
        
        const memory = performance.memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const limit = memory.jsHeapSizeLimit;
        
        return {
            available: true,
            used: Math.round(used / 1024 / 1024),
            total: Math.round(total / 1024 / 1024),
            limit: Math.round(limit / 1024 / 1024),
            usagePercent: Math.round((used / limit) * 100),
            needsCleanup: (used / limit) > this.memoryThreshold
        };
    }
    
    startAutoCleanup() {
        if (this.autoCleanupInterval) return;
        
        this.autoCleanupInterval = setInterval(() => {
            const status = this.getMemoryStatus();
            if (status.available && status.needsCleanup) {
                console.log('🔄 Auto-cleanup triggered due to high memory usage');
                this.executeCleanup();
            }
        }, 30000); // Check every 30 seconds
    }
    
    stopAutoCleanup() {
        if (this.autoCleanupInterval) {
            clearInterval(this.autoCleanupInterval);
            this.autoCleanupInterval = null;
        }
    }
    
    cleanup() {
        this.stopAutoCleanup();
        this.executeCleanup(true);
        this.cleanupTasks.clear();
    }
}

/**
 * Mobile Optimization Helper
 */
class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchSupport = 'ontouchstart' in window;
        this.orientationSupport = 'orientation' in window;
        this.initialized = false;
    }
    
    detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
               window.innerWidth <= 768;
    }
    
    initialize() {
        if (this.initialized || !this.isMobile) return;
        
        console.log('📱 Initializing mobile optimizations...');
        
        this.optimizeTouchInteractions();
        this.optimizeViewport();
        this.reduceAnimations();
        this.optimizeMemory();
        this.handleOrientationChanges();
        
        this.initialized = true;
        console.log('✅ Mobile optimizations applied');
    }
    
    optimizeTouchInteractions() {
        // Improve touch targets
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .webcam-btn, .mode-btn, .preset-btn, .process-btn {
                    min-height: 48px !important;
                    min-width: 48px !important;
                    padding: 14px 20px !important;
                }
                
                .control-group input[type="range"]::-webkit-slider-thumb {
                    width: 32px !important;
                    height: 32px !important;
                    transform: scale(1.1) !important;
                }
                
                .toggle-btn {
                    min-height: 44px !important;
                    padding: 12px 18px !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add touch feedback
        this.addTouchFeedback();
    }
    
    addTouchFeedback() {
        const addTouchClass = (element) => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            });
        };
        
        // Apply to interactive elements
        document.querySelectorAll('button, .mode-btn, .preset-btn, input[type="range"]').forEach(addTouchClass);
        
        // Add CSS for touch feedback
        const touchStyle = document.createElement('style');
        touchStyle.textContent = `
            .touch-active {
                transform: scale(0.95) !important;
                opacity: 0.8 !important;
                transition: all 0.1s ease !important;
            }
        `;
        document.head.appendChild(touchStyle);
    }
    
    optimizeViewport() {
        // Prevent zoom on input focus
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Prevent scroll bounce on iOS
        document.body.style.overscrollBehavior = 'none';
    }
    
    reduceAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    optimizeMemory() {
        // Reduce quality settings for mobile
        if (window.MotionAmpConfig) {
            window.MotionAmpConfig.performance.maxResolution.withoutGPU = {
                width: 640,
                height: 480
            };
            
            window.MotionAmpConfig.performance.frameProcessingBatchSize = 5;
            window.MotionAmpConfig.defaults.pyramidLevels = 4;
        }
    }
    
    handleOrientationChanges() {
        if (!this.orientationSupport) return;
        
        let orientationChangeTimeout;
        
        window.addEventListener('orientationchange', () => {
            // Debounce orientation change handling
            clearTimeout(orientationChangeTimeout);
            orientationChangeTimeout = setTimeout(() => {
                console.log('📱 Orientation changed, adjusting layout...');
                
                // Force layout recalculation
                window.dispatchEvent(new Event('resize'));
                
                // Adjust video containers if needed
                const videoContainers = document.querySelectorAll('.video-wrapper, .webcam-container');
                videoContainers.forEach(container => {
                    container.style.height = 'auto';
                });
                
            }, 500);
        });
    }
    
    getOptimizationReport() {
        return {
            isMobile: this.isMobile,
            touchSupport: this.touchSupport,
            orientationSupport: this.orientationSupport,
            initialized: this.initialized,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                orientation: this.orientationSupport ? window.orientation : null
            },
            features: {
                reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                highContrast: window.matchMedia('(prefers-contrast: high)').matches,
                darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
            }
        };
    }
}

/**
 * Enhanced Debug Utilities
 */
const EnhancedDebugUtils = {
    async memoryStressTest() {
        console.log('🧪 Starting enhanced memory stress test...');
        
        const startMemory = performance.memory?.usedJSHeapSize || 0;
        const testArrays = [];
        
        try {
            // Create progressively larger arrays
            for (let i = 0; i < 15; i++) {
                const size = Math.pow(2, 16 + i); // Exponentially growing
                testArrays.push(new Float32Array(size));
                
                // Check memory usage
                if (performance.memory) {
                    const current = performance.memory.usedJSHeapSize;
                    const percent = (current / performance.memory.jsHeapSizeLimit) * 100;
                    console.log(`📊 Iteration ${i}: ${Math.round(current / 1024 / 1024)}MB (${percent.toFixed(1)}%)`);
                    
                    // Stop if we're using too much memory
                    if (percent > 70) {
                        console.warn('⚠️ Memory limit approaching, stopping test');
                        break;
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const peakMemory = performance.memory?.usedJSHeapSize || 0;
            
            // Cleanup
            testArrays.length = 0;
            if (window.gc) window.gc();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            const endMemory = performance.memory?.usedJSHeapSize || 0;
            
            const results = {
                start: Math.round(startMemory / 1024 / 1024),
                peak: Math.round(peakMemory / 1024 / 1024),
                end: Math.round(endMemory / 1024 / 1024),
                cleaned: Math.round((peakMemory - endMemory) / 1024 / 1024),
                efficiency: ((peakMemory - endMemory) / (peakMemory - startMemory) * 100).toFixed(1)
            };
            
            console.log('✅ Memory stress test completed:', results);
            return results;
            
        } catch (error) {
            console.error('❌ Memory stress test failed:', error);
            return { error: error.message };
        }
    },
    
    getComprehensiveSystemInfo() {
        const info = {
            timestamp: new Date().toISOString(),
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                platform: navigator.platform,
                vendor: navigator.vendor
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                orientation: screen.orientation?.type || 'unknown'
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            features: {
                webgl: !!document.createElement('canvas').getContext('webgl'),
                webgl2: !!document.createElement('canvas').getContext('webgl2'),
                webworkers: typeof Worker !== 'undefined',
                serviceworkers: 'serviceWorker' in navigator,
                mediadevices: !!navigator.mediaDevices,
                mediarecorder: typeof MediaRecorder !== 'undefined',
                indexeddb: 'indexedDB' in window,
                localstorage: typeof Storage !== 'undefined'
            },
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null,
            webgl: this.getWebGLInfo(),
            mediaDevices: await this.getMediaDevicesInfo()
        };
        
        console.log('📊 Comprehensive System Info:', info);
        return info;
    },
    
    getWebGLInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return { supported: false };
        
        try {
            return {
                supported: true,
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                maxFragmentTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                extensions: gl.getSupportedExtensions(),
                contextAttributes: gl.getContextAttributes()
            };
        } catch (error) {
            return { supported: true, error: error.message };
        }
    },
    
    async getMediaDevicesInfo() {
        if (!navigator.mediaDevices) {
            return { supported: false };
        }
        
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                supported: true,
                videoInputs: devices.filter(d => d.kind === 'videoinput').length,
                audioInputs: devices.filter(d => d.kind === 'audioinput').length,
                audioOutputs: devices.filter(d => d.kind === 'audiooutput').length,
                devices: devices.map(d => ({
                    kind: d.kind,
                    label: d.label || 'Unknown Device',
                    deviceId: d.deviceId ? d.deviceId.substring(0, 8) + '...' : 'Unknown'
                }))
            };
        } catch (error) {
            return { supported: true, error: error.message };
        }
    }
};

// Initialize enhanced utilities
window.motionAmpEnhanced = {
    performanceMonitor: new PerformanceMonitor(),
    errorHandler: new ErrorHandler(),
    memoryManager: new MemoryManager(),
    mobileOptimizer: new MobileOptimizer(),
    debugUtils: EnhancedDebugUtils
};

// Auto-initialize mobile optimizations
if (window.motionAmpEnhanced.mobileOptimizer.isMobile) {
    document.addEventListener('DOMContentLoaded', () => {
        window.motionAmpEnhanced.mobileOptimizer.initialize();
    });
}

// Add cleanup to existing motionAmp if available
if (window.motionAmp) {
    const originalCleanup = window.motionAmp.cleanup;
    window.motionAmp.cleanup = function() {
        // Call original cleanup
        if (originalCleanup) originalCleanup.call(this);
        
        // Enhanced cleanup
        window.motionAmpEnhanced.performanceMonitor.cleanup();
        window.motionAmpEnhanced.memoryManager.cleanup();
    };
}

console.log('🚀 Enhanced utilities loaded successfully!');
