CREATE TABLE IF NOT EXISTS `dispensing_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slot` int(11) NOT NULL,
  `tier` enum('gold', 'silver') NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) NOT NULL DEFAULT 'tcn_integration',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slot` (`slot`),
  KEY `idx_tier` (`tier`),
  KEY `idx_success` (`success`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;