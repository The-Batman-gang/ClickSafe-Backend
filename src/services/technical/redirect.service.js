const axios = require("axios");

async function checkRedirects(url) {
    try {
        const response = await axios.get(url, {
            maxRedirects: 10,
            validateStatus: () => true,
        });

        const redirects = response.request._redirectable?._redirectCount || 0;
        const finalUrl =
            response.request.res?.responseUrl || url;

        return {
            success: true,
            redirectCount: redirects,
            finalUrl,
            redirected: redirects > 0,
            httpsRedirect:
                url.startsWith("http://") &&
                finalUrl.startsWith("https://"),
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
        };
    }
}

module.exports = {
    checkRedirects,
};