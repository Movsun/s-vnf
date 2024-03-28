/*
  Warnings:

  - You are about to drop the column `nsJsonArray` on the `DeploymentV2` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeploymentV2" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "nss" TEXT
);
INSERT INTO "new_DeploymentV2" ("uuid") SELECT "uuid" FROM "DeploymentV2";
DROP TABLE "DeploymentV2";
ALTER TABLE "new_DeploymentV2" RENAME TO "DeploymentV2";
CREATE UNIQUE INDEX "DeploymentV2_uuid_key" ON "DeploymentV2"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
