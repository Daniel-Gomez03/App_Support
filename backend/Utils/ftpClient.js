// ============================================
// UTIL: FTP CLIENT
// Sube y elimina archivos en el servidor FTP
// donde se alojan imágenes de perfil, adjuntos
// de chat y evidencias de tickets.
//
// Cada función crea su propia instancia de
// Client y la cierra en finally; no se reutiliza
// conexión entre llamadas porque basic-ftp no
// es thread-safe y las operaciones son poco
// frecuentes.
//
// uploadToFTP → fallo lanza excepción (la
//   subida es crítica; si falla, el controlador
//   debe abortar y notificar al cliente).
// deleteFromFTP → fallo solo emite warn (borrar
//   un archivo antiguo es secundario; no vale
//   la pena interrumpir el flujo por ello).
//
// Las rutas se limpian de slashes dobles para
// evitar paths inválidos cuando las variables
// de entorno incluyen o no trailing slash.
// ============================================

const ftp = require("basic-ftp");

exports.uploadToFTP = async (localPath, remoteName) => {
    const client = new ftp.Client();

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        const cleanPath = process.env.FTP_REMOTE_PATH.replace(/^\/+|\/+$/g, '');
        const cleanFileName = remoteName.replace(/^\/+/, '');
        const remoteFolder = `/${cleanPath}`;
        const remoteFile = `${remoteFolder}/${cleanFileName}`;

        await client.ensureDir(remoteFolder);
        await client.uploadFrom(localPath, remoteFile);

        const cleanBaseUrl = process.env.FTP_BASE_URL.replace(/\/+$/, '');

        return `${cleanBaseUrl}/${cleanFileName}`;

    } catch (err) {
        console.error("Error en subida FTP:", err.message);
        throw err;
    } finally {
        client.close();
    }
};

exports.deleteFromFTP = async (remotePath) => {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        const finalDeletePath = `/${remotePath.replace(/^\/+/, '')}`;

        await client.remove(finalDeletePath);
        console.log("Imagen antigua eliminada del FTP");
    } catch (err) {
        console.warn("No se pudo borrar la imagen antigua:", err.message);
    } finally {
        client.close();
    }
};