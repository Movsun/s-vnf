/*
  Warnings:

  - Added the required column `nsId` to the `NS` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NS" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nsId" TEXT NOT NULL,
    "deploymentId" INTEGER,
    "domainId" INTEGER,
    CONSTRAINT "NS_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NS_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_NS" ("deploymentId", "domainId", "id") SELECT "deploymentId", "domainId", "id" FROM "NS";
DROP TABLE "NS";
ALTER TABLE "new_NS" RENAME TO "NS";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
