ALTER TYPE "public"."order_status" ADD VALUE 'confirmed' BEFORE 'out_for_delivery';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'preparing' BEFORE 'out_for_delivery';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'ready' BEFORE 'out_for_delivery';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'upi' BEFORE 'online';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'card' BEFORE 'online';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'wallet' BEFORE 'online';