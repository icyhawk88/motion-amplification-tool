# 📖 User Guide - Motion Amplification Pro

Welcome to Motion Amplification Pro! This guide will help you get started with revealing hidden motions in your videos.

## 🚀 Quick Start

### 1. **Upload a Video**
- Click the upload zone or drag and drop your video file
- Supported formats: MP4, WebM, AVI, MOV
- Maximum file size: 500MB (with GPU), 100MB (CPU only)
- Maximum duration: 2 minutes (with GPU), 30 seconds (CPU only)

### 2. **Choose Your Settings**
- **Use a Preset**: Click one of the 8 smart presets for common use cases
- **Manual Settings**: Adjust the sliders to fine-tune parameters

### 3. **Process Your Video**
- Click "🚀 Process Video" to start
- Enable GPU acceleration for faster processing
- Watch the real-time progress indicator

### 4. **View and Export Results**
- Use the before/after comparison slider
- Click "▶️ Play" to view the amplified motion
- Export as video or individual frames

## 🎛️ **Control Parameters**

### **🔊 Amplification Factor (1-100)**
- **Low (1-15)**: Subtle motion enhancement
- **Medium (15-30)**: Visible motion amplification  
- **High (30-100)**: Extreme amplification for barely visible motion

### **📉 Frequency Range**
- **Low Frequency (Hz)**: Minimum motion frequency to amplify
- **High Frequency (Hz)**: Maximum motion frequency to amplify
- **Tip**: Narrow the range for more selective amplification

### **🔺 Pyramid Levels (2-10)**
- More levels = better quality but slower processing
- Recommended: 6 levels for most videos

### **🌀 Gaussian Sigma (0.1-5.0)**
- Controls spatial smoothing
- Higher values = more smoothing, less noise

### **🎨 Chroma Threshold (0.001-0.5)**
- Minimum motion required for amplification
- Higher values = less noise but may miss subtle motion

## 🎯 **Smart Presets**

### **💓 Heartbeat Detection**
Perfect for detecting pulse in facial videos
- Best for: Close-up face videos, medical monitoring
- Frequency: 0.8-3.5 Hz (48-210 BPM)

### **🫁 Breathing Analysis**
Reveals respiratory motion patterns
- Best for: Chest/torso videos, sleep studies
- Frequency: 0.1-1.2 Hz (6-72 breaths/min)

### **📳 Mechanical Vibration**
Amplifies high-frequency mechanical motion
- Best for: Machinery, structures, engines
- Frequency: 5.0-15.0 Hz

### **🏗️ Structural Motion**
Detects building sway and structural vibrations
- Best for: Buildings, bridges, large structures
- Frequency: 0.1-2.5 Hz

### **🔬 Micro-expressions**
Reveals subtle facial expressions
- Best for: Psychology research, emotion detection
- Frequency: 1.0-8.0 Hz

### **🌱 Plant Movement**
Captures slow plant growth and movement
- Best for: Time-lapse botany, growth studies
- Frequency: 0.05-0.8 Hz

### **🌡️ Thermal Effects**
Visualizes thermal convection patterns
- Best for: Heat visualization, thermal studies
- Frequency: 0.1-1.0 Hz

### **🚀 Extreme Amplification**
Maximum amplification for barely visible motion
- Best for: Research, extreme cases
- Frequency: 0.5-10.0 Hz

## 📹 **Live Camera Mode**

### **Setup**
1. Click "📹 Live Camera" tab
2. Select your camera from the dropdown
3. Click "🎥 Start Camera"
4. Grant camera permissions when prompted

### **Real-time Processing**
- Toggle "⚡ Real-time" for live motion amplification
- Adjust parameters to see immediate effects
- Record amplified video with "🔴 Record" button

### **Tips for Best Results**
- Ensure good lighting
- Keep camera steady (use tripod if possible)
- Position subject appropriately for the type of motion
- Start with a preset, then fine-tune

## 📊 **Analysis Mode**

### **Motion Analytics**
- View motion graphs over time
- See frequency spectrum analysis
- Monitor motion intensity heatmaps
- Export data as JSON, CSV, or Excel

### **Performance Metrics**
- Processing speed (FPS)
- GPU acceleration status
- Memory usage
- Video resolution and details

## ⚡ **Performance Features**

### **🎮 GPU Acceleration**
- Click "⚡ GPU Mode" to enable
- Provides 100x faster processing
- Requires WebGL-compatible browser
- Automatically falls back to CPU if unavailable

### **🎯 Region of Interest (ROI)**
- Click "🎯 ROI Selection" to enable
- Click and drag on video to select specific region
- Focuses amplification on selected area only
- Improves performance and reduces noise

### **📱 Progressive Web App (PWA)**
- Install as desktop/mobile app
- Works offline after first visit
- Background processing capabilities
- Receives notifications when processing completes

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Video Won't Load**
- Check file format (MP4, WebM, AVI, MOV supported)
- Verify file size limits
- Ensure video isn't corrupted
- Try a different browser

#### **Processing is Slow**
- Enable GPU acceleration
- Reduce video resolution
- Use shorter video clips
- Close other browser tabs
- Try a simpler preset

#### **Results Look Noisy**
- Increase Chroma Threshold
- Reduce Amplification Factor
- Use Gaussian smoothing (higher Sigma)
- Try ROI selection to focus on specific area

#### **No Motion Visible**
- Increase Amplification Factor
- Check frequency range matches your motion
- Ensure motion actually exists in video
- Try different presets

#### **Browser Compatibility**
- **Chrome**: Full support, best performance
- **Firefox**: Good support, may be slower
- **Safari**: Basic support, limited WebGL
- **Edge**: Full support, good performance

### **Performance Tips**

1. **For Best Quality**: Use GPU mode, higher pyramid levels
2. **For Speed**: Use CPU mode, lower settings, shorter videos
3. **For Large Files**: Enable GPU, use ROI selection
4. **For Real-time**: Lower resolution, simple presets

## 📚 **Advanced Usage**

### **Custom Parameters**
- Start with a preset close to your needs
- Make small adjustments to one parameter at a time
- Test with short video clips first
- Save successful parameter combinations

### **Video Optimization**
- Use stable camera mounting
- Ensure adequate lighting
- Avoid motion blur
- Higher frame rates = better temporal resolution

### **Export Options**
- **Video Export**: Full processed video file
- **Frame Export**: Individual high-quality PNG frames
- **Analysis Export**: Motion data in various formats

## 🆘 **Getting Help**

### **Support Channels**
- **GitHub Issues**: Bug reports and feature requests
- **Discord Community**: Real-time help and discussion
- **Email Support**: Technical assistance
- **Documentation**: Comprehensive guides and examples

### **Useful Resources**
- **Research Papers**: Links to original algorithms
- **Video Tutorials**: Step-by-step guides
- **Example Videos**: Sample files for testing
- **Community Presets**: User-contributed settings

---

**Happy Motion Amplification! 🎬⚡**

*Reveal the invisible world around you with Motion Amplification Pro*
