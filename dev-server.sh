# Motion Amplification Pro - Development Server

# Python 3 Development Server
echo "🚀 Starting Motion Amplification Pro Development Server..."
echo "📁 Serving from: $(pwd)"
echo "🌐 Available at: http://localhost:8000"
echo "📱 Mobile testing: http://[your-ip]:8000"
echo ""
echo "💡 Tips:"
echo "   • Use HTTPS for webcam features: python -m http.server 8000 --bind 0.0.0.0"
echo "   • For mobile testing, find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)"
echo "   • Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Using Python"
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python or use another method:"
    echo ""
    echo "Alternative options:"
    echo "   Node.js: npx serve ."
    echo "   PHP: php -S localhost:8000"
    echo "   Live Server extension in VS Code"
    echo ""
fi
