#!/usr/bin/env python3
"""Serve the Britecyte companysite static files."""
from __future__ import annotations

import http.server
import os
import socket
import socketserver

PORT = 8002
ROOT = os.path.dirname(os.path.abspath(__file__))


def local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)


if __name__ == "__main__":
    ip = local_ip()

    class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True
        allow_reuse_address = True

    with ThreadingServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Serving Britecyte companysite at http://127.0.0.1:{PORT}/")
        print(f"On your phone (same Wi‑Fi): http://{ip}:{PORT}/")
        print("Press Ctrl+C to stop.")
        httpd.serve_forever()
