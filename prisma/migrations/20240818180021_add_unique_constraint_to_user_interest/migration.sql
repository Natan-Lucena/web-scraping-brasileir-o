/*
  Warnings:

  - A unique constraint covering the columns `[userId,teamName]` on the table `user_interests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_interests_userId_teamName_key` ON `user_interests`(`userId`, `teamName`);
