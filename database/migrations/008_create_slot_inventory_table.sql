CREATE TABLE IF NOT EXISTS `slot_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slot` int(11) NOT NULL UNIQUE,
  `tier` enum('gold', 'silver') NOT NULL,
  `dispense_count` int(11) NOT NULL DEFAULT 0,
  `max_dispenses` int(11) NOT NULL DEFAULT 5,
  `last_dispensed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slot` (`slot`),
  KEY `idx_tier` (`tier`),
  KEY `idx_dispense_count` (`dispense_count`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;