/**
 * Motion Worker - Background Video Processing
 * Handles computationally intensive motion amplification in a separate thread
 * to keep the main UI responsive during processing
 * 
 * Features:
 * - Multi-threaded motion amplification
 * - Progress reporting to main thread
 * - Memory-efficient frame processing
 * - Error handling and recovery
 * 
 * @version 2.0.0
 */

class MotionWorker {
    constructor() {
        this.isProcessing = false;
        this.currentProgress = 0;
        this.frameCount = 0;
        this.startTime = 0;
        
        console.log('🔧 Motion Worker initialized');
    }
    
    /**
     * Process video frames with motion amplification
     * @param {Array} frames - Array of ImageData objects
     * @param {Object} params - Processing parameters
     * @returns {Promise<Array>} Processed frames
     */
    async processFrames(frames, params) {
        if (this.isProcessing) {
            throw new Error('Worker is already processing frames');
        }
        
        this.isProcessing = true;
        this.startTime = performance.now();
        this.frameCount = frames.length;
        
        console.log(`🔧 Worker processing ${frames.length} frames`);
        
        try {
            const processedFrames = [];
            
            // Validate parameters
            const validatedParams = this.validateParameters(params);
            
            // Process frames sequentially
            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                const previousFrame = i > 0 ? frames[i - 1] : frame;
                
                // Process single frame
                const processedFrame = await this.processFrame(frame, previousFrame, validatedParams, i);
                processedFrames.push(processedFrame);
                
                // Update progress
                const progress = ((i + 1) / frames.length) * 100;
                this.currentProgress = progress;
                
                // Report progress to main thread
                this.reportProgress(progress, i + 1, frames.length);
                
                // Yield control every few frames to prevent blocking
                if (i % 5 === 0) {
                    await this.yieldControl();
                }
            }
            
            const processingTime = (performance.now() - this.startTime) / 1000;
            const fps = frames.length / processingTime;
            
            console.log(`✅ Worker completed: ${frames.length} frames in ${processingTime.toFixed(2)}s (${fps.toFixed(1)} fps)`);
            
            this.isProcessing = false;
            return processedFrames;
            
        } catch (error) {
            this.isProcessing = false;
            console.error('❌ Worker processing failed:', error);
            throw error;
        }
    }
    
    /**
     * Process a single frame with motion amplification
     * @param {ImageData} currentFrame - Current frame
     * @param {ImageData} previousFrame - Previous frame
     * @param {Object} params - Processing parameters
     * @param {number} frameIndex - Frame index for debugging
     * @returns {Promise<Object>} Processed frame data
     */
    async processFrame(currentFrame, previousFrame, params, frameIndex) {
        const width = currentFrame.width;
        const height = currentFrame.height;
        
        // Create output data array
        const outputData = new Uint8ClampedArray(currentFrame.data.length);
        
        // Choose processing algorithm
        switch (params.algorithm || 'eulerian') {
            case 'eulerian':
                this.processEulerian(currentFrame, previousFrame, outputData, params);
                break;
            case 'lagrangian':
                this.processLagrangian(currentFrame, previousFrame, outputData, params);
                break;
            case 'hybrid':
                this.processHybrid(currentFrame, previousFrame, outputData, params);
                break;
            default:
                this.processEulerian(currentFrame, previousFrame, outputData, params);
        }
        
        return {
            data: outputData,
            width: width,
            height: height,
            frameIndex: frameIndex
        };
    }
    
    /**
     * Eulerian motion amplification algorithm
     */
    processEulerian(currentFrame, previousFrame, outputData, params) {
        const width = currentFrame.width;
        const height = currentFrame.height;
        const amplification = params.amplification / 10.0;
        const freqLow = params.freqLow / 10.0;
        const freqHigh = params.freqHigh / 10.0;
        const threshold = params.chromaThreshold || 0.05;
        const sigma = params.sigma || 1.5;
        
        // Process each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Get current and previous pixel values
                const currentR = currentFrame.data[idx];
                const currentG = currentFrame.data[idx + 1];
                const currentB = currentFrame.data[idx + 2];
                const currentA = currentFrame.data[idx + 3];
                
                const prevR = previousFrame.data[idx];
                const prevG = previousFrame.data[idx + 1];
                const prevB = previousFrame.data[idx + 2];
                
                // Calculate temporal derivatives
                const diffR = currentR - prevR;
                const diffG = currentG - prevG;
                const diffB = currentB - prevB;
                
                // Calculate motion magnitude
                const motionMagnitude = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB) / 255.0;
                
                // Apply frequency filtering
                const freqWeight = this.frequencyFilter(motionMagnitude, freqLow, freqHigh);
                
                // Apply spatial filtering (simplified Gaussian)
                const spatialWeight = this.spatialFilter(x, y, width, height, currentFrame.data, sigma);
                
                // Apply motion amplification
                if (motionMagnitude > threshold) {
                    const totalWeight = freqWeight * spatialWeight;
                    
                    outputData[idx] = this.clamp(currentR + diffR * amplification * totalWeight);
                    outputData[idx + 1] = this.clamp(currentG + diffG * amplification * totalWeight);
                    outputData[idx + 2] = this.clamp(currentB + diffB * amplification * totalWeight);
                    outputData[idx + 3] = currentA;
                } else {
                    // No amplification for low motion
                    outputData[idx] = currentR;
                    outputData[idx + 1] = currentG;
                    outputData[idx + 2] = currentB;
                    outputData[idx + 3] = currentA;
                }
            }
        }
    }
    
    /**
     * Lagrangian motion amplification algorithm (simplified)
     */
    processLagrangian(currentFrame, previousFrame, outputData, params) {
        console.log('🔄 Using Lagrangian processing (simplified)');
        
        // For now, use a modified Eulerian approach
        // Full Lagrangian would require optical flow calculation
        this.processEulerian(currentFrame, previousFrame, outputData, params);
        
        // Apply additional post-processing for Lagrangian characteristics
        this.applyLagrangianPostProcessing(outputData, currentFrame.width, currentFrame.height, params);
    }
    
    /**
     * Hybrid motion amplification combining Eulerian and Lagrangian
     */
    processHybrid(currentFrame, previousFrame, outputData, params) {
        console.log('🔄 Using Hybrid processing');
        
        // Create temporary buffer for Eulerian result
        const eulerianData = new Uint8ClampedArray(currentFrame.data.length);
        this.processEulerian(currentFrame, previousFrame, eulerianData, params);
        
        // Apply Lagrangian modifications
        this.processLagrangian(currentFrame, previousFrame, outputData, params);
        
        // Blend results
        const blendFactor = 0.7; // Favor Eulerian
        for (let i = 0; i < outputData.length; i += 4) {
            outputData[i] = this.clamp(eulerianData[i] * blendFactor + outputData[i] * (1 - blendFactor));
            outputData[i + 1] = this.clamp(eulerianData[i + 1] * blendFactor + outputData[i + 1] * (1 - blendFactor));
            outputData[i + 2] = this.clamp(eulerianData[i + 2] * blendFactor + outputData[i + 2] * (1 - blendFactor));
        }
    }
    
    /**
     * Frequency domain filtering
     */
    frequencyFilter(magnitude, freqLow, freqHigh) {
        // Simple band-pass filter
        if (magnitude < freqLow || magnitude > freqHigh) {
            return 0.0;
        }
        
        // Smooth transition at band edges
        const lowTransition = Math.min(1.0, (magnitude - freqLow) / (freqLow * 0.1));
        const highTransition = Math.min(1.0, (freqHigh - magnitude) / (freqHigh * 0.1));
        
        return lowTransition * highTransition;
    }
    
    /**
     * Spatial filtering (simplified Gaussian)
     */
    spatialFilter(x, y, width, height, imageData, sigma) {
        // Simplified spatial filtering - in a full implementation,
        // this would apply a proper Gaussian kernel
        const kernelSize = Math.max(1, Math.floor(sigma * 2));
        let sum = 0;
        let weightSum = 0;
        
        for (let dy = -kernelSize; dy <= kernelSize; dy++) {
            for (let dx = -kernelSize; dx <= kernelSize; dx++) {
                const nx = Math.max(0, Math.min(width - 1, x + dx));
                const ny = Math.max(0, Math.min(height - 1, y + dy));
                const nIdx = (ny * width + nx) * 4;
                
                const distance = Math.sqrt(dx * dx + dy * dy);
                const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma));
                
                // Average RGB values
                const gray = (imageData[nIdx] + imageData[nIdx + 1] + imageData[nIdx + 2]) / 3;
                sum += gray * weight;
                weightSum += weight;
            }
        }
        
        return weightSum > 0 ? Math.min(1.0, sum / weightSum / 255.0) : 1.0;
    }
    
    /**
     * Apply Lagrangian post-processing
     */
    applyLagrangianPostProcessing(outputData, width, height, params) {
        // Apply edge-preserving smoothing
        const smoothingFactor = 0.1;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Get neighboring pixels
                const neighbors = [
                    (y * width + (x - 1)) * 4,     // Left
                    (y * width + (x + 1)) * 4,     // Right
                    ((y - 1) * width + x) * 4,     // Up
                    ((y + 1) * width + x) * 4      // Down
                ];
                
                // Apply smoothing to RGB channels
                for (let c = 0; c < 3; c++) {
                    let sum = outputData[idx + c] * 4; // Center pixel weight
                    
                    neighbors.forEach(nIdx => {
                        sum += outputData[nIdx + c];
                    });
                    
                    const smoothed = sum / 8.0;
                    outputData[idx + c] = this.clamp(
                        outputData[idx + c] * (1 - smoothingFactor) + 
                        smoothed * smoothingFactor
                    );
                }
            }
        }
    }
    
    /**
     * Validate and sanitize processing parameters
     */
    validateParameters(params) {
        return {
            amplification: Math.max(1, Math.min(100, params.amplification || 15)),
            freqLow: Math.max(0.1, Math.min(20, params.freqLow || 0.5)),
            freqHigh: Math.max(0.1, Math.min(20, params.freqHigh || 3.0)),
            pyramidLevels: Math.max(2, Math.min(10, params.pyramidLevels || 6)),
            sigma: Math.max(0.1, Math.min(5, params.sigma || 1.5)),
            chromaThreshold: Math.max(0.001, Math.min(0.5, params.chromaThreshold || 0.05)),
            algorithm: params.algorithm || 'eulerian',
            roi: params.roi || null
        };
    }
    
    /**
     * Clamp value to 0-255 range
     */
    clamp(value) {
        return Math.max(0, Math.min(255, Math.round(value)));
    }
    
    /**
     * Report progress to main thread
     */
    reportProgress(progress, currentFrame, totalFrames) {
        const message = {
            type: 'progress',
            progress: progress,
            currentFrame: currentFrame,
            totalFrames: totalFrames,
            fps: this.calculateCurrentFPS(),
            memoryUsage: this.getMemoryUsage()
        };
        
        // Send to main thread if in worker context
        if (typeof self !== 'undefined' && self.postMessage) {
            self.postMessage(message);
        }
    }
    
    /**
     * Calculate current processing FPS
     */
    calculateCurrentFPS() {
        if (!this.startTime) return 0;
        
        const elapsed = (performance.now() - this.startTime) / 1000;
        const framesProcessed = this.frameCount * (this.currentProgress / 100);
        
        return elapsed > 0 ? framesProcessed / elapsed : 0;
    }
    
    /**
     * Get current memory usage (if available)
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    /**
     * Yield control to prevent blocking
     */
    async yieldControl() {
        return new Promise(resolve => {
            setTimeout(resolve, 1);
        });
    }
    
    /**
     * Cancel current processing
     */
    cancel() {
        this.isProcessing = false;
        console.log('🛑 Worker processing cancelled');
    }
    
    /**
     * Get processing statistics
     */
    getStats() {
        return {
            isProcessing: this.isProcessing,
            progress: this.currentProgress,
            fps: this.calculateCurrentFPS(),
            memoryUsage: this.getMemoryUsage(),
            elapsedTime: this.startTime ? (performance.now() - this.startTime) / 1000 : 0
        };
    }
}

