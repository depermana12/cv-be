CREATE TABLE `course_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`description` text,
	CONSTRAINT `course_details_id` PRIMARY KEY(`id`)
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
CREATE TABLE `education` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`institution` varchar(100) NOT NULL,
	`degree` varchar(100) NOT NULL,
	`field_of_study` varchar(100),
	`start_date` date,
	`end_date` date,
	`gpa` decimal(3,2),
	`url` varchar(255),
	CONSTRAINT `education_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`language` varchar(100) NOT NULL,
	`fluency` varchar(25) NOT NULL,
	CONSTRAINT `language_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `org_exp_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`org_exp_id` int NOT NULL,
	`description` text,
	CONSTRAINT `org_exp_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `org_exp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`organization` varchar(100) NOT NULL,
	`role` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	CONSTRAINT `org_exp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_basic` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(100) NOT NULL,
	`bio` varchar(255),
	`image` varchar(255),
	`summary` text,
	`phone` varchar(15),
	`email` varchar(255),
	`url` varchar(255),
	CONSTRAINT `personal_basic_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_location` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`address` varchar(255),
	`postal_code` varchar(5),
	`city` varchar(100),
	`country_code` varchar(3),
	`state` varchar(100),
	CONSTRAINT `personal_location_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_social` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`social` varchar(50),
	`username` varchar(100),
	`url` varchar(255),
	CONSTRAINT `personal_social_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`description` text,
	CONSTRAINT `project_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_technologies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`technology` varchar(100) NOT NULL,
	`type` varchar(100) NOT NULL,
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
CREATE TABLE `soft_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text,
	CONSTRAINT `soft_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_exp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`personal_id` int NOT NULL,
	`company` varchar(100) NOT NULL,
	`position` varchar(100) NOT NULL,
	`start_date` date,
	`end_date` date,
	`url` varchar(255),
	`is_current` boolean DEFAULT false,
	CONSTRAINT `work_exp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_exp_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`work_exp_id` int NOT NULL,
	`description` text,
	CONSTRAINT `work_exp_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `course_details` ADD CONSTRAINT `course_details_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `education` ADD CONSTRAINT `education_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `language` ADD CONSTRAINT `language_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `org_exp_details` ADD CONSTRAINT `org_exp_details_org_exp_id_org_exp_id_fk` FOREIGN KEY (`org_exp_id`) REFERENCES `org_exp`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `org_exp` ADD CONSTRAINT `org_exp_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_location` ADD CONSTRAINT `personal_location_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_social` ADD CONSTRAINT `personal_social_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_details` ADD CONSTRAINT `project_details_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_technologies` ADD CONSTRAINT `project_technologies_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soft_skills` ADD CONSTRAINT `soft_skills_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_exp` ADD CONSTRAINT `work_exp_personal_id_personal_basic_id_fk` FOREIGN KEY (`personal_id`) REFERENCES `personal_basic`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_exp_details` ADD CONSTRAINT `work_exp_details_work_exp_id_work_exp_id_fk` FOREIGN KEY (`work_exp_id`) REFERENCES `work_exp`(`id`) ON DELETE no action ON UPDATE no action;