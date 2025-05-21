CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`date` text NOT NULL,
	`period` integer DEFAULT 1.5 NOT NULL,
	`createAt` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`' NOT NULL,
	`updatedAt` text
);
