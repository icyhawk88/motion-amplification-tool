/**
 * WebGL Motion Processor - GPU Accelerated Motion Amplification
 * Provides high-performance video processing using WebGL shaders
 * 
 * Features:
 * - GPU-accelerated frame processing
 * - Real-time motion amplification
 * - Memory-efficient texture management
 * - Automatic fallback to CPU processing
 * 
 * @version 2.0.0
 */

class WebGLProcessor {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.processedFrames = [];
        this.textures = new Map();
        this.framebuffers = new Map();
        this.isInitialized = false;
        this.maxTextureSize = 0;
        
        // Shader sources
        this.vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;
        
        this.fragmentShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_currentFrame;
            uniform sampler2D u_previousFrame;
            uniform float u_amplification;
            uniform float u_freqLow;
            uniform float u_freqHigh;
            uniform float u_threshold;
            uniform vec2 u_resolution;
            
            varying vec2 v_texCoord;
            
            // Gaussian blur function
            vec4 gaussianBlur(sampler2D tex, vec2 coord, vec2 resolution, float sigma) {
                vec4 color = vec4(0.0);
                float total = 0.0;
                float blur = sigma;
                
                for (float x = -4.0; x <= 4.0; x += 1.0) {
                    for (float y = -4.0; y <= 4.0; y += 1.0) {
                        vec2 offset = vec2(x, y) / resolution;
                        float weight = exp(-(x*x + y*y) / (2.0 * blur * blur));
                        color += texture2D(tex, coord + offset) * weight;
                        total += weight;
                    }
                }
                
                return color / total;
            }
            
            // Temporal difference calculation
            vec3 calculateTemporalDiff(vec3 current, vec3 previous) {
                return current - previous;
            }
            
            // Frequency filtering (simplified)
            float frequencyFilter(float diff, float freqLow, float freqHigh) {
                float normalizedDiff = abs(diff);
                return step(freqLow, normalizedDiff) * (1.0 - step(freqHigh, normalizedDiff));
            }
            
