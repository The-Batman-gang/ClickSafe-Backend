const dns = require("dns").promises;
const { URL } = require("url");

async function getDNS(websiteUrl) {
    try {
        const hostname = new URL(websiteUrl).hostname;

        const [aRecords, aaaaRecords, mxRecords, nsRecords] =
            await Promise.allSettled([
                dns.resolve4(hostname),
                dns.resolve6(hostname),
                dns.resolveMx(hostname),
                dns.resolveNs(hostname),
            ]);

        return {
            success: true,

            A:
                aRecords.status === "fulfilled"
                    ? aRecords.value
                    : [],

            AAAA:
                aaaaRecords.status === "fulfilled"
                    ? aaaaRecords.value
                    : [],

            MX:
                mxRecords.status === "fulfilled"
                    ? mxRecords.value
                    : [],

            NS:
                nsRecords.status === "fulfilled"
                    ? nsRecords.value
                    : [],
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
        };
    }
}

module.exports = {
    getDNS,
};