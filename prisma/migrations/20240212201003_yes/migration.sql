-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NS" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nsId" TEXT NOT NULL,
    "vduCount" INTEGER NOT NULL DEFAULT 1,
    "deploymentId" INTEGER,
    "domainId" INTEGER,
    CONSTRAINT "NS_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NS_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NS" ("deploymentId", "domainId", "id", "nsId") SELECT "deploymentId", "domainId", "id", "nsId" FROM "NS";
DROP TABLE "NS";
ALTER TABLE "new_NS" RENAME TO "NS";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
