# 🔌 API Reference - Motion Amplification Pro

This document provides comprehensive API documentation for integrating Motion Amplification Pro into your applications.

## 📋 **Table of Contents**

1. [Core Classes](#core-classes)
2. [Motion Amplifier API](#motion-amplifier-api)
3. [WebGL Processor API](#webgl-processor-api)
4. [Motion Worker API](#motion-worker-api)
5. [Configuration](#configuration)
6. [Events](#events)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## 🔧 **Core Classes**

### **MotionAmplifierPro**

The main class for motion amplification functionality.

```javascript
const amplifier = new MotionAmplifierPro();
```

#### **Constructor Options**

```javascript
const amplifier = new MotionAmplifierPro({
    gpuAcceleration: true,
    realTimeProcessing: false,
    maxVideoSize: 500 * 1024 * 1024, // 500MB
    maxDuration: 120, // 2 minutes
    frameRate: 30
});
```

---

## 🎬 **Motion Amplifier API**

### **Video Processing**

#### **processVideo(videoElement, parameters)**

Process a video with motion amplification.

```javascript
const parameters = {
    amplification: 25,
    freqLow: 0.5,
    freqHigh: 3.0,
    pyramidLevels: 6,
    sigma: 1.5,
    chromaThreshold: 0.05
};

try {
    const result = await amplifier.processVideo(videoElement, parameters);
    console.log(`Processed ${result.frames.length} frames`);
} catch (error) {
    console.error('Processing failed:', error);
}
```

**Parameters:**
- `videoElement` (HTMLVideoElement): Source video element
- `parameters` (Object): Processing parameters

**Returns:** Promise<ProcessingResult>

```javascript
interface ProcessingResult {
    frames: ImageData[];
    statistics: ProcessingStats;
    metadata: VideoMetadata;
}
```

#### **processFrame(frameData, previousFrame, parameters)**

Process a single frame.

```javascript
const processedFrame = amplifier.processFrame(
    currentFrame,     // ImageData
    previousFrame,    // ImageData
    parameters       // Object
);
```

### **Real-time Processing**

#### **startRealTimeProcessing()**

Start real-time camera processing.

```javascript
await amplifier.startRealTimeProcessing();
```

#### **stopRealTimeProcessing()**

Stop real-time processing.

```javascript
amplifier.stopRealTimeProcessing();
```

### **Presets**

#### **applyPreset(presetName)**

Apply a predefined parameter preset.

```javascript
amplifier.applyPreset('heartbeat');
// Available presets: 'heartbeat', 'breathing', 'vibration', 
// 'structural', 'micro', 'plant', 'thermal', 'extreme'
```

#### **getPresets()**

Get all available presets.

```javascript
const presets = amplifier.getPresets();
```

### **Configuration**

#### **getParameters()**

Get current processing parameters.

```javascript
const params = amplifier.getParameters();
```

#### **setParameters(parameters)**

Set processing parameters.

```javascript
amplifier.setParameters({
    amplification: 30,
    freqLow: 1.0,
    freqHigh: 5.0
});
```

### **Export Functions**

#### **exportVideo()**

Export processed video.

```javascript
await amplifier.exportVideo();
```

#### **exportFrame(frameIndex)**

Export specific frame as PNG.

```javascript
await amplifier.exportFrame(0); // Export first frame
```

#### **exportAnalysis()**

Export motion analysis data.

```javascript
const analysisData = await amplifier.exportAnalysis();
```

---

## 🎮 **WebGL Processor API**

### **WebGLProcessor**

GPU-accelerated processing engine.

```javascript
const processor = new WebGLProcessor();
```

#### **isSupported()**

Check if WebGL is supported.

```javascript
if (processor.isSupported()) {
    console.log('GPU acceleration available');
}
```

#### **getCapabilities()**

Get GPU capabilities.

```javascript
const caps = processor.getCapabilities();
console.log('Max texture size:', caps.maxTextureSize);
```

#### **processFrames(frames, parameters, progressCallback)**

Process frames using GPU acceleration.

```javascript
await processor.processFrames(
    frames,
    parameters,
    (progress) => console.log(`Progress: ${progress}%`)
);
```

---

## 🔧 **Motion Worker API**

### **Background Processing**

#### **Creating a Worker**

```javascript
const worker = new Worker('js/motion-worker.js');
```

#### **Sending Processing Jobs**

```javascript
worker.postMessage({
    type: 'process',
    data: {
        frames: videoFrames,
        params: processingParameters
    },
    id: 'job-123'
});
```

#### **Handling Worker Messages**

```javascript
worker.addEventListener('message', (event) => {
    const { type, data, id } = event.data;
    
    switch (type) {
        case 'progress':
            updateProgressBar(data.progress);
            break;
            
        case 'complete':
            handleProcessingComplete(data);
            break;
            
        case 'error':
            handleError(data.error);
            break;
    }
});
```

---

## ⚙️ **Configuration**

### **Processing Parameters**

```javascript
interface ProcessingParameters {
    amplification: number;      // 1-100, motion amplification factor
    freqLow: number;           // Hz, minimum frequency
    freqHigh: number;          // Hz, maximum frequency
    pyramidLevels: number;     // 2-10, pyramid analysis levels
    sigma: number;             // 0.1-5.0, Gaussian smoothing
    chromaThreshold: number;   // 0.001-0.5, motion threshold
    algorithm?: 'eulerian' | 'lagrangian' | 'hybrid';
    roi?: RegionOfInterest;    // Optional region selection
}
```

### **Region of Interest**

```javascript
interface RegionOfInterest {
    x: number;        // X coordinate (pixels)
    y: number;        // Y coordinate (pixels)
    width: number;    // Width (pixels)
    height: number;   // Height (pixels)
}
```

### **Performance Settings**

```javascript
interface PerformanceSettings {
    gpuAcceleration: boolean;
    maxConcurrentFrames: number;
    memoryLimit: number;        // MB
    qualityLevel: 'low' | 'medium' | 'high';
}
```

---

## 📡 **Events**

### **Event Listeners**

```javascript
amplifier.addEventListener('processingStart', (event) => {
    console.log('Processing started');
});

amplifier.addEventListener('processingProgress', (event) => {
    console.log(`Progress: ${event.detail.progress}%`);
});

amplifier.addEventListener('processingComplete', (event) => {
    console.log('Processing completed');
    console.log('Result:', event.detail.result);
});

amplifier.addEventListener('error', (event) => {
    console.error('Error:', event.detail.error);
});
```

### **Available Events**

- `processingStart` - Processing begins
- `processingProgress` - Progress updates
- `processingComplete` - Processing finished
- `frameProcessed` - Individual frame completed
- `error` - Error occurred
- `gpuStatusChanged` - GPU acceleration status changed
- `parametersChanged` - Processing parameters updated

---

## ❌ **Error Handling**

### **Error Types**

```javascript
class MotionAmplificationError extends Error {
    constructor(message, code, originalError) {
        super(message);
        this.name = 'MotionAmplificationError';
        this.code = code;
        this.originalError = originalError;
    }
}
```

### **Error Codes**

- `WEBGL_NOT_SUPPORTED` - GPU acceleration unavailable
- `INVALID_VIDEO_FORMAT` - Unsupported video format
- `FILE_TOO_LARGE` - Video file exceeds size limit
- `PROCESSING_TIMEOUT` - Processing took too long
- `INSUFFICIENT_MEMORY` - Not enough memory available
- `WORKER_FAILED` - Background worker error

### **Error Handling Example**

```javascript
try {
    await amplifier.processVideo(video, params);
} catch (error) {
    switch (error.code) {
        case 'WEBGL_NOT_SUPPORTED':
            // Fallback to CPU processing
            break;
        case 'FILE_TOO_LARGE':
            // Suggest reducing video size
            break;
        default:
            console.error('Unexpected error:', error);
    }
}
```

---

## 💡 **Examples**

### **Basic Video Processing**

```javascript
// Initialize amplifier
const amplifier = new MotionAmplifierPro();

// Load video
const video = document.getElementById('myVideo');
await video.load();

// Apply heartbeat preset
amplifier.applyPreset('heartbeat');

// Process video
const result = await amplifier.processVideo(video);

// Display result
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
ctx.putImageData(result.frames[0], 0, 0);
```

### **Real-time Camera Processing**

```javascript
// Enable real-time mode
amplifier.toggleRealTime();

// Start camera
await amplifier.startWebcam();

// Apply processing parameters
amplifier.setParameters({
    amplification: 20,
    freqLow: 0.8,
    freqHigh: 3.5
});

// Processing happens automatically
```

### **Custom Processing Pipeline**

```javascript
// Create custom processing function
async function customProcessing(videoFile) {
    const amplifier = new MotionAmplifierPro({
        gpuAcceleration: true
    });
    
    // Extract frames
    const frames = await amplifier.extractFrames(videoFile);
    
    // Process with custom parameters
    const params = {
        amplification: 35,
        freqLow: 2.0,
        freqHigh: 8.0,
        pyramidLevels: 8,
        sigma: 2.0,
        chromaThreshold: 0.02
    };
    
    // Use worker for background processing
    const worker = new Worker('js/motion-worker.js');
    
    return new Promise((resolve, reject) => {
        worker.postMessage({
            type: 'process',
            data: { frames, params }
        });
        
        worker.addEventListener('message', (e) => {
            if (e.data.type === 'complete') {
                resolve(e.data.data);
            } else if (e.data.type === 'error') {
                reject(new Error(e.data.error));
            }
        });
    });
}
```

### **Batch Processing**

```javascript
async function processBatch(videoFiles) {
    const results = [];
    
    for (const file of videoFiles) {
        try {
            const result = await amplifier.processVideo(file, {
                amplification: 25,
                freqLow: 0.5,
                freqHigh: 3.0
            });
            
            results.push({
                filename: file.name,
                success: true,
                result: result
            });
            
        } catch (error) {
            results.push({
                filename: file.name,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}
```

### **Performance Monitoring**

```javascript
// Monitor processing performance
amplifier.addEventListener('processingProgress', (event) => {
    const stats = event.detail.stats;
    
    console.log(`FPS: ${stats.fps}`);
    console.log(`Memory: ${stats.memoryUsage}MB`);
    console.log(`GPU: ${stats.gpuAccelerated ? 'Yes' : 'No'}`);
});

// Get detailed capabilities
const capabilities = amplifier.getCapabilities();
console.log('System capabilities:', capabilities);
```

---

## 🔗 **Integration Examples**

### **React Integration**

```javascript
import { useEffect, useState } from 'react';

function MotionAmplificationComponent() {
    const [amplifier, setAmplifier] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    useEffect(() => {
        const amp = new MotionAmplifierPro();
        setAmplifier(amp);
        
        return () => {
            amp.cleanup();
        };
    }, []);
    
    const processVideo = async (videoFile) => {
        setProcessing(true);
        try {
            const result = await amplifier.processVideo(videoFile);
            // Handle result
        } catch (error) {
            // Handle error
        } finally {
            setProcessing(false);
        }
    };
    
    return (
        <div>
            {/* Your component JSX */}
        </div>
    );
}
```

### **Node.js Integration**

```javascript
// Server-side processing (if implemented)
const MotionAmplifier = require('./motion-amplifier-node');

const amplifier = new MotionAmplifier();

app.post('/process-video', async (req, res) => {
    try {
        const result = await amplifier.processVideoBuffer(
            req.body.videoBuffer,
            req.body.parameters
        );
        
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

---

## 📚 **Additional Resources**

- **[User Guide](./user-guide.md)** - Complete usage instructions
- **[Performance Guide](./performance.md)** - Optimization tips
- **[Examples Repository](./examples/)** - Code examples
- **[TypeScript Definitions](./types/)** - Type definitions

---

**API Reference Last Updated:** December 2024  
**Version:** 2.0.0

*For the latest API updates, check our [GitHub repository](https://github.com/yourusername/motion-amplification-tool)*
