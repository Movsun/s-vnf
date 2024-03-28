-- CreateTable
CREATE TABLE "Domain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "NS" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deploymentId" INTEGER,
    "domainId" INTEGER,
    CONSTRAINT "NS_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NS_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VDU" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vdu_index" INTEGER
);