// Worker message handling (when running in Web Worker context)
if (typeof self !== 'undefined' && typeof importScripts === 'function') {
    // We're in a Web Worker
    const worker = new MotionWorker();
    
    self.addEventListener('message', async (event) => {
        const { type, data, id } = event.data;
        
        try {
            switch (type) {
                case 'process':
                    const result = await worker.processFrames(data.frames, data.params);
                    self.postMessage({ 
                        type: 'complete', 
                        data: result, 
                        id: id 
                    });
                    break;
                    
                case 'cancel':
                    worker.cancel();
                    self.postMessage({ 
                        type: 'cancelled', 
                        id: id 
                    });
                    break;
                    
                case 'stats':
                    self.postMessage({ 
                        type: 'stats', 
                        data: worker.getStats(), 
                        id: id 
                    });
                    break;
                    
                default:
                    throw new Error(`Unknown message type: ${type}`);
            }
        } catch (error) {
            self.postMessage({ 
                type: 'error', 
                error: error.message, 
                stack: error.stack,
                id: id 
            });
        }
    });
    
    // Worker ready signal
    self.postMessage({ type: 'ready' });
    
    console.log('🔧 Motion Worker ready for processing');
}

// Export for use in main thread
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MotionWorker;
}

// Global availability
if (typeof window !== 'undefined') {
    window.MotionWorker = MotionWorker;
}

console.log('🔧 Motion Worker module loaded');
