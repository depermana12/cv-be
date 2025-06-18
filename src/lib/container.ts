import { getDb } from "../db";
import { CourseRepository } from "../repositories/course.repo";
import { CvRepository } from "../repositories/cv.repo";
import { EducationRepository } from "../repositories/education.repo";
import { LanguageRepository } from "../repositories/language.repo";
import { LocationRepository } from "../repositories/location.repo";
import { OrganizationRepository } from "../repositories/organization.repo";
import { ProfileRepository } from "../repositories/profile.repo";
import { ProjectTechRepository } from "../repositories/project-tech.repo";
import { ProjectRepository } from "../repositories/project.repo";
import { SkillRepository } from "../repositories/skill.repo";
import { SocialMediaRepository } from "../repositories/socialMedia.repo";
import { SoftSkillRepository } from "../repositories/soft-skill.repo";
import { UserRepository } from "../repositories/user.repo";
import { WorkRepository } from "../repositories/work.repo";
import { AuthService } from "../services/auth.service";
import { CourseService } from "../services/course.service";
import { CvService } from "../services/cv.service";
import { EducationService } from "../services/education.service";
import { LanguageService } from "../services/language.service";
import { LocationService } from "../services/location.service";
import { OrganizationService } from "../services/organization.service";
import { ProfileService } from "../services/profile.service";
import { ProjectTechService } from "../services/project-tech.service";
import { ProjectService } from "../services/project.service";
import { TokenService } from "../services/token.service";
import { SkillService } from "../services/skill.service";
import { SocialMediaService } from "../services/socialMedia.service";
import { SoftSkillService } from "../services/soft-skill.service";
import { UserService } from "../services/user.service";
import { WorkService } from "../services/work.service";
import { JobApplicationRepository } from "../repositories/jobApplication.repo";
import { JobApplicationService } from "../services/jobApplication.service";
import { EmailService } from "../services/email.service";

const db = await getDb();

// repositories
const courseRepository = new CourseRepository(db);
const cvRepository = new CvRepository(db);
const educationRepository = new EducationRepository(db);
const languageRepository = new LanguageRepository(db);
const locationRepository = new LocationRepository(db);
const organizationRepository = new OrganizationRepository(db);
const profileRepository = new ProfileRepository(db);
const projectTechRepository = new ProjectTechRepository(db);
const projectRepository = new ProjectRepository(db);
const skillRepository = new SkillRepository(db);
const socialMediaRepository = new SocialMediaRepository(db);
const softSkillRepository = new SoftSkillRepository(db);
const userRepository = new UserRepository(db);
const workRepository = new WorkRepository(db);
const jobApplicationRepository = new JobApplicationRepository(db);

// services
export const tokenService = new TokenService(process.env.SECRET!);
export const authService = new AuthService(userRepository, tokenService);
export const courseService = new CourseService(courseRepository);
export const cvService = new CvService(cvRepository);
export const educationService = new EducationService(educationRepository);
export const languageService = new LanguageService(languageRepository);
export const locationService = new LocationService(locationRepository);
export const organizationService = new OrganizationService(
  organizationRepository,
);
export const profileService = new ProfileService(profileRepository);
export const projectTechService = new ProjectTechService(projectTechRepository);
export const projectService = new ProjectService(
  projectRepository,
  projectTechService,
);
export const skillService = new SkillService(skillRepository);
export const socialMediaService = new SocialMediaService(socialMediaRepository);
export const softSkillService = new SoftSkillService(softSkillRepository);
export const userService = new UserService(userRepository, cvService);
export const workService = new WorkService(workRepository);
export const jobApplicationService = new JobApplicationService(
  jobApplicationRepository,
);
export const emailService = new EmailService();
