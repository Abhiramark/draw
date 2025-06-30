const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const dataFile = 'data.json';

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
}

app.post('/collect', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { userAgent, location } = req.body;

    const entry = {
        time: new Date().toISOString(),
        ip,
        userAgent,
        location
    };

    const data = JSON.parse(fs.readFileSync(dataFile));
    data.push(entry);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    res.sendStatus(200);
});

app.get('/dashboard', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFile));
    let tableRows = data.map(d => `
        <tr>
            <td>${d.time}</td>
            <td>${d.ip}</td>
            <td>${d.userAgent}</td>
            <td>${d.location}</td>
        </tr>
    `).join('');

    res.send(\`
        <html>
        <head>
            <title>IP Tracker Dashboard</title>
            <style>
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #ccc; padding: 8px; }
                th { background-color: #f4f4f4; }
            </style>
        </head>
        <body>
            <h1>IP Tracker Dashboard</h1>
            <table>
                <tr><th>Time</th><th>IP</th><th>User-Agent</th><th>Location</th></tr>
                ${tableRows}
            </table>
        </body>
        </html>
    \`);
});

app.listen(PORT, () => {
    console.log(\`Server running at http://localhost:\${PORT}\`);
});
