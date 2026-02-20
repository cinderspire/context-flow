#!/bin/bash

# Context Flow - Setup Script

echo "🌊 Context Flow - Setup"
echo "========================"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install core dependencies
echo "📦 Installing core dependencies..."
cd core
npm install
npm run build
cd ..

# Install desktop dependencies
echo "📦 Installing desktop dependencies..."
cd apps/desktop
npm install
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev     - Start development"
echo "  npm run build   - Build for production"
echo "  npm run package - Package app"
echo ""
