import { getDb } from "../db";
import { config } from "../config/index.js";
import { CourseRepository } from "../repositories/course.repo";
import { CvRepository } from "../repositories/cv.repo";
import { EducationRepository } from "../repositories/education.repo";
import { LanguageRepository } from "../repositories/language.repo";
import { OrganizationRepository } from "../repositories/organization.repo";
import { ProjectRepository } from "../repositories/project.repo";
import { SkillRepository } from "../repositories/skill.repo";
import { UserRepository } from "../repositories/user.repo";
import { WorkRepository } from "../repositories/work.repo";
import { AnalyticsRepository } from "../repositories/analytics.repo";
// import { CoverLetterRepositoryImpl } from "../repositories/coverLetter.repo";

import { AuthService } from "../services/auth.service";
import { CourseService } from "../services/course.service";
import { CvService } from "../services/cv.service";
import { EducationService } from "../services/education.service";
import { LanguageService } from "../services/language.service";
import { OrganizationService } from "../services/organization.service";
import { ProjectService } from "../services/project.service";
import { TokenService } from "../services/token.service";
import { SkillService } from "../services/skill.service";
import { UserService } from "../services/user.service";
import { WorkService } from "../services/work.service";
import { AnalyticsService } from "../services/analytics.service";
// import { CoverLetterService } from "../services/coverLetter.service";
import { JobApplicationRepository } from "../repositories/jobApplication.repo";
import { JobApplicationService } from "../services/jobApplication.service";
import { EmailService } from "../services/email.service";
import { JobApplicationStatusRepository } from "../repositories/jobApplicationStatus.repo.js";
import { ContactRepository } from "../repositories/contact.repo.js";
import { ContactService } from "../services/contact.service.js";

const db = getDb();

// =====================
// REPOSITORIES
// =====================

// CV & Children Repositories
const cvRepository = new CvRepository(db);
const contactRepository = new ContactRepository(db);
const educationRepository = new EducationRepository(db);
const workRepository = new WorkRepository(db);
const projectRepository = new ProjectRepository(db);
const organizationRepository = new OrganizationRepository(db);
const courseRepository = new CourseRepository(db);
const skillRepository = new SkillRepository(db);
const languageRepository = new LanguageRepository(db);

// User Repository
const userRepository = new UserRepository(db);

// Job Application Repositories
const jobApplicationRepository = new JobApplicationRepository(db);
const jobApplicationStatusRepository = new JobApplicationStatusRepository(db);

// Analytics Repository
const analyticsRepository = new AnalyticsRepository(db);
// const coverLetterRepository = new CoverLetterRepositoryImpl(db);

// =====================
// SERVICES
// =====================

// CV & Children Services
export const cvService = new CvService(
  cvRepository,
  contactRepository,
  educationRepository,
  workRepository,
  projectRepository,
  organizationRepository,
  courseRepository,
  skillRepository,
  languageRepository,
);
export const contactService = new ContactService(contactRepository);
export const educationService = new EducationService(educationRepository);
export const workService = new WorkService(workRepository);
export const projectService = new ProjectService(projectRepository);
export const organizationService = new OrganizationService(
  organizationRepository,
);
export const courseService = new CourseService(courseRepository);
export const skillService = new SkillService(skillRepository);
export const languageService = new LanguageService(languageRepository);

// Token and Auth Services
export const tokenService = new TokenService(config.jwt.secret);
export const authService = new AuthService(userRepository, tokenService);

// Job Application Services
export const jobApplicationService = new JobApplicationService(
  jobApplicationRepository,
  jobApplicationStatusRepository,
);

// User Service
export const userService = new UserService(
  userRepository,
  cvService,
  jobApplicationService,
);

// Other Services
export const emailService = new EmailService();

// Analytics Service
export const analyticsService = new AnalyticsService(analyticsRepository);
// export const coverLetterService = new CoverLetterService(coverLetterRepository);
