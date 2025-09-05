import fs from 'fs'
import crypto, { createHmac } from 'crypto'

export interface JWTBody {
    sub: string,
    user: string,
    iat: number
}

interface Header {
    alg: string,
    typ: string
}

function getKey(): string {
    if (fs.existsSync('hmac.key')) {
        const fileKey = fs.readFileSync('hmac.key', 'utf8');
        if (fileKey) {
            return fileKey;
        } else {
            throw new Error('Could not read hmac key file!');
        }
    }
    const hmacKey = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync('hmac.key', hmacKey);
    return hmacKey;
}

export function generateToken(body: JWTBody): string {
    const header: Header = {
        alg: 'HS256',
        typ: 'JWT'
    }
    let token = Buffer.from(JSON.stringify(header), 'utf8').toString('base64url') + '.' + Buffer.from(JSON.stringify(body), 'utf8').toString('base64url');
    token += '.' + createHmac('sha256', getKey()).update(token).digest('base64url');
    return token;
}