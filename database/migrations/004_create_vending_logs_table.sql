CREATE TABLE IF NOT EXISTS `vending_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `score_id` int(11) DEFAULT NULL,
  `prize_id` int(11) NOT NULL,
  `slot` int(11) NOT NULL,
  `command` varchar(255) NOT NULL,
  `response` text DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `score_id` (`score_id`),
  KEY `prize_id` (`prize_id`),
  CONSTRAINT `vending_logs_score_id_foreign` FOREIGN KEY (`score_id`) REFERENCES `scores` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vending_logs_prize_id_foreign` FOREIGN KEY (`prize_id`) REFERENCES `prizes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;