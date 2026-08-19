CREATE TABLE `contact_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`conversation_id` text NOT NULL,
	`link_type` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text,
	`display_name` text NOT NULL,
	`headline` text,
	`company` text,
	`phone` text,
	`email` text,
	`linkedin_url` text,
	`github_url` text,
	`portfolio_url` text,
	`avatar_uri` text,
	`custom_links` text,
	`exchange_method` text NOT NULL,
	`exchanged_at` integer NOT NULL,
	`notes` text,
	`is_favorite` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversation_entities` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`type` text NOT NULL,
	`value` text NOT NULL,
	`confidence` real DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text,
	`audio_uri` text,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`transcript_raw` text,
	`transcript_enhanced` text,
	`transcript_cloud` text,
	`summary` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`venue` text,
	`event_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `personas` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`headline` text,
	`company` text,
	`phone` text,
	`email` text,
	`linkedin_url` text,
	`github_url` text,
	`portfolio_url` text,
	`avatar_uri` text,
	`custom_links` text,
	`is_active` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
