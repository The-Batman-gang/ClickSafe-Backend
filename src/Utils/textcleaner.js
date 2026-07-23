function cleanText(text = "") {
  if (typeof text !== "string") {
    return "";
  }

  return (
    text
      // Remove extra spaces
      .replace(/\s+/g, " ")

      // Remove empty lines
      .replace(/\n\s*\n/g, "\n")

      // Trim whitespace
      .trim()
  );
}

module.exports = {
  cleanText,
};