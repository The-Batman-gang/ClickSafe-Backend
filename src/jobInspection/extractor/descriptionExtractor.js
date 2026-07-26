/**
 * Extracts the main job information
 * from a job posting.
 */

function extractDescription($) {

  // ---------- Helpers ----------

  function clean(text) {

      return text
          .replace(/\s+/g, " ")
          .trim();

  }

  function escapeRegex(text) {

      return text.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
      );

  }

  // ---------- Title ----------

  const title =
      clean(

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

  let description = "";

  for (const selector of descriptionSelectors) {

      const text =
          clean(
              $(selector).first().text()
          );

      if (text.length > description.length) {

          description = text;

      }

  }

  if (!description) {

      description =
          clean($("body").text());

  }

  // ---------- Experience ----------

  const experience =

      description.match(
          /\d+\+?\s*(years?|yrs?)\s*(of)?\s*experience/gi
      ) || [];

  // ---------- Employment ----------

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

      const regex =
          new RegExp(
              "\\b" + escapeRegex(type) + "\\b",
              "i"
          );

      if (regex.test(description)) {

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

      const regex =
          new RegExp(
              "\\b" +
              escapeRegex(skill) +
              "\\b",
              "i"
          );

      if (regex.test(description)) {

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