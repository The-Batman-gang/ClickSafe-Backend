const { checkSSL } = require("./ssl.service");
const { getWhois } = require("./whois.service");
const { getDNS } = require("./dns.service");
const { checkRedirects } = require("./redirect.service");
const { getHosting } = require("./hosting.service");

async function analyzeTechnical(url) {
    const [
        ssl,
        whois,
        dns,
        redirects,
        hosting,
    ] = await Promise.all([
        checkSSL(url),
        getWhois(url),
        getDNS(url),
        checkRedirects(url),
        getHosting(url),
    ]);

    return {
        ssl,
        whois,
        dns,
        redirects,
        hosting,
    };
}

module.exports = {
    analyzeTechnical,
};