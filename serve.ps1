param([int]$Port = 8080)
$root = $PSScriptRoot

Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Collections.Generic;
public class StaticServer {
    static Dictionary<string,string> mime = new Dictionary<string,string>{
        {".html","text/html; charset=utf-8"},{".css","text/css"},
        {".js","application/javascript"},{".svg","image/svg+xml"},
        {".png","image/png"},{".jpg","image/jpeg"},{".ico","image/x-icon"},
        {".woff2","font/woff2"},{".woff","font/woff"},
    };
    public static void Serve(string root, int port) {
        TcpListener listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();
        Console.WriteLine("Serving " + root + " on http://localhost:" + port);
        while (true) {
            TcpClient client = listener.AcceptTcpClient();
            System.Threading.ThreadPool.QueueUserWorkItem(_ => Handle(client, root));
        }
    }
    static void Handle(TcpClient client, string root) {
        try {
            using (client) {
                NetworkStream ns = client.GetStream();
                byte[] buf = new byte[8192];
                int n = ns.Read(buf, 0, buf.Length);
                string req = Encoding.ASCII.GetString(buf, 0, n);
                string path = "/";
                if (req.StartsWith("GET ")) {
                    int s = 4, e = req.IndexOf(' ', s);
                    if (e > s) path = req.Substring(s, e - s);
                }
                int q = path.IndexOf('?');
                if (q >= 0) path = path.Substring(0, q);
                if (path == "/") path = "/index.html";
                string file = Path.Combine(root, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                string ext = Path.GetExtension(file).ToLower();
                string ct;
                if (!mime.TryGetValue(ext, out ct)) ct = "application/octet-stream";
                string header;
                byte[] body;
                if (File.Exists(file)) {
                    body = File.ReadAllBytes(file);
                    header = "HTTP/1.1 200 OK\r\nContent-Type: " + ct + "\r\nContent-Length: " + body.Length + "\r\nConnection: close\r\n\r\n";
                } else {
                    body = Encoding.UTF8.GetBytes("404 Not Found");
                    header = "HTTP/1.1 404 Not Found\r\nContent-Length: " + body.Length + "\r\nConnection: close\r\n\r\n";
                }
                byte[] hb = Encoding.ASCII.GetBytes(header);
                ns.Write(hb, 0, hb.Length);
                ns.Write(body, 0, body.Length);
            }
        } catch {}
    }
}
'@

[StaticServer]::Serve($root, $Port)
