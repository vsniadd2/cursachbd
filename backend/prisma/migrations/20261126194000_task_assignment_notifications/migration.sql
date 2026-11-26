ALTER TYPE "NotificationType" ADD VALUE 'TASK_ASSIGNED';

CREATE INDEX "Notification_userId_createdAt_id_idx" ON "Notification"("userId", "createdAt", "id");