            void main() {
                vec4 current = texture2D(u_currentFrame, v_texCoord);
                vec4 previous = texture2D(u_previousFrame, v_texCoord);
                
                // Apply Gaussian blur for noise reduction
                vec4 blurredCurrent = gaussianBlur(u_currentFrame, v_texCoord, u_resolution, 1.5);
                vec4 blurredPrevious = gaussianBlur(u_previousFrame, v_texCoord, u_resolution, 1.5);
                
                // Calculate temporal difference
                vec3 diff = calculateTemporalDiff(blurredCurrent.rgb, blurredPrevious.rgb);
                
                // Calculate motion magnitude
                float motionMagnitude = length(diff);
                
                // Apply frequency filtering
                float freqWeight = frequencyFilter(motionMagnitude, u_freqLow, u_freqHigh);
                
                // Apply motion amplification
                vec3 amplifiedDiff = diff * u_amplification * freqWeight;
                
                // Threshold small motions to reduce noise
                if (motionMagnitude > u_threshold) {
                    vec3 result = current.rgb + amplifiedDiff;
                    gl_FragColor = vec4(clamp(result, 0.0, 1.0), current.a);
                } else {
                    gl_FragColor = current;
                }
            }
        `;
        
        this.initialize();
        
        // Add WebGL context loss handling
        this.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('🎮 WebGL context lost - processing will fallback to CPU');
            this.isInitialized = false;
        });
        
        this.canvas.addEventListener('webglcontextrestored', () => {
            console.log('🎮 WebGL context restored - reinitializing');
            try {
                this.initialize();
            } catch (error) {
                console.error('Failed to restore WebGL context:', error);
            }
        });
    }
    
    initialize() {
        try {
            console.log('🎮 Initializing WebGL processor...');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1024;
            this.canvas.height = 1024;
            
            // Get WebGL context
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            
            if (!this.gl) {
                throw new Error('WebGL not supported');
            }
            
            console.log('✅ WebGL context created');
            
            // Get WebGL capabilities
            this.maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
            console.log(`📊 Max texture size: ${this.maxTextureSize}x${this.maxTextureSize}`);
            
            // Initialize shaders and program
            this.createShaderProgram();
            
            // Create buffers
            this.createBuffers();
            
            // Setup texture units
            this.setupTextures();
            
            this.isInitialized = true;
            console.log('🚀 WebGL processor initialized successfully');
            
        } catch (error) {
            console.error('❌ WebGL initialization failed:', error);
            this.isInitialized = false;
            throw error;
        }
    }
    
    createShaderProgram() {
        const gl = this.gl;
        
        // Use internal shader sources instead of DOM elements
        const vertexShader = this.createShader(gl.VERTEX_SHADER, this.vertexShaderSource);
        if (!vertexShader) {
            throw new Error('Failed to create vertex shader');
        }
        
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);
        if (!fragmentShader) {
            throw new Error('Failed to create fragment shader');
        }
        
        // Create and link program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        // Check for linking errors
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(this.program);
            gl.deleteProgram(this.program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            throw new Error('Shader program linking failed: ' + error);
        }
        
        // Clean up individual shaders (they're now part of the program)
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        // Get attribute and uniform locations
        this.locations = {
            attributes: {
                position: gl.getAttribLocation(this.program, 'a_position'),
                texCoord: gl.getAttribLocation(this.program, 'a_texCoord')
            },
            uniforms: {
                currentFrame: gl.getUniformLocation(this.program, 'u_currentFrame'),
                previousFrame: gl.getUniformLocation(this.program, 'u_previousFrame'),
                amplification: gl.getUniformLocation(this.program, 'u_amplification'),
                freqLow: gl.getUniformLocation(this.program, 'u_freqLow'),
                freqHigh: gl.getUniformLocation(this.program, 'u_freqHigh'),
                threshold: gl.getUniformLocation(this.program, 'u_threshold'),
                resolution: gl.getUniformLocation(this.program, 'u_resolution')
            }
        };
        
        console.log('✅ Shader program created and linked');
    }
    
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            console.error('Shader compilation error:', error);
            return null;
        }
        
        return shader;
    }
    
    createBuffers() {
        const gl = this.gl;
        
        // Create vertex buffer for full-screen quad
        const vertices = new Float32Array([
            -1, -1,  0, 0,  // Bottom-left
             1, -1,  1, 0,  // Bottom-right
            -1,  1,  0, 1,  // Top-left
             1,  1,  1, 1   // Top-right
        ]);
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        // Create index buffer
        const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }
    
    setupTextures() {
        const gl = this.gl;
        
        // Create texture for current frame
        this.currentTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        // Create texture for previous frame
        this.previousTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.previousTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    
    async processFrames(frames, params, progressCallback) {
        if (!this.isInitialized) {
            throw new Error('WebGL processor not initialized or context lost');
        }
        
        console.log(`🎮 Processing ${frames.length} frames with GPU acceleration`);
        this.processedFrames = [];
        
        const gl = this.gl;
        const startTime = performance.now();
        
        try {
            // Setup viewport and program
            gl.viewport(0, 0, frames[0].width, frames[0].height);
            gl.useProgram(this.program);
            
            // Bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            
            // Setup vertex attributes
            const stride = 4 * 4; // 4 floats per vertex
            gl.enableVertexAttribArray(this.locations.attributes.position);
            gl.vertexAttribPointer(this.locations.attributes.position, 2, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this.locations.attributes.texCoord);
            gl.vertexAttribPointer(this.locations.attributes.texCoord, 2, gl.FLOAT, false, stride, 2 * 4);
            
            // Set uniforms that don't change between frames
            gl.uniform1f(this.locations.uniforms.amplification, params.amplification / 10.0);
            gl.uniform1f(this.locations.uniforms.freqLow, params.freqLow / 10.0);
            gl.uniform1f(this.locations.uniforms.freqHigh, params.freqHigh / 10.0);
            gl.uniform1f(this.locations.uniforms.threshold, params.chromaThreshold || 0.05);
            gl.uniform2f(this.locations.uniforms.resolution, frames[0].width, frames[0].height);
            
            // Set texture units
            gl.uniform1i(this.locations.uniforms.currentFrame, 0);
            gl.uniform1i(this.locations.uniforms.previousFrame, 1);
            
            // Process each frame
            for (let i = 0; i < frames.length; i++) {
                const currentFrame = frames[i];
                const previousFrame = i > 0 ? frames[i - 1] : currentFrame;
                
                // Upload textures
                this.uploadTexture(this.currentTexture, currentFrame, 0);
                this.uploadTexture(this.previousTexture, previousFrame, 1);
                
                // Render
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                
                // Read back the result
                const resultData = new Uint8ClampedArray(currentFrame.width * currentFrame.height * 4);
                gl.readPixels(0, 0, currentFrame.width, currentFrame.height, gl.RGBA, gl.UNSIGNED_BYTE, resultData);
                
                // Check for WebGL errors after processing
                const error = gl.getError();
                if (error !== gl.NO_ERROR) {
                    console.warn(`WebGL error during processing: ${error}`);
                    // Continue processing but log the error
                }
                
                // Create ImageData from result
                const processedFrame = new ImageData(resultData, currentFrame.width, currentFrame.height);
                this.processedFrames.push(processedFrame);
                
                // Report progress
                if (progressCallback) {
                    const progress = ((i + 1) / frames.length) * 100;
                    progressCallback(progress);
                }
                
                // Yield control periodically
                if (i % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            
            const processingTime = (performance.now() - startTime) / 1000;
            const fps = frames.length / processingTime;
            
            console.log(`🚀 GPU processing completed: ${frames.length} frames in ${processingTime.toFixed(2)}s (${fps.toFixed(1)} fps)`);
            
        } catch (error) {
            console.error('❌ GPU processing failed:', error);
            throw error;
        }
    }
    
    uploadTexture(texture, imageData, textureUnit) {
        const gl = this.gl;
        
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 
            0, 
            gl.RGBA, 
            imageData.width, 
            imageData.height, 
            0, 
            gl.RGBA, 
            gl.UNSIGNED_BYTE, 
            imageData.data
        );
    }
    
    processFrameRealTime(currentFrame, previousFrame, params) {
        if (!this.isInitialized) {
            // Fallback to CPU processing
            return this.processCPUFallback(currentFrame, previousFrame, params);
        }
        
        try {
            const gl = this.gl;
            
            // Setup for single frame processing
            gl.viewport(0, 0, currentFrame.width, currentFrame.height);
            gl.useProgram(this.program);
            
            // Upload textures
            this.uploadTexture(this.currentTexture, currentFrame, 0);
            this.uploadTexture(this.previousTexture, previousFrame, 1);
            
            // Set uniforms
            gl.uniform1f(this.locations.uniforms.amplification, params.amplification / 10.0);
            gl.uniform1f(this.locations.uniforms.freqLow, params.freqLow / 10.0);
            gl.uniform1f(this.locations.uniforms.freqHigh, params.freqHigh / 10.0);
            gl.uniform1f(this.locations.uniforms.threshold, params.chromaThreshold || 0.05);
            gl.uniform2f(this.locations.uniforms.resolution, currentFrame.width, currentFrame.height);
            
            // Render
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            
            // Read result
            const resultData = new Uint8ClampedArray(currentFrame.width * currentFrame.height * 4);
            gl.readPixels(0, 0, currentFrame.width, currentFrame.height, gl.RGBA, gl.UNSIGNED_BYTE, resultData);
            
            return new ImageData(resultData, currentFrame.width, currentFrame.height);
            
        } catch (error) {
            console.warn('Real-time GPU processing failed, falling back to CPU:', error);
            return this.processCPUFallback(currentFrame, previousFrame, params);
        }
    }
    
    processCPUFallback(currentFrame, previousFrame, params) {
        console.log('🔄 Using CPU fallback for frame processing');
        
        const data = new Uint8ClampedArray(currentFrame.data);
        const amplification = params.amplification / 10.0;
        
        // Simple CPU-based amplification
        for (let i = 0; i < data.length; i += 4) {
            const currentR = data[i];
            const currentG = data[i + 1];
            const currentB = data[i + 2];
            
            const prevR = previousFrame.data[i];
            const prevG = previousFrame.data[i + 1];
            const prevB = previousFrame.data[i + 2];
            
            // Calculate differences
            const diffR = currentR - prevR;
            const diffG = currentG - prevG;
            const diffB = currentB - prevB;
            
            // Apply amplification
            data[i] = Math.max(0, Math.min(255, currentR + diffR * amplification));
            data[i + 1] = Math.max(0, Math.min(255, currentG + diffG * amplification));
            data[i + 2] = Math.max(0, Math.min(255, currentB + diffB * amplification));
        }
        
        return new ImageData(data, currentFrame.width, currentFrame.height);
    }
    
    getProcessedFrames() {
        return this.processedFrames;
    }
    
    isSupported() {
        return this.isInitialized;
    }
    
    getCapabilities() {
        if (!this.isInitialized) {
            return {
                supported: false,
                maxTextureSize: 0,
                extensions: []
            };
        }
        
        const gl = this.gl;
        const extensions = gl.getSupportedExtensions() || [];
        
        return {
            supported: true,
            maxTextureSize: this.maxTextureSize,
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            extensions: extensions,
            maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxFragmentTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS)
        };
    }
    
    cleanup() {
        if (!this.gl) return;
        
        console.log('🧹 Cleaning up WebGL resources');
        
        const gl = this.gl;
        
        // Delete textures
        if (this.currentTexture) {
            gl.deleteTexture(this.currentTexture);
            this.currentTexture = null;
        }
        if (this.previousTexture) {
            gl.deleteTexture(this.previousTexture);
            this.previousTexture = null;
        }
        
        // Delete buffers
        if (this.vertexBuffer) {
            gl.deleteBuffer(this.vertexBuffer);
            this.vertexBuffer = null;
        }
        if (this.indexBuffer) {
            gl.deleteBuffer(this.indexBuffer);
            this.indexBuffer = null;
        }
        
        // Delete program and shaders
        if (this.program) {
            const shaders = gl.getAttachedShaders(this.program);
            if (shaders) {
                shaders.forEach(shader => {
                    gl.detachShader(this.program, shader);
                    gl.deleteShader(shader);
                });
            }
            gl.deleteProgram(this.program);
            this.program = null;
        }
        
        // Clear processed frames to free memory
        this.processedFrames = [];
        
        // Clear maps if they exist
        if (this.textures) this.textures.clear();
        if (this.framebuffers) this.framebuffers.clear();
        
        // Lose WebGL context to free GPU memory
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) {
            ext.loseContext();
        }
        
        this.isInitialized = false;
        console.log('✅ WebGL resources disposed');
    }
    
    dispose() {
        // Alias for cleanup for better API consistency
        this.cleanup();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebGLProcessor;
}

// Global availability
window.WebGLProcessor = WebGLProcessor;

console.log('🎮 WebGL Motion Processor loaded');
