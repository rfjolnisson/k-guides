#!/bin/bash

# Simple HTTP server for viewing Gold Config guides with JSON bundle loading

echo "🌐 Starting HTTP server for Gold Config guides..."
echo ""
echo "📖 Open in browser:"
echo "   http://localhost:8000/gold-config-package-showcase.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
python3 -m http.server 8000

