# 🔧 Motion Amplification Pro - Troubleshooting Guide

This comprehensive guide helps you resolve common issues and optimize performance.

## 🚨 **Quick Fix Checklist**

**Try these first (fixes 90% of issues):**
- [ ] ✅ Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- [ ] ✅ Use Chrome or Edge browser
- [ ] ✅ Enable GPU acceleration
- [ ] ✅ Grant camera permissions
- [ ] ✅ Check file format (MP4, WebM, AVI, MOV)
- [ ] ✅ Use HTTPS for webcam features
- [ ] ✅ Close other camera apps
- [ ] ✅ Check browser console (F12) for errors

---

## 📹 **Video Upload Issues**

### **"File not supported" Error**
**Problem**: Video file format not recognized
```
❌ Error: Please select a valid video file
```

**Solutions**:
1. **Check format**: Only MP4, WebM, AVI, MOV are supported
2. **Convert video**: Use online converter or VLC media player
3. **Check encoding**: Some rare codecs may not work
4. **File integrity**: Try with a different video file

**Supported formats**:
- ✅ MP4 (H.264, H.265)
- ✅ WebM (VP8, VP9)
- ✅ AVI (various codecs)
- ✅ MOV (QuickTime)

### **"File too large" Error**
**Problem**: Video exceeds size limits
```
❌ File too large. Maximum size: 500MB (Enable GPU for larger files)
```

**Solutions**:
1. **Enable GPU mode**: Increases limit to 500MB
2. **Compress video**: Use online tools or video editor
3. **Reduce resolution**: Lower quality = smaller file
4. **Trim video**: Use shorter clips
5. **Change format**: WebM is often smaller than MP4

**Size limits**:
- 🚀 With GPU: 500MB, 2 minutes
- 💻 Without GPU: 100MB, 30 seconds

### **Video Loads But Won't Process**
**Problem**: Video appears but processing fails

**Solutions**:
1. Check video properties (not corrupted)
2. Try different amplification settings
3. Ensure video has actual motion to amplify
4. Check browser compatibility
5. Try a different video file

---

## 📷 **Webcam Problems**

### **"Camera access denied" Error**
**Problem**: Browser blocked camera permissions
```
❌ Camera access denied. Please allow camera permissions and refresh the page.
```

**Solutions**:
1. **Grant permissions**:
   - Chrome: Click camera icon in address bar
   - Firefox: Click camera icon in address bar
   - Safari: Safari > Preferences > Websites > Camera
   - Edge: Click camera icon in address bar

2. **Reset permissions**:
   - Chrome: Settings > Privacy > Site Settings > Camera
   - Firefox: Settings > Privacy > Permissions > Camera
   - Clear site data and try again

3. **Check system permissions**:
   - Windows: Settings > Privacy > Camera
   - macOS: System Preferences > Security & Privacy > Camera
   - Ensure browser has camera access

### **"No camera found" Error**
**Problem**: System can't detect camera
```
❌ No camera found. Please connect a camera and try again.
```

**Solutions**:
1. **Check hardware**:
   - Ensure camera is properly connected
   - Try a different USB port
   - Test camera in other apps
   - Restart computer if necessary

2. **Driver issues**:
   - Update camera drivers
   - Check Device Manager (Windows)
   - Try different camera if available

3. **External cameras**:
   - Ensure camera is plugged in and powered
   - Check USB cable connection
   - Try different USB port

### **"Camera in use" Error**
**Problem**: Another app is using the camera
```
❌ Camera is being used by another application. Please close other camera apps.
```

**Solutions**:
1. **Close other apps**:
   - Skype, Zoom, Teams, Discord
   - Other browser tabs using camera
   - Camera/photo apps
   - Virtual meeting software

2. **Restart browser**: Close all browser windows and reopen
3. **Restart computer**: If issue persists
4. **Check background apps**: Look for apps using camera in background

### **Camera Starts But Shows Black Screen**
**Problem**: Camera permission granted but no video

**Solutions**:
1. **Camera settings**:
   - Try different camera (if multiple available)
   - Check camera app settings
   - Ensure camera isn't covered

2. **Browser issues**:
   - Refresh the page
   - Try incognito/private mode
   - Clear browser cache
   - Try different browser

3. **System issues**:
   - Update camera drivers
   - Restart camera service (Windows)
   - Check camera privacy settings

