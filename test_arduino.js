const SerialPort = require('serialport'); 
const port = new SerialPort('COM6', { baudRate: 9600 }); 
port.on('open', () => console.log('Port opened')); 
port.on('data', (data) => console.log('Received:', data)); 
port.on('error', (err) => console.log('Error:', err)); 
setTimeout(() => port.close(), 5000); 
setTimeout(() => process.exit(0), 6000); 
