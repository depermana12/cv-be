CREATE TABLE `course_descriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`description` text,
	CONSTRAINT `course_descriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`provider` varchar(100) NOT NULL,
	`course_name` varchar(200),
	`start_date` date,
	`end_date` date,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cvs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`theme` varchar(100) DEFAULT 'default',
	`is_public` boolean DEFAULT false,
	`slug` varchar(255),
	`views` int DEFAULT 0,
	`downloads` int DEFAULT 0,
	`language` varchar(3) DEFAULT 'id',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cvs_id` PRIMARY KEY(`id`),
	CONSTRAINT `cvs_title_unique` UNIQUE(`title`),
	CONSTRAINT `cvs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `educations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`institution` varchar(100) NOT NULL,
	`degree` varchar(100) NOT NULL,
	`field_of_study` varchar(100),
	`start_date` date,
	`end_date` date,
	`gpa` decimal(3,2),
	`url` varchar(255),
	CONSTRAINT `educations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`cv_id` int,
	`job_portal` varchar(100),
	`job_url` varchar(255),
	`company_name` varchar(255) NOT NULL,
	`job_title` varchar(255) NOT NULL,
	`job_type` enum('Full-time','Part-time','Contract','Internship','Freelance','Volunteer'),
	`position` enum('Manager','Lead','Senior','Mid-level','Junior','Intern','Entry-level','Staff','Other'),
	`location` varchar(255),
	`location_type` enum('Remote','On-site','Hybrid'),
	`status` enum('applied','interview','offer','rejected','accepted','ghosted') DEFAULT 'applied',
	`notes` text,
	`applied_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`language` varchar(100) NOT NULL,
	`fluency` varchar(25) NOT NULL,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`address` varchar(255),
	`postal_code` varchar(5),
	`city` varchar(100),
	`country_code` varchar(3),
	`state` varchar(100),
	CONSTRAINT `location_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_desc` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`description` text,
	CONSTRAINT `organization_desc_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`organization` varchar(100) NOT NULL,
	`role` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`bio` varchar(255),
	`image` varchar(255),
	`summary` text,
	`phone` varchar(15),
	`email` varchar(255),
	`url` varchar(255),
	CONSTRAINT `profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_descriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`description` text,
	CONSTRAINT `project_descriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_technologies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`technology` varchar(100) NOT NULL,
	`category` varchar(100) NOT NULL,
	CONSTRAINT `project_technologies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	`url` varchar(255),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`social` varchar(50),
	`username` varchar(100),
	`url` varchar(255),
	CONSTRAINT `socials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soft_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text,
	CONSTRAINT `soft_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`is_email_verified` boolean DEFAULT false,
	`profile_image` text,
	`birth_date` date,
	`first_name` varchar(50),
	`last_name` varchar(50),
	`gender` enum('male','female'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `work_descriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_id` int NOT NULL,
	`description` text,
	CONSTRAINT `work_descriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cv_id` int NOT NULL,
	`company` varchar(100) NOT NULL,
	`position` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	`url` varchar(255),
	`is_current` boolean DEFAULT false,
	CONSTRAINT `works_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `course_descriptions` ADD CONSTRAINT `course_descriptions_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cvs` ADD CONSTRAINT `cvs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `educations` ADD CONSTRAINT `educations_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `languages` ADD CONSTRAINT `languages_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `location` ADD CONSTRAINT `location_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_desc` ADD CONSTRAINT `organization_desc_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile` ADD CONSTRAINT `profile_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_descriptions` ADD CONSTRAINT `project_descriptions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_technologies` ADD CONSTRAINT `project_technologies_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skills` ADD CONSTRAINT `skills_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `socials` ADD CONSTRAINT `socials_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soft_skills` ADD CONSTRAINT `soft_skills_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_descriptions` ADD CONSTRAINT `work_descriptions_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `works` ADD CONSTRAINT `works_cv_id_cvs_id_fk` FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `job_applications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_cv_id` ON `job_applications` (`cv_id`);--> statement-breakpoint
CREATE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_created_at` ON `users` (`created_at`);