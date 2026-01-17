const https = require('https');
const http = require('http');

// Load environment variables manually since we are not in Next.js context
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not load .env.local file");
}

// Bypass SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const USER = process.env.WP_ADMIN_USER;
const PASS = process.env.WP_ADMIN_APP_PASSWORD;

console.log('--- Config ---');
console.log('URL:', WP_URL);
console.log('User:', USER);
console.log('Pass:', PASS ? '******' : 'MISSING');

if (!WP_URL || !USER || !PASS) {
    console.error('Missing configuration!');
    process.exit(1);
}

const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');

console.log('\n--- Testing Connection ---');

const url = new URL(`${WP_URL.replace('http://', 'https://')}/wp-json/wp/v2/types`);
const lib = https;

const req = lib.request(url, {
    method: 'GET',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    }
}, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}`);
    if (res.headers.location) {
        console.log(`Redirect Location: ${res.headers.location}`);
    }

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('\n--- Response Body ---');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
