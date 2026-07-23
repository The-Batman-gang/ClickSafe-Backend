const dns = require("dns").promises;
const axios = require("axios");
const { URL } = require("url");

async function getHosting(url) {
    try {
        const hostname = new URL(url).hostname;

        const addresses = await dns.resolve4(hostname);

        if (!addresses.length) {
            throw new Error("No IP address found");
        }

        const ip = addresses[0];

        const response = await axios.get(
            `http://ip-api.com/json/${ip}`
        );

        const data = response.data;

        return {
            success: true,
            ip,
            isp: data.isp,
            organization: data.org,
            country: data.country,
            city: data.city,
            as: data.as
        };

    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
    getHosting
};