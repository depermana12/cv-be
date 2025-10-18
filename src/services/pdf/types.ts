import type { ThemeStyle } from "../../db/types/cv.type";
import type { ContactSelect } from "../../db/types/contact.type";
import type { EducationSelect } from "../../db/types/education.type";
import type { WorkSelect } from "../../db/types/work.type";
import type { ProjectSelect } from "../../db/types/project.type";
import type { OrganizationSelect } from "../../db/types/organization.type";
import type { CourseSelect } from "../../db/types/course.type";
import type { SkillSelect } from "../../db/types/skill.type";
import type { LanguageSelect } from "../../db/types/language.type";

export interface CVStyleConfig {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  headerColor: string;
  sectionDivider: boolean;
  margin?: number;
}

export interface CVSectionData {
  section: string;
  title: string;
  data: any[];
}

export interface CVRenderData {
  sections: CVSectionData[];
  styles: CVStyleConfig;
}

export interface PDFGenerationOptions {
  format?: "A4";
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  scale?: number;
}

export type SectionType =
  | "contact"
  | "education"
  | "work"
  | "skill"
  | "project"
  | "organization"
  | "course"
  | "language";

export type SectionDataMap = {
  contact: ContactSelect;
  education: EducationSelect[];
  work: WorkSelect[];
  skill: SkillSelect[];
  project: ProjectSelect[];
  organization: OrganizationSelect[];
  course: CourseSelect[];
  language: LanguageSelect[];
};
