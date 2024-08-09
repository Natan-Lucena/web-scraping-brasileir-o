-- CreateTable
CREATE TABLE `matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamName` VARCHAR(191) NOT NULL,
    `adversaryName` VARCHAR(191) NOT NULL,
    `inGame` BOOLEAN NOT NULL DEFAULT true,
    `goalsFor` INTEGER NOT NULL DEFAULT 0,
    `goalsAgainst` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_teamName_fkey` FOREIGN KEY (`teamName`) REFERENCES `teams`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_adversaryName_fkey` FOREIGN KEY (`adversaryName`) REFERENCES `teams`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
