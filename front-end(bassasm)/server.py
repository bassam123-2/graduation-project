#!/usr/bin/env python3
"""
Simple Frontend Server for AL-BOQAI Center
Serves the frontend files on port 3000
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the directory containing this script
current_dir = Path(__file__).resolve().parent

# Change to the frontend directory
os.chdir(current_dir)

PORT = 3000
HOST = "127.0.0.1"  # Explicitly bind to localhost

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom logging for better debugging
        logger.info(f"{self.address_string()} - {format % args}")

def main():
    try:
        logger.info(f"🔧 Starting server on {HOST}:{PORT}")
        logger.info(f"📁 Serving files from: {current_dir}")
        
        # Check if port is available
        try:
            with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
                logger.info(f"🚀 AL-BOQAI Center Frontend Server Started!")
                logger.info(f"📱 Frontend available at: http://{HOST}:{PORT}")
                logger.info(f"🔗 Backend API at: http://localhost:8080")
                logger.info(f"📁 Serving files from: {current_dir}")
                print("\n" + "="*60)
                print("Press Ctrl+C to stop the server")
                print("="*60)
                
                httpd.serve_forever()
                
        except OSError as e:
            if e.errno == 48:  # Address already in use
                logger.error(f"❌ Port {PORT} is already in use. Please stop other services using this port.")
                logger.error("You can use: lsof -i :3000 (Linux/Mac) or netstat -ano | findstr :3000 (Windows)")
            else:
                logger.error(f"❌ Failed to start server: {e}")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("\n\n⚠️ Frontend server stopped by user")
    except Exception as e:
        logger.error(f"\n\n❌ Frontend server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
