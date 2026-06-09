-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('RESTAURANT', 'CAFE', 'SHOP', 'SIGHT', 'LODGING', 'ONSEN', 'TOILET', 'PORT', 'OTHER');

-- CreateEnum
CREATE TYPE "StatusState" AS ENUM ('OPEN', 'CLOSED', 'BREAK');

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionJa" TEXT,
    "descriptionEn" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "openingHours" TEXT NOT NULL DEFAULT '{}',
    "hasStatus" BOOLEAN NOT NULL DEFAULT false,
    "island" TEXT NOT NULL DEFAULT '家島本島',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreStatus" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "state" "StatusState" NOT NULL DEFAULT 'CLOSED',
    "message" TEXT,
    "breakUntil" TIMESTAMP(3),
    "autoCloseAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreCredential" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,

    CONSTRAINT "StoreCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FerrySchedule" (
    "id" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "fromPort" TEXT NOT NULL,
    "toPort" TEXT NOT NULL,
    "departHm" TEXT NOT NULL,
    "arriveHm" TEXT NOT NULL,
    "days" TEXT NOT NULL DEFAULT '[true,true,true,true,true,true,true]',
    "note" TEXT,

    CONSTRAINT "FerrySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelCourse" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "titleJa" TEXT NOT NULL,
    "titleEn" TEXT,
    "descriptionJa" TEXT,
    "descriptionEn" TEXT,
    "durationMin" INTEGER NOT NULL,
    "stops" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "ModelCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "bodyJa" TEXT NOT NULL,
    "bodyEn" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StoreStatus_placeId_key" ON "StoreStatus"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCredential_placeId_key" ON "StoreCredential"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelCourse_slug_key" ON "ModelCourse"("slug");

-- AddForeignKey
ALTER TABLE "StoreStatus" ADD CONSTRAINT "StoreStatus_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCredential" ADD CONSTRAINT "StoreCredential_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
