@echo off
cls
echo 🚀 Motion Amplification Pro - Development Server
echo ================================================
echo.
echo 📁 Serving from: %CD%
echo 🌐 Available at: http://localhost:8000
echo 📱 Mobile testing: http://[your-ip]:8000
echo.
echo 💡 Tips:
echo    • For HTTPS (required for webcam on some browsers^): Use a proper HTTPS server
echo    • For mobile testing, find your IP with: ipconfig
echo    • Press Ctrl+C to stop the server
echo.

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Using Python
    echo Starting server...
    echo.
    python -m http.server 8000
) else (
    echo ❌ Python not found. Please install Python or use another method:
    echo.
    echo Alternative options:
    echo    Node.js: npx serve .
    echo    PHP: php -S localhost:8000
    echo    Live Server extension in VS Code
    echo    Python: Download from https://python.org
    echo.
    pause
)
