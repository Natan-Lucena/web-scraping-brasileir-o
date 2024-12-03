/*
  Warnings:

  - Added the required column `leagueName` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `matches` ADD COLUMN `leagueName` VARCHAR(191) NOT NULL;
