#!/usr/bin/env python3
"""
Simple HTTP server to serve the chatbot UI
Access from your laptop using: http://<YOUR_COMPUTER_IP>:3000
"""

import http.server
import socketserver
import socket
import os
from pathlib import Path

PORT = 3000
DIRECTORY = str(Path(__file__).parent)

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Prevent caching so changes are always visible
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # More detailed logging
        print(f"[{self.log_date_time_string()}] {format % args}")

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    local_ip = get_local_ip()
    
    print("=" * 60)
    print("🚀 Smart Triage Chatbot UI Server")
    print("=" * 60)
    print(f"📂 Serving from: {DIRECTORY}")
    print(f"🌐 Access from your laptop:")
    print(f"   - Local:  http://localhost:{PORT}")
    print(f"   - Network: http://{local_ip}:{PORT}")
    print(f"\n⚠️  Make sure backend is running at: http://192.168.100.212:8000")
    print("=" * 60)
    print()

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✅ Server stopped")
