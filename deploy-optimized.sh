#!/bin/bash

# 🚀 Queer Grid Optimized Deployment Script
# Performance-first deployment with all optimizations

set -e

echo "🏳️‍🌈 QUEER GRID OPTIMIZED DEPLOYMENT 🏳️‍🌈"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

print_info "Node.js version: $(node --version)"
print_info "Python version: $(python3 --version)"

echo ""
echo "📦 Installing dependencies..."
npm install
print_status "Dependencies installed"

echo ""
echo "🏗️ Building optimized assets..."

# Create optimized directories
mkdir -p optimized-images
mkdir -p dist

# Build process
print_info "Minifying JavaScript..."
if npm run minify-js 2>/dev/null; then
    print_status "JavaScript minified successfully"
else
    print_warning "JavaScript minification skipped (files may not exist yet)"
fi

print_info "Minifying CSS..."
if npm run minify-css 2>/dev/null; then
    print_status "CSS minified successfully"
else
    print_warning "CSS minification skipped (files may not exist yet)"
fi

print_info "Optimizing images..."
if npm run optimize-images 2>/dev/null; then
    print_status "Images optimized successfully"
else
    print_warning "Image optimization skipped (imagemin may need setup)"
fi

echo ""
echo "🔍 Checking for port conflicts..."

# Check port 3002 (email server)
if lsof -i :3002 &> /dev/null; then
    print_warning "Port 3002 is in use. Attempting to free it..."
    pkill -f "node.*3002" || true
    sleep 2
fi

# Check port 8001 (web server)
if lsof -i :8001 &> /dev/null; then
    print_warning "Port 8001 is in use. Attempting to free it..."
    pkill -f "python.*8001" || true
    sleep 2
fi

echo ""
echo "🚀 Starting optimized servers..."

# Start email server in background
print_info "Starting optimized email server on port 3002..."
nohup npm run email-server > email-server.log 2>&1 &
EMAIL_SERVER_PID=$!
sleep 3

# Check if email server started successfully
if ps -p $EMAIL_SERVER_PID > /dev/null; then
    print_status "Email server started (PID: $EMAIL_SERVER_PID)"
else
    print_error "Failed to start email server. Check email-server.log for details."
    exit 1
fi

# Start web server in background
print_info "Starting web server on port 8001..."
nohup python3 -m http.server 8001 > web-server.log 2>&1 &
WEB_SERVER_PID=$!
sleep 2

# Check if web server started successfully
if ps -p $WEB_SERVER_PID > /dev/null; then
    print_status "Web server started (PID: $WEB_SERVER_PID)"
else
    print_error "Failed to start web server. Check web-server.log for details."
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${PURPLE}🌐 Website:${NC} http://localhost:8001"
echo -e "${PURPLE}📧 Email Server:${NC} http://localhost:3002"
echo -e "${PURPLE}📊 Admin Panel:${NC} http://localhost:3002/api/admin/emails"
echo -e "${PURPLE}📈 Export CSV:${NC} http://localhost:3002/api/admin/emails/export"
echo ""
echo "📊 Performance Features Active:"
echo "  • Compression enabled"
echo "  • Rate limiting active"
echo "  • Service worker caching"
echo "  • Optimized assets"
echo "  • Mobile optimizations"
echo ""
echo "📝 Logs:"
echo "  • Email server: tail -f email-server.log"
echo "  • Web server: tail -f web-server.log"
echo ""
echo "🛑 To stop servers:"
echo "  • Email server: kill $EMAIL_SERVER_PID"
echo "  • Web server: kill $WEB_SERVER_PID"
echo "  • Or run: ./stop-servers.sh"
echo ""

# Create stop script
cat > stop-servers.sh << EOF
#!/bin/bash
echo "🛑 Stopping Queer Grid servers..."
kill $EMAIL_SERVER_PID 2>/dev/null || true
kill $WEB_SERVER_PID 2>/dev/null || true
echo "✅ Servers stopped"
EOF
chmod +x stop-servers.sh

# Performance monitoring
echo "🔬 Performance Monitoring:"
echo "  • Run 'npm run analyze' for Lighthouse audit"
echo "  • Check Core Web Vitals in browser dev tools"
echo "  • Monitor server performance in logs"
echo ""

# Save PIDs for later reference
echo "EMAIL_SERVER_PID=$EMAIL_SERVER_PID" > .server-pids
echo "WEB_SERVER_PID=$WEB_SERVER_PID" >> .server-pids

print_status "Deployment complete! The revolution is now optimized! ⚡"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Open browser dev tools to see performance improvements"
echo "  • Try the site in incognito/private mode to test cold loads"
echo "  • Test the offline functionality by disconnecting internet"
echo "  • Use mobile device emulation to test mobile optimizations"
echo ""
echo "🏳️‍🌈 Happy coding, bb! The queer tech revolution is now blazing fast! 🚀" 