-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 18, 2025 at 11:23 PM
-- Server version: 5.7.44-cll-lve
-- PHP Version: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eeelab46_vendinghangerdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `dispensing_logs`
--

CREATE TABLE `dispensing_logs` (
  `id` int(11) NOT NULL,
  `slot` int(11) NOT NULL,
  `tier` enum('gold','silver') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '2-tier prize system with multiple slots',
  `success` tinyint(1) NOT NULL DEFAULT '0',
  `error` text COLLATE utf8mb4_unicode_ci,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tcn_integration',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dispensing_logs`
--

INSERT INTO `dispensing_logs` (`id`, `slot`, `tier`, `success`, `error`, `timestamp`, `source`, `created_at`) VALUES
(157, 48, 'silver', 1, NULL, '2025-12-18 07:19:24', 'electron_vending', '2025-12-18 15:19:24'),
(158, 48, 'silver', 1, NULL, '2025-12-18 07:19:24', 'electron_vending', '2025-12-18 15:19:24'),
(159, 51, 'silver', 1, NULL, '2025-12-18 07:21:07', 'electron_vending', '2025-12-18 15:21:07'),
(160, 51, 'silver', 1, NULL, '2025-12-18 07:21:08', 'electron_vending', '2025-12-18 15:21:07'),
(161, 52, 'silver', 1, NULL, '2025-12-18 07:21:43', 'electron_vending', '2025-12-18 15:21:43'),
(162, 52, 'silver', 1, NULL, '2025-12-18 07:21:44', 'electron_vending', '2025-12-18 15:21:44'),
(163, 53, 'silver', 1, NULL, '2025-12-18 07:22:52', 'electron_vending', '2025-12-18 15:22:52'),
(164, 53, 'silver', 1, NULL, '2025-12-18 07:22:53', 'electron_vending', '2025-12-18 15:22:53'),
(165, 54, 'silver', 1, NULL, '2025-12-18 07:23:20', 'electron_vending', '2025-12-18 15:23:22'),
(166, 54, 'silver', 1, NULL, '2025-12-18 07:23:22', 'electron_vending', '2025-12-18 15:23:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dispensing_logs`
--
ALTER TABLE `dispensing_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_slot` (`slot`),
  ADD KEY `idx_tier` (`tier`),
  ADD KEY `idx_success` (`success`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_source` (`source`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dispensing_logs`
--
ALTER TABLE `dispensing_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=167;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
