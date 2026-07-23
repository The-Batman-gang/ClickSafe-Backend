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

module.exports = {
    saveAnalysis,
    getAnalysis,
};