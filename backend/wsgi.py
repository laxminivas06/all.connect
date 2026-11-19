import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app as fastapi_app

try:
    from a2wsgi import ASGIMiddleware
    # Convert FastAPI ASGI application into WSGI for PythonAnywhere
    application = ASGIMiddleware(fastapi_app)
except ImportError:
    # If a2wsgi is not yet installed in the virtualenv
    def application(environ, start_response):
        status = '500 Internal Server Error'
        headers = [('Content-Type', 'text/html; charset=utf-8')]
        start_response(status, headers)
        return [
            b"<h2>AllConnect Backend Deployment Error: 'a2wsgi' is missing.</h2>"
            b"<p>FastAPI is an ASGI framework, but PythonAnywhere runs on WSGI.</p>"
            b"<p>Please open a Bash console in PythonAnywhere and run:</p>"
            b"<pre style='background:#f4f4f4;padding:10px;border-radius:6px;'>pip install a2wsgi</pre>"
            b"<p>Then reload your web app in the Web tab.</p>"
        ]
