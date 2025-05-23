DROP TABLE "addresses";--> statement-breakpoint
ALTER TABLE "articles" RENAME COLUMN "title" TO "topic";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_address_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parent_category_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "address_id";