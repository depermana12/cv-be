import type { CVStyleConfig } from "./types";

export class CVHTMLTemplate {
  private static readonly FIXED_MARGIN = 52.8; // 0.55 inches in px (matching your existing margin)
  private static readonly SECTION_SPACING = 16;
  private static readonly A4_WIDTH = 794;
  private static readonly A4_HEIGHT = 1123;

  /**
   * Generates the base HTML template with CSS styles
   */
  static generateBaseTemplate(styles: CVStyleConfig): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: ${styles.fontFamily};
              color: #000;
              background: #fff;
            }
            
            .cv-paper {
              width: ${this.A4_WIDTH}px;
              min-height: ${this.A4_HEIGHT}px;
              background: white;
              padding: ${this.FIXED_MARGIN}px;
              box-sizing: border-box;
              page-break-after: always;
              font-family: ${styles.fontFamily};
              font-size: ${styles.fontSize}px;
              line-height: ${styles.lineHeight};
              color: #000;
              position: relative;
            }
            
            .cv-paper:last-child {
              page-break-after: avoid;
            }
            
            .section {
              margin-bottom: ${this.SECTION_SPACING}px;
              break-inside: avoid;
            }
            
            .section-header {
              color: ${styles.headerColor};
              font-weight: 600;
              margin-bottom: 8px;
              font-size: ${Math.round(styles.fontSize * 1.2)}px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .section-divider {
              border-bottom: ${
                styles.sectionDivider
                  ? `1px solid ${styles.headerColor}`
                  : "none"
              };
              margin-bottom: 8px;
            }
            
            .contact-name {
              font-size: ${Math.round(styles.fontSize * 1.8)}px;
              font-weight: 700;
              margin-bottom: 4px;
              color: ${styles.headerColor};
            }
            
            .contact-info {
              margin-bottom: 2px;
              font-size: ${styles.fontSize}px;
            }
            
            .item {
              margin-bottom: 12px;
              break-inside: avoid;
            }
            
            .item-title {
              font-weight: 600;
              margin-bottom: 2px;
              font-size: ${styles.fontSize}px;
            }
            
            .item-subtitle {
              color: #666;
              font-size: ${Math.round(styles.fontSize * 0.9)}px;
              margin-bottom: 4px;
              font-style: italic;
            }
            
            .item-description {
              margin-bottom: 8px;
              line-height: ${styles.lineHeight};
            }
            
            .item-date {
              color: #888;
              font-size: ${Math.round(styles.fontSize * 0.85)}px;
            }
            
            .skills-group {
              margin-bottom: 8px;
            }
            
            .skills-list {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
            }
            
            .skill-tag {
              background: #f0f0f0;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: ${Math.round(styles.fontSize * 0.9)}px;
            }
            
            .languages-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 8px;
            }
            
            .no-break {
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          {{CONTENT}}
        </body>
      </html>
    `;
  }

  /**
   * Wraps content in a CV paper container
   */
  static wrapInPage(content: string): string {
    return `<div class="cv-paper">${content}</div>`;
  }

  /**
   * Normalizes style configuration for consistent PDF rendering
   */
  static normalizeStyles(styles: any): CVStyleConfig {
    return {
      fontFamily: styles.fontFamily || "Arial, sans-serif",
      fontSize: styles.fontSize || 12,
      lineHeight: styles.lineHeight || 1.5,
      headerColor: styles.headerColor || "#000000",
      sectionDivider: styles.sectionDivider !== false,
      margin: styles.margin || 0.55,
    };
  }
}
