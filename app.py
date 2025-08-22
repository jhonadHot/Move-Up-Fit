import webbrowser
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

def start_server():
    """Inicia servidor HTTP local"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
    print("Servidor iniciado em http://localhost:8000")
    server.serve_forever()

def open_browser():
    """Abre o navegador na página inicial"""
    webbrowser.open('http://localhost:8000')

if __name__ == "__main__":
    # Inicia servidor em thread separada
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Abre navegador
    threading.Timer(1, open_browser).start()
    
    print("Pressione Ctrl+C para parar o servidor")
    try:
        server_thread.join()
    except KeyboardInterrupt:
        print("\nServidor parado")