#!/bin/bash
# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Installation completed!"
  echo ""
  echo "To start development, run:"
  echo "npm run dev"
  echo ""
else
  echo ""
  echo "❌ Error during installation"
  echo ""
fi
