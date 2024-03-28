-- CreateTable
CREATE TABLE "DeploymentV2" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "nsJsonArray" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentV2_uuid_key" ON "DeploymentV2"("uuid");