### **Poor Camera Quality**
**Problem**: Camera works but quality is poor

**Solutions**:
1. **Lighting**: Ensure good lighting conditions
2. **Camera selection**: Choose higher quality camera from dropdown
3. **Clean lens**: Physical camera lens cleaning
4. **Positioning**: Adjust camera angle and distance
5. **Browser settings**: Some browsers limit quality

---

## ⚡ **Performance Issues**

### **Very Slow Processing**
**Problem**: Video processing takes too long

**Solutions**:
1. **Enable GPU acceleration**:
   - Click "⚡ GPU Mode" toggle
   - Check WebGL support in browser
   - Update graphics drivers

2. **Optimize video**:
   - Use shorter videos (< 30 seconds for testing)
   - Reduce resolution (720p instead of 4K)
   - Lower amplification factor
   - Reduce pyramid levels

3. **Browser optimization**:
   - Close unnecessary tabs
   - Restart browser
   - Clear cache and cookies
   - Use Chrome or Edge for best performance

4. **System optimization**:
   - Close other applications
   - Ensure sufficient RAM available
   - Check CPU/GPU usage

### **Browser Freezes During Processing**
**Problem**: Browser becomes unresponsive

**Solutions**:
1. **Reduce processing load**:
   - Use smaller videos
   - Lower quality settings
   - Enable GPU mode (paradoxically helps)
   - Process shorter clips

2. **Browser settings**:
   - Increase browser memory limit
   - Disable unnecessary extensions
   - Use 64-bit browser version

3. **System resources**:
   - Close other applications
   - Ensure 8GB+ RAM available
   - Check system temperature

### **Memory Issues**
**Problem**: "Out of memory" errors

**Solutions**:
1. **Reduce memory usage**:
   - Use smaller video files
   - Lower resolution settings
   - Process shorter segments
   - Close other tabs/apps

2. **Browser settings**:
   - Clear browser cache
   - Restart browser
   - Use browser task manager (Shift+Esc in Chrome)

3. **System optimization**:
   - Close unnecessary applications
   - Add more RAM if possible
   - Use virtual memory if needed

---

## 🎮 **GPU/WebGL Issues**

### **GPU Mode Not Available**
**Problem**: GPU toggle is disabled or not working

**Solutions**:
1. **Check WebGL support**:
   - Visit `chrome://gpu/` in Chrome
   - Visit `about:support` in Firefox
   - Look for WebGL errors

2. **Update drivers**:
   - Update graphics card drivers
   - Restart computer after update
   - Check manufacturer website

3. **Browser settings**:
   - Enable hardware acceleration
   - Check if WebGL is disabled
   - Try different browser

4. **Graphics hardware**:
   - Ensure dedicated GPU is being used
   - Check GPU isn't overheating
   - Try integrated graphics if issues persist

### **WebGL Context Lost**
**Problem**: GPU processing stops working
```
⚠️ WebGL context lost - processing will fallback to CPU
```

**Solutions**:
1. **Reduce GPU load**: Use smaller videos
2. **Update drivers**: Install latest graphics drivers
3. **Check temperature**: Ensure GPU isn't overheating
4. **Restart browser**: Close and reopen browser
5. **Hardware acceleration**: Disable/enable in browser settings

---

## 💾 **Export Problems**

### **Video Export Fails**
**Problem**: Can't save processed video

**Solutions**:
1. **Browser support**:
   - Chrome/Edge: Full support
   - Firefox: Limited format support
   - Safari: May have limitations

2. **File system**:
   - Ensure sufficient disk space
   - Check download folder permissions
   - Try different download location

3. **Video size**:
   - Reduce export quality
   - Use shorter video clips
   - Try exporting frames instead

### **Export Takes Too Long**
**Problem**: Video export is very slow

**Solutions**:
1. **Reduce quality**: Lower export quality setting
2. **Shorter videos**: Export shorter clips
3. **System resources**: Close other applications
4. **Browser optimization**: Restart browser

### **Exported Video Won't Play**
**Problem**: Exported file doesn't work

**Solutions**:
1. **Codec compatibility**: Try different player (VLC)
2. **File corruption**: Re-export the video
3. **Format support**: Use different export format
4. **File size**: Check file isn't 0 bytes

---

## 🌐 **Browser-Specific Issues**

### **Chrome/Edge**
```
✅ Best Performance
⚠️ Potential Issues:
- Hardware acceleration disabled
- Insufficient memory
- Extension conflicts
```

