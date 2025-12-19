-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 19, 2025 at 01:19 AM
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
(185, 1, 'silver', 1, NULL, '2025-12-18 07:55:07', 'electron_vending', '2025-12-18 15:55:07'),
(186, 1, 'silver', 1, NULL, '2025-12-18 07:55:08', 'electron_vending', '2025-12-18 15:55:08'),
(187, 2, 'silver', 1, NULL, '2025-12-18 07:55:41', 'electron_vending', '2025-12-18 15:55:41'),
(188, 2, 'silver', 1, NULL, '2025-12-18 07:55:42', 'electron_vending', '2025-12-18 15:55:41'),
(189, 3, 'silver', 1, NULL, '2025-12-18 08:11:35', 'electron_vending', '2025-12-18 16:11:37'),
(190, 3, 'silver', 1, NULL, '2025-12-18 08:11:37', 'electron_vending', '2025-12-18 16:11:38'),
(191, 1, 'silver', 1, NULL, '2025-12-18 08:28:04', 'electron_vending', '2025-12-18 16:28:07'),
(192, 1, 'silver', 1, NULL, '2025-12-18 08:28:08', 'electron_vending', '2025-12-18 16:28:09'),
(193, 2, 'silver', 1, NULL, '2025-12-18 08:28:59', 'electron_vending', '2025-12-18 16:28:59'),
(194, 2, 'silver', 1, NULL, '2025-12-18 08:29:00', 'electron_vending', '2025-12-18 16:29:01'),
(195, 3, 'silver', 1, NULL, '2025-12-18 08:29:46', 'electron_vending', '2025-12-18 16:29:45'),
(196, 3, 'silver', 1, NULL, '2025-12-18 08:29:46', 'electron_vending', '2025-12-18 16:29:46'),
(197, 4, 'silver', 1, NULL, '2025-12-18 08:30:35', 'electron_vending', '2025-12-18 16:30:39'),
(198, 4, 'silver', 1, NULL, '2025-12-18 08:30:40', 'electron_vending', '2025-12-18 16:30:43'),
(199, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 08:43:32', 'electron_vending', '2025-12-18 16:43:31'),
(200, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 08:43:32', 'electron_vending', '2025-12-18 16:43:31'),
(201, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 08:48:46', 'electron_vending', '2025-12-18 16:48:47'),
(202, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 08:48:48', 'electron_vending', '2025-12-18 16:48:47'),
(203, 1, 'silver', 1, NULL, '2025-12-18 08:49:34', 'electron_vending', '2025-12-18 16:49:34'),
(204, 1, 'silver', 1, NULL, '2025-12-18 08:49:34', 'electron_vending', '2025-12-18 16:49:34'),
(205, 2, 'silver', 1, NULL, '2025-12-18 08:50:14', 'electron_vending', '2025-12-18 16:50:14'),
(206, 2, 'silver', 1, NULL, '2025-12-18 08:50:14', 'electron_vending', '2025-12-18 16:50:14'),
(207, 3, 'silver', 1, NULL, '2025-12-18 08:54:11', 'electron_vending', '2025-12-18 16:54:10'),
(208, 3, 'silver', 1, NULL, '2025-12-18 08:54:11', 'electron_vending', '2025-12-18 16:54:11'),
(209, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:09:59', 'electron_vending', '2025-12-18 17:09:59'),
(210, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:10:00', 'electron_vending', '2025-12-18 17:09:59'),
(211, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:10:33', 'electron_vending', '2025-12-18 17:10:33'),
(212, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:10:33', 'electron_vending', '2025-12-18 17:10:33'),
(213, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:11:00', 'electron_vending', '2025-12-18 17:10:59'),
(214, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:11:00', 'electron_vending', '2025-12-18 17:10:59'),
(215, 1, 'silver', 1, NULL, '2025-12-18 09:13:00', 'electron_vending', '2025-12-18 17:13:01'),
(216, 1, 'silver', 1, NULL, '2025-12-18 09:13:02', 'electron_vending', '2025-12-18 17:13:09'),
(217, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:08', 'electron_vending', '2025-12-18 17:13:09'),
(218, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:08', 'electron_vending', '2025-12-18 17:13:09'),
(219, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:09', 'electron_vending', '2025-12-18 17:13:10'),
(220, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:10', 'electron_vending', '2025-12-18 17:13:10'),
(221, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:10', 'electron_vending', '2025-12-18 17:13:12'),
(222, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:11', 'electron_vending', '2025-12-18 17:13:12'),
(223, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:41', 'electron_vending', '2025-12-18 17:13:43'),
(224, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:13:44', 'electron_vending', '2025-12-18 17:13:44'),
(225, 2, 'silver', 1, NULL, '2025-12-18 09:13:44', 'electron_vending', '2025-12-18 17:13:44'),
(226, 2, 'silver', 1, NULL, '2025-12-18 09:13:45', 'electron_vending', '2025-12-18 17:13:45'),
(227, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:14:07', 'electron_vending', '2025-12-18 17:14:07'),
(228, 0, 'silver', 0, 'Game time too short for prize eligibility', '2025-12-18 09:14:08', 'electron_vending', '2025-12-18 17:14:08'),
(229, 3, 'silver', 1, NULL, '2025-12-18 09:14:38', 'electron_vending', '2025-12-18 17:14:38'),
(230, 3, 'silver', 1, NULL, '2025-12-18 09:14:39', 'electron_vending', '2025-12-18 17:14:39'),
(231, 4, 'silver', 1, NULL, '2025-12-18 09:15:14', 'electron_vending', '2025-12-18 17:15:14'),
(232, 4, 'silver', 1, NULL, '2025-12-18 09:15:15', 'electron_vending', '2025-12-18 17:15:15');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=233;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
