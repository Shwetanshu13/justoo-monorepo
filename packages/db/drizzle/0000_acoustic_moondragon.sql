CREATE TYPE "public"."admin_role" AS ENUM('superadmin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."inventory_user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('placed', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'online');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."rider_status" AS ENUM('active', 'inactive', 'busy', 'suspended');--> statement-breakpoint
CREATE TABLE "inventory_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "inventory_user_role" DEFAULT 'user' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"last_login" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0.00',
	"unit" varchar(50) NOT NULL,
	"description" text,
	"minStockLevel" integer DEFAULT 10 NOT NULL,
	"category" varchar(100),
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "justoo_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "admin_role" DEFAULT 'viewer' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "justoo_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"transaction_id" varchar(255),
	"gateway_response" varchar(500),
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "justoo_riders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"vehicle_type" varchar(50) NOT NULL,
	"vehicle_number" varchar(50) NOT NULL,
	"license_number" varchar(100),
	"status" "rider_status" DEFAULT 'active' NOT NULL,
	"total_deliveries" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 5,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"itemId" integer NOT NULL,
	"itemName" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"status" "order_status" DEFAULT 'placed' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"itemCount" integer NOT NULL,
	"notes" text,
	"customerName" varchar(255),
	"customerPhone" varchar(20),
	"customerEmail" varchar(255),
	"deliveryAddress" text,
	"riderId" integer,
	"estimatedDeliveryTime" timestamp,
	"deliveredAt" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
