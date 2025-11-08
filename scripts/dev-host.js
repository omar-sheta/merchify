const os = require('os')
const { spawn } = require('child_process')

function getLocalIPs() {
  const nets = os.networkInterfaces()
  const results = []
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // skip over non-ipv4 and internal (i.e. 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        results.push({ name, address: net.address })
      }
    }
  }
  return results
}

const ips = getLocalIPs()
console.log('\nStarting Next.js dev server bound to 0.0.0.0')
console.log('You can open the app on this machine: http://localhost:3000')
if (ips.length) {
  ips.forEach(i => console.log(`On your network: http://${i.address}:3000`))
} else {
  console.log('No network interfaces detected')
}
console.log('--- Launching next dev (this will stream logs below) ---\n')

// Spawn next dev via npx to ensure local binary is used
const proc = spawn('npx', ['next', 'dev', '-H', '0.0.0.0'], { stdio: 'inherit' })
proc.on('close', (code) => {
  process.exit(code)
})
