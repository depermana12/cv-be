import type { ContactSelect } from "../../db/types/contact.type";
import type { EducationSelect } from "../../db/types/education.type";
import type { WorkSelect } from "../../db/types/work.type";
import type { ProjectSelect } from "../../db/types/project.type";
import type { OrganizationSelect } from "../../db/types/organization.type";
import type { CourseSelect } from "../../db/types/course.type";
import type { SkillSelect } from "../../db/types/skill.type";
import type { LanguageSelect } from "../../db/types/language.type";

export class SectionRenderer {
  /**
   * Escapes HTML characters to prevent XSS and rendering issues
   */
  private static escapeHtml(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Formats date strings consistently
   */
  private static formatDate(date: string | Date | null): string {
    if (!date) return "Present";
    if (typeof date === "string") return date;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }

  /**
   * Renders contact section (special case - no header, special styling)
   */
  static renderContact(
    contacts: ContactSelect[],
    customTitle?: string,
  ): string {
    if (!contacts.length) return "";

    const contact = contacts[0]; // Use first contact
    if (!contact) return "";

    const name = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
    const location = [contact.city, contact.country].filter(Boolean).join(", ");

    return `
      <div class="section no-break">
        ${
          name ? `<div class="contact-name">${this.escapeHtml(name)}</div>` : ""
        }
        ${
          contact.email
            ? `<div class="contact-info">${this.escapeHtml(
                contact.email,
              )}</div>`
            : ""
        }
        ${
          contact.phone
            ? `<div class="contact-info">${this.escapeHtml(
                contact.phone,
              )}</div>`
            : ""
        }
        ${
          location
            ? `<div class="contact-info">${this.escapeHtml(location)}</div>`
            : ""
        }
        ${
          contact.website
            ? `<div class="contact-info">${this.escapeHtml(
                contact.website,
              )}</div>`
            : ""
        }
        ${
          contact.linkedin
            ? `<div class="contact-info">LinkedIn: ${this.escapeHtml(
                contact.linkedin,
              )}</div>`
            : ""
        }
        ${
          contact.summary
            ? `<div class="item-description">${this.escapeHtml(
                contact.summary,
              )}</div>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Renders work experience section
   */
  static renderWork(
    works: WorkSelect[],
    customTitle = "Work Experience",
  ): string {
    if (!works.length) return "";

    const workItems = works
      .map((work) => {
        const startDate = this.formatDate(work.startDate);
        const endDate = this.formatDate(work.endDate);
        const dateRange = `${startDate} - ${endDate}`;
        const descriptions =
          work.descriptions && work.descriptions.length > 0
            ? work.descriptions
                .map(
                  (desc) =>
                    `<div class="item-description">${this.escapeHtml(
                      desc,
                    )}</div>`,
                )
                .join("")
            : "";

        return `
          <div class="item">
            <div class="item-title">${this.escapeHtml(
              work.position || "",
            )}</div>
            <div class="item-subtitle">
              ${this.escapeHtml(work.company || "")} • ${dateRange}
            </div>
            ${
              work.location
                ? `<div class="item-subtitle">${this.escapeHtml(
                    work.location,
                  )}</div>`
                : ""
            }
            ${descriptions}
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        ${workItems}
      </div>
    `;
  }

  /**
   * Renders education section
   */
  static renderEducation(
    educations: EducationSelect[],
    customTitle = "Education",
  ): string {
    if (!educations.length) return "";

    const eduItems = educations
      .map((edu) => {
        const startDate = this.formatDate(edu.startDate);
        const endDate = this.formatDate(edu.endDate);
        const dateRange = `${startDate} - ${endDate}`;

        return `
          <div class="item">
            <div class="item-title">${this.escapeHtml(edu.degree || "")}</div>
            <div class="item-subtitle">
              ${this.escapeHtml(edu.institution || "")} • ${dateRange}
            </div>
            ${
              edu.location
                ? `<div class="item-subtitle">${this.escapeHtml(
                    edu.location,
                  )}</div>`
                : ""
            }
            ${
              edu.gpa
                ? `<div class="item-subtitle">GPA: ${this.escapeHtml(
                    edu.gpa.toString(),
                  )}</div>`
                : ""
            }
            ${
              edu.description
                ? `<div class="item-description">${this.escapeHtml(
                    edu.description,
                  )}</div>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        ${eduItems}
      </div>
    `;
  }

  /**
   * Renders skills section with grouping
   */
  static renderSkills(skills: SkillSelect[], customTitle = "Skills"): string {
    if (!skills.length) return "";

    const skillContent = skills
      .map((skillEntry) => {
        const category = skillEntry.category || "Other";
        const skillArray = skillEntry.skill || [];

        return `
          <div class="skills-group">
            <div class="item-title">${this.escapeHtml(category)}</div>
            <div class="skills-list">
              ${skillArray
                .map(
                  (name: string) =>
                    `<span class="skill-tag">${this.escapeHtml(name)}</span>`,
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        ${skillContent}
      </div>
    `;
  }

  /**
   * Renders projects section
   */
  static renderProjects(
    projects: ProjectSelect[],
    customTitle = "Projects",
  ): string {
    if (!projects.length) return "";

    const projectItems = projects
      .map((project) => {
        const startDate = this.formatDate(project.startDate);
        const endDate = this.formatDate(project.endDate);
        const dateRange = `${startDate} - ${endDate}`;
        const descriptions =
          project.descriptions && project.descriptions.length > 0
            ? project.descriptions
                .map(
                  (desc) =>
                    `<div class="item-description">${this.escapeHtml(
                      desc,
                    )}</div>`,
                )
                .join("")
            : "";

        return `
          <div class="item">
            <div class="item-title">${this.escapeHtml(project.name || "")}</div>
            <div class="item-subtitle">${dateRange}</div>
            ${descriptions}
            ${
              project.url
                ? `<div class="item-subtitle">URL: ${this.escapeHtml(
                    project.url,
                  )}</div>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        ${projectItems}
      </div>
    `;
  }

  /**
   * Renders organizations section
   */
  static renderOrganizations(
    orgs: OrganizationSelect[],
    customTitle = "Organizations",
  ): string {
    if (!orgs.length) return "";

    const orgItems = orgs
      .map((org) => {
        const startDate = this.formatDate(org.startDate);
        const endDate = this.formatDate(org.endDate);
        const dateRange = `${startDate} - ${endDate}`;
        const descriptions =
          org.descriptions && org.descriptions.length > 0
            ? org.descriptions
                .map(
                  (desc) =>
                    `<div class="item-description">${this.escapeHtml(
                      desc,
                    )}</div>`,
                )
                .join("")
            : "";

        return `
          <div class="item">
            <div class="item-title">${this.escapeHtml(
              org.organization || "",
            )}</div>
            <div class="item-subtitle">${this.escapeHtml(
              org.role || "",
            )} • ${dateRange}</div>
            ${
              org.location
                ? `<div class="item-subtitle">${this.escapeHtml(
                    org.location,
                  )}</div>`
                : ""
            }
            ${descriptions}
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        ${orgItems}
      </div>
    `;
  }

  /**
   * Renders courses section
   */
  static renderCourses(
    courses: CourseSelect[],
    customTitle = "Courses",
  ): string {
    if (!courses.length) return "";

    const courseItems = courses
      .map((course) => {
        const endDate = course.endDate
          ? this.formatDate(course.endDate)
          : "Ongoing";
        const descriptions =
          course.descriptions && course.descriptions.length > 0
            ? course.descriptions
                .map(
                  (desc) =>
                    `<div class="item-description">${this.escapeHtml(
                      desc,
                    )}</div>`,
                )
                .join("")
            : "";

        return `
          <div class="item">
            <div class="item-title">${this.escapeHtml(
              course.courseName || "Course",
            )}</div>
            <div class="item-subtitle">${this.escapeHtml(
              course.provider || "",
            )}</div>
            ${
              endDate
                ? `<div class="item-subtitle">Completed: ${endDate}</div>`
                : ""
            }
            ${descriptions}
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        ${courseItems}
      </div>
    `;
  }

  /**
   * Renders languages section
   */
  static renderLanguages(
    languages: LanguageSelect[],
    customTitle = "Languages",
  ): string {
    if (!languages.length) return "";

    const langItems = languages
      .map(
        (lang) => `
        <div class="item">
          <div class="item-title">${this.escapeHtml(lang.language || "")}</div>
          <div class="item-subtitle">Level: ${this.escapeHtml(
            lang.fluency || "",
          )}</div>
        </div>
      `,
      )
      .join("");

    return `
      <div class="section">
        <h3 class="section-header">${this.escapeHtml(customTitle)}</h3>
        <div class="section-divider"></div>
        <div class="languages-grid">
          ${langItems}
        </div>
      </div>
    `;
  }

  /**
   * Dynamic section renderer - routes to appropriate renderer based on section type
   */
  static renderSection(
    sectionType: string,
    data: any[],
    customTitle?: string,
  ): string {
    switch (sectionType) {
      case "contact":
        return this.renderContact(data, customTitle);
      case "work":
        return this.renderWork(data, customTitle);
      case "education":
        return this.renderEducation(data, customTitle);
      case "skill":
        return this.renderSkills(data, customTitle);
      case "project":
        return this.renderProjects(data, customTitle);
      case "organization":
        return this.renderOrganizations(data, customTitle);
      case "course":
        return this.renderCourses(data, customTitle);
      case "language":
        return this.renderLanguages(data, customTitle);
      default:
        console.warn(`Unknown section type: ${sectionType}`);
        return "";
    }
  }
}
