ALTER TABLE "justoo_riders" ADD COLUMN "username" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "justoo_riders" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "justoo_riders" ADD COLUMN "last_login" timestamp;