import { CVHTMLTemplate } from "./template";
import { SectionRenderer } from "./renderer";
import type { CVSectionData, CVStyleConfig } from "./types";

export class CVHTMLGenerator {
  /**
   * Generates complete HTML document for CV PDF generation
   */
  static generateCVHTML(sections: CVSectionData[], styles: any): string {
    // Normalize styles to ensure all required fields are present
    const normalizedStyles = CVHTMLTemplate.normalizeStyles(styles);

    // Generate section HTML
    const sectionHTML = this.generateSectionsHTML(sections);

    // Get base template and inject content
    const baseTemplate = CVHTMLTemplate.generateBaseTemplate(normalizedStyles);
    const pageContent = CVHTMLTemplate.wrapInPage(sectionHTML);

    return baseTemplate.replace("{{CONTENT}}", pageContent);
  }

  /**
   * Generates HTML for all CV sections in order
   */
  private static generateSectionsHTML(sections: CVSectionData[]): string {
    return sections
      .map((section) => {
        try {
          return SectionRenderer.renderSection(
            section.section,
            section.data,
            section.title,
          );
        } catch (error) {
          console.error(`Error rendering section ${section.section}:`, error);
          return `<!-- Error rendering ${section.section} section -->`;
        }
      })
      .filter(Boolean) // Remove empty sections
      .join("");
  }

  /**
   * Validates CV data before HTML generation
   */
  static validateCVData(
    sections: CVSectionData[],
    styles: any,
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate sections
    if (!Array.isArray(sections)) {
      errors.push("Sections must be an array");
    } else {
      sections.forEach((section, index) => {
        if (!section.section) {
          errors.push(`Section ${index} missing section type`);
        }
        if (!Array.isArray(section.data)) {
          errors.push(`Section ${index} data must be an array`);
        }
        if (typeof section.title !== "string") {
          errors.push(`Section ${index} title must be a string`);
        }
      });
    }

    // Validate styles
    if (!styles) {
      errors.push("Styles object is required");
    } else {
      if (!styles.fontFamily) {
        errors.push("Font family is required in styles");
      }
      if (typeof styles.lineHeight !== "number") {
        errors.push("Line height must be a number");
      }
      if (!styles.headerColor) {
        errors.push("Header color is required in styles");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generates HTML with error handling and validation
   */
  static generateCVHTMLSafe(
    sections: CVSectionData[],
    styles: any,
  ): {
    html: string | null;
    errors: string[];
  } {
    const validation = this.validateCVData(sections, styles);

    if (!validation.isValid) {
      return {
        html: null,
        errors: validation.errors,
      };
    }

    try {
      const html = this.generateCVHTML(sections, styles);
      return {
        html,
        errors: [],
      };
    } catch (error) {
      return {
        html: null,
        errors: [
          `HTML generation failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      };
    }
  }

  /**
   * Preview method for development/testing - generates a sample HTML page
   */
  static generatePreviewHTML(sections: CVSectionData[], styles: any): string {
    const html = this.generateCVHTML(sections, styles);

    // Add some debug info for development
    const debugInfo = `
      <!-- Generated at: ${new Date().toISOString()} -->
      <!-- Sections: ${sections.length} -->
      <!-- Styles: ${JSON.stringify(styles, null, 2)} -->
    `;

    return html.replace("</body>", `${debugInfo}</body>`);
  }
}
