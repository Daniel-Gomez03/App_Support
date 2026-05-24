// ============================================
// UTIL: ENCRYPTION
// Cifrado simétrico AES-256-CBC para los
// mensajes del chat. Los comentarios se guardan
// cifrados en BD; se descifran al leerlos para
// que un volcado de base de datos no exponga
// conversaciones en texto plano.
//
// Formato del texto cifrado: "<iv_hex>:<cipher_hex>"
// El IV (vector de inicialización) se genera
// aleatoriamente en cada cifrado y se antepone
// al resultado para que el mismo texto plano
// produzca salidas distintas cada vez.
//
// La clave se lee del entorno en cada operación
// para detectar configuraciones inválidas de
// inmediato en lugar de fallar silenciosamente.
// CHAT_ENCRYPTION_KEY debe ser una cadena hex
// de 64 caracteres (= 32 bytes = 256 bits).
// ============================================

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

const getKey = () => {
    const key = process.env.CHAT_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error('CHAT_ENCRYPTION_KEY debe ser una cadena hex de 64 caracteres (32 bytes).');
    }
    return Buffer.from(key, 'hex');
};

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText) => {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = { encrypt, decrypt };