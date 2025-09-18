#!/bin/bash

# Deploy NestFi subgraph to The Graph
echo "🚀 Deploying NestFi subgraph to The Graph..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your deployment key."
    exit 1
fi

# Source environment variables
source .env

# Check if DEPLOY_KEY is set
if [ -z "$DEPLOY_KEY" ]; then
    echo "❌ DEPLOY_KEY not found in .env file"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate code
echo "🔧 Generating code..."
npm run codegen

# Build subgraph
echo "🏗️ Building subgraph..."
npm run build

# Deploy to The Graph
echo "🚀 Deploying to The Graph..."
graph deploy --node https://api.thegraph.com/deploy/ --access-token $DEPLOY_KEY nestfi-sepolia

echo "✅ Deployment complete!"
echo "🌐 Subgraph URL: https://thegraph.com/hosted-service/subgraph/nestfi-sepolia"
