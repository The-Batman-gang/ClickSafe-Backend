/**
 * Extracts the main job information
 * from a job posting.
 *
 * Responsibilities:
 * - Job title
 * - Job description (trimmed to 200 words)
 * - Employment type
 * - Experience
 * - Skills
 */

function extractDescription($) {

  // ---------- Helpers ----------

  function clean(text) {

      return (text || "")
          .replace(/\s+/g, " ")
          .trim();

  }

  function escapeRegex(text) {

      return text.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
      );

  }

  function trimDescription(text, maxWords = 200) {

      const words = clean(text).split(/\s+/);

      if (words.length <= maxWords) {
          return clean(text);
      }

      return words
          .slice(0, maxWords)
          .join(" ") + "...";

  }

  // ---------- Title ----------

  const title = clean(

      $("h1").first().text() ||

      $('[data-testid*="title"]').first().text() ||

      $('[class*="job-title"]').first().text() ||

      $('[class*="title"]').first().text()

  ) || null;

  // ---------- Description ----------

  const descriptionSelectors = [

      '[data-testid*="description"]',

      '[class*="job-description"]',

      '[class*="description"]',

      "main",

      "article"

  ];

  let rawDescription = "";

  for (const selector of descriptionSelectors) {

      const text = clean(
          $(selector).first().text()
      );

      if (text.length > rawDescription.length) {

          rawDescription = text;

      }

  }

  if (!rawDescription) {

      rawDescription = clean(
          $("body").text()
      );

  }

  const description = trimDescription(rawDescription, 200);

  // ---------- Experience ----------

  const experience =
      rawDescription.match(
          /\d+\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience/gi
      ) || [];

  // ---------- Employment Type ----------

  const employmentTypes = [

      "Full Time",
      "Full-time",

      "Part Time",
      "Part-time",

      "Contract",

      "Internship",

      "Temporary",

      "Remote",

      "Hybrid",

      "On-site"

  ];

  const employment = [];

  for (const type of employmentTypes) {

      const regex = new RegExp(
          "\\b" + escapeRegex(type) + "\\b",
          "i"
      );

      if (regex.test(rawDescription)) {

          employment.push(type);

      }

  }

  // ---------- Skills ----------

  const knownSkills = [

      "Java",
      "Python",
      "JavaScript",
      "TypeScript",

      "React",

      "Node.js",

      "Express",

      "MongoDB",

      "MySQL",

      "PostgreSQL",

      "Docker",

      "Kubernetes",

      "AWS",

      "Azure",

      "Git",
      "GitHub",

      "HTML",
      "CSS",

      "Spring Boot",

      "C++",
      "C#",

      "Go",
      "Golang",

      "Rust",

      "OpenShift",

      "RHEL",

      "Ansible",

      "Agile",

      "TensorFlow",

      "PyTorch"

  ];

  const skills = [];

  for (const skill of knownSkills) {

      let regex;

      // Handle special skills that contain non-word characters
      if (["C++", "C#", "Node.js"].includes(skill)) {

          regex = new RegExp(
              escapeRegex(skill),
              "i"
          );

      } else {

          regex = new RegExp(
              "\\b" + escapeRegex(skill) + "\\b",
              "i"
          );

      }

      if (regex.test(rawDescription)) {

          skills.push(skill);

      }

  }

  return {

      title,

      description,

      experience,

      employment,

      skills

  };

}

module.exports = {
  extractDescription
};