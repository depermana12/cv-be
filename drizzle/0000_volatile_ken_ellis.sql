CREATE TABLE `course_descriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`description` text,
	CONSTRAINT `course_descriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`provider` varchar(100) NOT NULL,
	`course_name` varchar(200),
	`start_date` date,
	`end_date` date,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
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
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`language` varchar(100) NOT NULL,
	`fluency` varchar(25) NOT NULL,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
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
	`personal_id` int NOT NULL,
	`organization` varchar(100) NOT NULL,
	`role` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`full_name` varchar(100),
	`bio` varchar(255),
	`image` varchar(255),
	`summary` text,
	`phone` varchar(15),
	`email` varchar(255),
	`url` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `personal_id` PRIMARY KEY(`id`)
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
	`personal_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	`url` varchar(255),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`social` varchar(50),
	`username` varchar(100),
	`url` varchar(255),
	CONSTRAINT `socials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soft_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
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
	`created_at` timestamp DEFAULT (now()),
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
	`personal_id` int NOT NULL,
	`company` varchar(100) NOT NULL,
	`position` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	`url` varchar(255),
	`is_current` boolean DEFAULT false,
	CONSTRAINT `works_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `course_descriptions` ADD CONSTRAINT `course_descriptions_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `educations` ADD CONSTRAINT `educations_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `languages` ADD CONSTRAINT `languages_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `location` ADD CONSTRAINT `location_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_desc` ADD CONSTRAINT `organization_desc_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal` ADD CONSTRAINT `personal_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_descriptions` ADD CONSTRAINT `project_descriptions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_technologies` ADD CONSTRAINT `project_technologies_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skills` ADD CONSTRAINT `skills_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `socials` ADD CONSTRAINT `socials_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soft_skills` ADD CONSTRAINT `soft_skills_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_descriptions` ADD CONSTRAINT `work_descriptions_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `works` ADD CONSTRAINT `works_personal_id_personal_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE no action ON UPDATE no action;