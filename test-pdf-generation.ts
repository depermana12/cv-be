import { CVHTMLGenerator } from "./src/services/pdf";
import type { CVStyleConfig, CVSectionData } from "./src/services/pdf";

// Sample CV data for testing
const sampleSections: CVSectionData[] = [
  {
    section: "contact",
    title: "",
    data: [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        city: "San Francisco",
        country: "USA",
        website: "https://johndoe.dev",
        linkedin: "https://linkedin.com/in/johndoe",
        summary:
          "Experienced software engineer with a passion for building scalable web applications.",
      },
    ],
  },
  {
    section: "work",
    title: "Professional Experience",
    data: [
      {
        position: "Senior Software Engineer",
        company: "Tech Corp",
        startDate: "2022-01-01",
        endDate: null,
        location: "San Francisco, CA",
        descriptions: [
          "Led development of microservices architecture serving 1M+ users",
          "Mentored junior developers and improved team productivity by 30%",
          "Implemented CI/CD pipelines reducing deployment time by 50%",
        ],
      },
      {
        position: "Software Engineer",
        company: "StartupXYZ",
        startDate: "2020-06-01",
        endDate: "2021-12-31",
        location: "Remote",
        descriptions: [
          "Built responsive web applications using React and Node.js",
          "Collaborated with cross-functional teams to deliver features",
        ],
      },
    ],
  },
  {
    section: "skill",
    title: "Technical Skills",
    data: [
      {
        category: "Programming Languages",
        skill: ["JavaScript", "TypeScript", "Python", "Go"],
      },
      {
        category: "Frameworks",
        skill: ["React", "Node.js", "Express", "Next.js"],
      },
      {
        category: "Databases",
        skill: ["PostgreSQL", "MongoDB", "Redis"],
      },
    ],
  },
];

const modernStyles: CVStyleConfig = {
  fontFamily: "Poppins, sans-serif",
  fontSize: 12,
  lineHeight: 1.5,
  headerColor: "#1e40af",
  sectionDivider: true,
  margin: 0.55,
};

const minimalStyles: CVStyleConfig = {
  fontFamily: "Arial, sans-serif",
  fontSize: 11,
  lineHeight: 1.4,
  headerColor: "#000000",
  sectionDivider: false,
  margin: 0.55,
};

// Test HTML generation
console.log("Testing CV HTML Generation...\n");

// Test modern style
console.log("=== MODERN STYLE TEST ===");
const modernResult = CVHTMLGenerator.generateCVHTMLSafe(
  sampleSections,
  modernStyles,
);
if (modernResult.html) {
  console.log("✅ Modern style HTML generated successfully");
  console.log(`📄 HTML length: ${modernResult.html.length} characters`);
} else {
  console.log("❌ Modern style generation failed:");
  modernResult.errors.forEach((error) => console.log(`   - ${error}`));
}

// Test minimal style
console.log("\n=== MINIMAL STYLE TEST ===");
const minimalResult = CVHTMLGenerator.generateCVHTMLSafe(
  sampleSections,
  minimalStyles,
);
if (minimalResult.html) {
  console.log("✅ Minimal style HTML generated successfully");
  console.log(`📄 HTML length: ${minimalResult.html.length} characters`);
} else {
  console.log("❌ Minimal style generation failed:");
  minimalResult.errors.forEach((error) => console.log(`   - ${error}`));
}

// Test validation
console.log("\n=== VALIDATION TEST ===");
const invalidResult = CVHTMLGenerator.generateCVHTMLSafe([], {});
if (!invalidResult.html) {
  console.log("✅ Validation working correctly");
  console.log("🔍 Validation errors detected:");
  invalidResult.errors.forEach((error) => console.log(`   - ${error}`));
} else {
  console.log("❌ Validation should have failed but didn't");
}

console.log("\n🎉 PDF HTML Generation Tests Complete!");
