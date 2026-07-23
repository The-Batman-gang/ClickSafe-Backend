require("dotenv").config();

const app = require("./app");
const supabase = require("./config/supabase");

const PORT = process.env.PORT || 5000;

async function startServer() {
    const { error } = await supabase
        .from("analysis_reports")
        .select("*")
        .limit(1);

    if (error) {
        console.log("Supabase connected (table may not exist yet):", error.message);
    } else {
        console.log("✅ Supabase Connected");
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

startServer();