const whois = require("whois-json");
const { URL } = require("url");

async function getWhois(websiteUrl) {
    try {
        const hostname = new URL(websiteUrl).hostname;

        const data = await whois(hostname);

        const creationDate =
            data.creationDate ||
            data.created ||
            data["Creation Date"];

        const expiryDate =
            data.registryExpiryDate ||
            data.expirationDate ||
            data["Registry Expiry Date"];

        let domainAgeDays = null;

        if (creationDate) {
            domainAgeDays = Math.floor(
                (Date.now() - new Date(creationDate)) /
                (1000 * 60 * 60 * 24)
            );
        }

        return {
            success: true,
            registrar: data.registrar || null,
            creationDate,
            expiryDate,
            domainAgeDays,
            country: data.country || null,
            nameServers: data.nameServer || data.nameServers || []
        };

    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
    getWhois
};