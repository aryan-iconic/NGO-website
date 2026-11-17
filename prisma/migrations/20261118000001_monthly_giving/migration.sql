CREATE TABLE "monthly_giving_plans" (
    "id" TEXT NOT NULL,
    "gateway_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount_paise" INTEGER NOT NULL,
    "total_cycles" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "monthly_giving_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "monthly_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "gateway_subscription_id" TEXT,
    "amount_paise" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "short_url" TEXT,
    "next_charge_at" TIMESTAMP(3),
    "last_charge_at" TIMESTAMP(3),
    "cancel_at_cycle_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "monthly_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "razorpay_subscription_events" (
    "id" TEXT NOT NULL,
    "gateway_event_id" TEXT NOT NULL,
    "gateway_subscription_id" TEXT,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "razorpay_subscription_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "monthly_giving_plans_gateway_plan_id_key" ON "monthly_giving_plans"("gateway_plan_id");
CREATE UNIQUE INDEX "monthly_subscriptions_gateway_subscription_id_key" ON "monthly_subscriptions"("gateway_subscription_id");
CREATE INDEX "monthly_subscriptions_user_id_status_created_at_idx" ON "monthly_subscriptions"("user_id", "status", "created_at");
CREATE INDEX "monthly_subscriptions_plan_id_status_idx" ON "monthly_subscriptions"("plan_id", "status");
CREATE UNIQUE INDEX "razorpay_subscription_events_gateway_event_id_key" ON "razorpay_subscription_events"("gateway_event_id");
CREATE INDEX "razorpay_subscription_events_gateway_subscription_id_received_at_idx" ON "razorpay_subscription_events"("gateway_subscription_id", "received_at");

ALTER TABLE "monthly_subscriptions" ADD CONSTRAINT "monthly_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "monthly_subscriptions" ADD CONSTRAINT "monthly_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "monthly_giving_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
