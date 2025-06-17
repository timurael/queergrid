#!/bin/bash

echo "🏳️‍🌈 Setting up Queer Grid GDPR-compliant backend..."

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env with your actual configuration values!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs storage

# Initialize database (if using SQLite for development)
echo "🗄️  Setting up database..."
if [ "$1" = "sqlite" ]; then
    echo "Using SQLite for development..."
    sed -i '' 's|DATABASE_URL="postgresql://.*"|DATABASE_URL="file:./dev.db"|' .env
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "✨ Setup complete! Next steps:"
echo "1. Edit .env with your configuration"
echo "2. Set up your database: npm run db:migrate"
echo "3. Start the server: npm run dev"
echo ""
echo "🚀 Your GDPR-compliant backend is ready!" 