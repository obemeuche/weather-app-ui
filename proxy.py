#!/usr/bin/env python3
"""
proxy.py — Serves the weather app on port 3000 AND proxies
/api/v1/* to the Spring Boot backend at localhost:8080,
injecting CORS headers so the browser fetch() works.
"""
import http.server, urllib.request, urllib.error, os, sys

BACKEND   = "http://localhost:8080"
STATIC    = os.path.dirname(os.path.abspath(__file__))
PORT      = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            super().do_GET()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _proxy(self):
        url = BACKEND + self.path
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = resp.read()
                self.send_response(resp.status)
                self._cors()
                self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as e:
            body = e.read()
            self.send_response(e.code)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            msg = str(e).encode()
            self.send_response(502)
            self._cors()
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

    def log_message(self, fmt, *args):
        sys.stderr.write(f"[proxy] {self.address_string()} - {fmt % args}\n")

if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as srv:
        print(f"✓ Skye proxy running → http://localhost:{PORT}", flush=True)
        print(f"  Static: {STATIC}", flush=True)
        print(f"  Backend proxy: {BACKEND}/api/*", flush=True)
        srv.serve_forever()
