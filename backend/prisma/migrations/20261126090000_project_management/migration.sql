-- Keep the earliest lead on projects with more than one legacy OWNER.
WITH owners AS (
    SELECT "id", row_number() OVER (PARTITION BY "projectId" ORDER BY "joinedAt", "id") AS position
    FROM "ProjectMember"
    WHERE "role" = 'OWNER'
)
UPDATE "ProjectMember" AS member
SET "role" = 'MANAGER', "updatedAt" = CURRENT_TIMESTAMP
FROM owners
WHERE member."id" = owners."id" AND owners.position > 1;

CREATE UNIQUE INDEX "ProjectMember_one_owner_idx" ON "ProjectMember" ("projectId") WHERE "role" = 'OWNER';
CREATE INDEX "Project_teamId_status_endDate_idx" ON "Project" ("teamId", "status", "endDate");
