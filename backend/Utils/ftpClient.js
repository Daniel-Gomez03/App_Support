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
        
        const remoteFolder = `/${cleanPath}`;   
        const remoteFile = `${remoteFolder}/${remoteName}`;

        await client.ensureDir(remoteFolder);

        await client.uploadFrom(localPath, remoteFile);

        return `${process.env.FTP_BASE_URL}/${remoteName}`;
        
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