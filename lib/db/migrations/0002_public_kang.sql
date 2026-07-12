CREATE TABLE "device_usage" (
	"device_token" text PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"user_id" text,
	"message_count" integer DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now(),
	"last_used_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "guest_ip_usage" RENAME TO "ip_usage";--> statement-breakpoint
ALTER TABLE "conversations" RENAME COLUMN "guest_ip" TO "device_token";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "owner_check";--> statement-breakpoint
ALTER TABLE "device_usage" ADD CONSTRAINT "device_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_usage" DROP COLUMN "first_seen_at";--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "provider_date_unique" UNIQUE("provider","date");