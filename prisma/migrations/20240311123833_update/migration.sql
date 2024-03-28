-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_self" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Domain" ("id", "name", "url") SELECT "id", "name", "url" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
