# J.A.R.V.I.S. Homelab Dashboard

> "Good evening, sir. The estate systems are online and awaiting your command."

A sleek, Iron Man / J.A.R.V.I.S.-themed homelab command center for monitoring and controlling Proxmox infrastructure. Built as a single-page application with real-time status updates and a distinctively futuristic aesthetic.

![J.A.R.V.I.S. Interface](https://img.shields.io/badge/Theme-J.A.R.V.I.S.-00d4ff?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Operational-brightgreen?style=for-the-badge)

## Features

- **Real-time Server Monitoring**: Live status updates for all Proxmox servers
- **Container Management**: View and monitor LXC containers across multiple nodes
- **Service Discovery**: Automatic detection of services running on containers
- **Resource Metrics**: CPU, memory, and storage utilization at a glance
- **Quick Actions**: One-click access to service web interfaces
- **Responsive Design**: Works on desktop and tablet displays
- **Arc Reactor Aesthetic**: Because every homelab deserves a little *flair*

## Design

The interface draws inspiration from the J.A.R.V.I.S. system seen in Iron Man, featuring:
- Cyan/blue color palette with glowing accents
- Hexagonal and geometric design elements
- Smooth animations and transitions
- Status indicators with pulsing effects
- Terminal-style typography

## Configuration

Edit `servers.json` to configure your infrastructure:

```json
{
  "servers": [
    {
      "id": "main-server",
      "name": "Main Server",
      "type": "proxmox",
      "ip": "192.168.0.77",
      "port": 8006,
      "containers": [
        {
          "vmid": 100,
          "name": "Service Name",
          "ip": "192.168.0.x",
          "port": 8080,
          "description": "Service description"
        }
      ]
    }
  ]
}
```

## Usage

1. Clone the repository
2. Configure `servers.json` with your infrastructure details
3. Serve with any static web server or open `index.html` directly

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or simply open in browser
open index.html
```

## Security Note

This dashboard is designed for **local network use only**. It does not include authentication and should not be exposed to the public internet.

## License

MIT License - See [LICENSE](LICENSE) for details.

---

*"I am J.A.R.V.I.S. - Just A Rather Very Intelligent System."*