**Solutions**:
- Enable hardware acceleration: Settings > Advanced > System
- Disable extensions: Try incognito mode
- Clear cache: Settings > Privacy > Clear browsing data

### **Firefox**
```
✅ Good Performance  
⚠️ Potential Issues:
- WebGL compatibility
- Memory usage
- Video codec support
```

**Solutions**:
- Enable WebGL: about:config > webgl.force-enabled = true
- Increase memory: about:config > browser.cache.memory.capacity
- Update browser to latest version

### **Safari**
```
✅ Works Well on macOS
⚠️ Potential Issues:
- iOS limitations
- WebGL restrictions
- Export limitations
```

**Solutions**:
- Enable WebGL: Develop > Experimental Features
- Allow camera: Safari > Preferences > Websites
- Use macOS for best experience

### **Mobile Browsers**
```
⚠️ Limited Performance
Known Issues:
- Reduced processing power
- Memory constraints
- Limited file access
```

**Solutions**:
- Use smaller videos
- Reduce quality settings
- Close other apps
- Use desktop browser when possible

---

## 🔧 **Advanced Troubleshooting**

### **Enable Debug Mode**
1. Open browser console (F12)
2. Run: `window.motionAmp.enableDebugMode()`
3. Check detailed error messages
4. Share console output when reporting bugs

### **Check System Information**
```javascript
// Run in browser console
console.log('Browser:', navigator.userAgent);
console.log('WebGL:', !!document.createElement('canvas').getContext('webgl'));
console.log('Camera:', !!navigator.mediaDevices);
console.log('Memory:', performance.memory);
```

### **Test Individual Features**
```javascript
// Test WebGL
window.motionAmpDebug.testWebGL();

// Test Camera
window.motionAmpDebug.testWebcam();

// Test Basic Functionality
window.motionAmpDebug.testBasicFunctionality();

// Run All Tests
window.motionAmpDebug.runAllTests();
```

### **Performance Monitoring**
1. Open browser console (F12)
2. Go to Performance tab
3. Record while processing video
4. Analyze for bottlenecks

### **Network Issues** (if using server features)
1. Check browser Network tab (F12)
2. Look for failed requests
3. Check CORS policies
4. Verify server is running

---

## 📊 **Performance Optimization**

### **Best Settings for Your Hardware**

**High-End System (Gaming PC/Workstation)**:
- ✅ Enable GPU mode
- ✅ Use 4K videos
- ✅ Maximum quality settings
- ✅ Real-time processing
- ✅ Large amplification factors

**Mid-Range System (Modern Laptop)**:
- ✅ Enable GPU mode
- ⚠️ Use 1080p videos
- ⚠️ Medium quality settings
- ⚠️ Selective real-time processing
- ⚠️ Moderate amplification

**Low-End System (Older Computer)**:
- ❌ Disable GPU mode
- ❌ Use 720p or lower
- ❌ Minimum quality settings
- ❌ No real-time processing
- ❌ Low amplification factors

---

## 🆘 **Still Having Issues?**

### **Before Reporting a Bug**
1. ✅ Try all solutions in this guide
2. ✅ Test in different browser
3. ✅ Check with simple video file
4. ✅ Note your exact browser/OS versions
5. ✅ Copy any console error messages

### **How to Report Issues**
1. **GitHub Issues**: [Create detailed issue](https://github.com/icyhawk88/motion-amplification-tool/issues)
2. **Include information**:
   - Browser and version
   - Operating system
   - Video file details
   - Exact error messages
   - Console output (F12)
   - Steps to reproduce

### **Emergency Workarounds**
- **Use different browser**: Chrome usually works best
- **Try incognito mode**: Eliminates extension conflicts
- **Use smaller files**: Reduces processing complexity
- **Restart everything**: Browser, computer if needed
- **Use CPU mode**: If GPU causes issues

---

## 📚 **Additional Resources**

- 📖 **User Guide**: Complete feature documentation
- 🚀 **Quick Start**: Get up and running in 60 seconds
- 🔬 **API Reference**: For developers
- 💬 **Community**: GitHub Discussions
- 🐛 **Bug Reports**: GitHub Issues

---

*Remember: Motion Amplification Pro is a complex application pushing browser limits. Most issues can be resolved with the solutions above!* 🚀
