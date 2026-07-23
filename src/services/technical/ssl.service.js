const tls = require("tls");
const { URL } = require("url");

async function checkSSL(websiteUrl) {
    return new Promise((resolve) => {
        try {
            const hostname = new URL(websiteUrl).hostname;

            const socket = tls.connect(
                443,
                hostname,
                {
                    servername: hostname,
                    rejectUnauthorized: false
                },
                () => {
                    const cert = socket.getPeerCertificate();

                    resolve({
                        valid: true,
                        issuer: cert.issuer?.O || cert.issuer,
                        subject: cert.subject?.CN || cert.subject,
                        valid_from: cert.valid_from,
                        valid_to: cert.valid_to,
                        expires_in_days: Math.ceil(
                            (new Date(cert.valid_to) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        )
                    });

                    socket.end();
                }
            );

            socket.on("error", () => {
                resolve({
                    valid: false,
                    reason: "SSL connection failed"
                });
            });

        } catch {
            resolve({
                valid: false,
                reason: "Invalid URL"
            });
        }
    });
}

module.exports = {
    checkSSL
};