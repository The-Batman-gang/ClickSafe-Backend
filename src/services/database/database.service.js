const supabase = require("../../config/supabase");

async function saveAnalysis(data) {
    const { data: result, error } = await supabase
        .from("analysis_reports")
        .insert([data])
        .select();

    if (error) throw error;

    return result[0];
}

async function getAnalysis(id) {
    const { data, error } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
}

async function getAnalysisByUrl(url) {
    // Normalize URL slightly (trim spaces, ignore trailing slash)
    const normalizedUrl = url.trim().replace(/\/$/, "");
    
    // We try to query both the exact url and standard variations if possible,
    // but a simple exact match or ILIKE on normalized variations is robust.
    const { data, error } = await supabase
        .from("analysis_reports")
        .select("*")
        .or(`url.eq.${normalizedUrl},url.eq.${normalizedUrl}/`)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error checking URL in database:", error.message);
        return null;
    }

    return data && data.length > 0 ? data[0] : null;
}

module.exports = {
    saveAnalysis,
    getAnalysis,
    getAnalysisByUrl,
};