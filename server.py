import os
import json
import smtplib
import sys
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Simple .env parser to avoid requiring external libraries
if os.path.exists('.env'):
    with open('.env') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v

GMAIL_USER = os.environ.get("GMAIL_USER", "sbasharat577@gmail.com")
GMAIL_APP_PASS = os.environ.get("GMAIL_APP_PASS")

if not GMAIL_APP_PASS:
    print("Warning: GMAIL_APP_PASS not set. Emails will fail to send.")

def send_email_async(date_str, cravings_str):
    try:
        # Build Email Message
        msg = MIMEMultipart()
        msg['From'] = GMAIL_USER
        msg['To'] = GMAIL_USER
        msg['Subject'] = 'Birthday Celebration Date Planned! 🎂✨'
        
        body = f"Hey! Shahnaza has planned our Birthday Celebration Date! 🎂✨\n\n📅 When: {date_str}\n🍔 Cravings: {cravings_str}\n\nEverything is set! Get ready for a wonderful day. 💖"
        msg.attach(MIMEText(body, 'plain'))
        
        # SMTP Send with a 3.0 second timeout limit
        print(f"Connecting to Gmail SMTP for {GMAIL_USER} (Async)...")
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=3.0)
        server.login(GMAIL_USER, GMAIL_APP_PASS)
        server.sendmail(GMAIL_USER, GMAIL_USER, msg.as_string())
        server.close()
        print("Email sent successfully via Gmail SMTP!")
    except Exception as e:
        print(f"Async SMTP Error: {e}")

class DatePlannerHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/submit-date':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                date_str = data.get('date')
                foods_str = data.get('cravings')
                
                # Start SMTP sending in a separate background thread to keep HTTP server non-blocking
                email_thread = threading.Thread(target=send_email_async, args=(date_str, foods_str))
                email_thread.daemon = True
                email_thread.start()
                
                # Instantly respond HTTP 200 success to the browser
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
                
            except Exception as e:
                print(f"Error starting email thread: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
        else:
            super().do_POST()
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, DatePlannerHandler)
    print(f"Local SMTP-enabled server running on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run(port)
