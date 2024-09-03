-- CreateTable
CREATE TABLE `user_interests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `teamName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_interests` ADD CONSTRAINT `user_interests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interests` ADD CONSTRAINT `user_interests_teamName_fkey` FOREIGN KEY (`teamName`) REFERENCES `teams`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
