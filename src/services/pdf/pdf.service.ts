import puppeteer from "puppeteer";
import type { ICvService } from "../cv.service";
import { CVHTMLGenerator } from "./generator";
import type {
  CVSectionData,
  CVStyleConfig,
  PDFGenerationOptions,
} from "./types";
import { NotFoundError } from "../../errors/not-found.error";
import { BadRequestError } from "../../errors/bad-request.error";

export interface IPDFService {
  generateCVPDF(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
    options?: PDFGenerationOptions,
  ): Promise<Buffer>;

  generateCVHTML(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
  ): Promise<string>;

  previewCVHTML(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
  ): Promise<string>;
}

export class PDFService implements IPDFService {
  constructor(private readonly cvService: ICvService) {}

  /**
   * Generates PDF buffer from CV data using Puppeteer
   */
  async generateCVPDF(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
    options: PDFGenerationOptions = {},
  ): Promise<Buffer> {
    // Get HTML first
    const html = await this.generateCVHTML(cvId, userId, style);

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set content and wait for any fonts/styles to load
      await page.setContent(html, {
        waitUntil: ["networkidle0", "domcontentloaded"],
      });

      // Get styles to determine margin
      const cvData = await this.cvService.constructCv(cvId, userId, style);
      const pdfStyles = this.ensurePDFStyles(cvData.styles, style);

      // Generate PDF with A4 settings
      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: `${pdfStyles.margin}in`,
          right: `${pdfStyles.margin}in`,
          bottom: `${pdfStyles.margin}in`,
          left: `${pdfStyles.margin}in`,
        },
        printBackground: true,
        preferCSSPageSize: true,
        scale: options.scale || 1,
        displayHeaderFooter: false,
      });

      return pdfBuffer as Buffer;
    } catch (error) {
      throw new BadRequestError(
        `PDF generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      await browser.close();
    }
  }

  /**
   * Generates HTML from CV data using the existing CV service
   */
  async generateCVHTML(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
  ): Promise<string> {
    try {
      // Use the existing constructCv method that returns sections with titles and styles
      const cvData = await this.cvService.constructCv(cvId, userId, style);

      // Ensure fontSize is present for PDF styles
      const pdfStyles = this.ensurePDFStyles(cvData.styles, style);

      // Generate HTML safely with validation
      const result = CVHTMLGenerator.generateCVHTMLSafe(
        cvData.sections,
        pdfStyles,
      );

      if (!result.html) {
        throw new BadRequestError(
          `HTML generation failed: ${result.errors.join(", ")}`,
        );
      }

      return result.html;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        `CV HTML generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Generates preview HTML with debug information
   */
  async previewCVHTML(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
  ): Promise<string> {
    try {
      const cvData = await this.cvService.constructCv(cvId, userId, style);
      const pdfStyles = this.ensurePDFStyles(cvData.styles, style);

      return CVHTMLGenerator.generatePreviewHTML(cvData.sections, pdfStyles);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        `CV preview generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Ensures PDF styles have all required fields, with defaults for missing fontSize
   */
  private ensurePDFStyles(
    styles: any,
    themeType: "modern" | "minimal",
  ): CVStyleConfig {
    const baseStyles = {
      fontFamily: styles.fontFamily || "Arial, sans-serif",
      lineHeight: styles.lineHeight || 1.5,
      headerColor: styles.headerColor || "#000000",
      sectionDivider: styles.sectionDivider !== false,
      margin: styles.margin || 0.55,
    };

    // Default fontSize based on theme type if not present
    let fontSize = styles.fontSize;
    if (!fontSize) {
      fontSize = themeType === "minimal" ? 12 : 13;
    }

    return {
      ...baseStyles,
      fontSize,
    };
  }

  /**
   * Validates CV exists and user has access before PDF operations
   */
  private async validateCVAccess(cvId: number, userId: number): Promise<void> {
    try {
      await this.cvService.getCvById(cvId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError(
          `CV with ID ${cvId} not found or not accessible for user ${userId}`,
        );
      }
      throw error;
    }
  }
}
