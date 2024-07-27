/*
  Warnings:

  - Added the required column `leagueName` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `teams` ADD COLUMN `leagueName` VARCHAR(191) NOT NULL;
