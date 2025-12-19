-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 18, 2025 at 11:11 PM
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
(105, 15, 'silver', 1, NULL, '2025-12-17 22:32:39', 'electron_vending', '2025-12-18 06:32:40'),
(106, 15, 'silver', 1, NULL, '2025-12-17 22:32:39', 'electron_vending', '2025-12-18 06:32:40'),
(107, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-17 22:33:29', 'electron_vending', '2025-12-18 06:33:30'),
(108, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-17 22:33:29', 'electron_vending', '2025-12-18 06:33:30'),
(109, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-17 22:33:45', 'electron_vending', '2025-12-18 06:33:46'),
(110, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-17 22:33:45', 'electron_vending', '2025-12-18 06:33:46'),
(111, 16, 'silver', 1, NULL, '2025-12-17 22:34:14', 'electron_vending', '2025-12-18 06:34:15'),
(112, 16, 'silver', 1, NULL, '2025-12-17 22:34:14', 'electron_vending', '2025-12-18 06:34:15'),
(113, 17, 'silver', 1, NULL, '2025-12-17 22:35:02', 'electron_vending', '2025-12-18 06:35:03'),
(114, 17, 'silver', 1, NULL, '2025-12-17 22:35:03', 'electron_vending', '2025-12-18 06:35:04'),
(115, 18, 'silver', 1, NULL, '2025-12-17 22:35:31', 'electron_vending', '2025-12-18 06:35:32'),
(116, 18, 'silver', 1, NULL, '2025-12-17 22:35:31', 'electron_vending', '2025-12-18 06:35:32'),
(117, 21, 'silver', 1, NULL, '2025-12-17 22:35:59', 'electron_vending', '2025-12-18 06:36:00'),
(118, 21, 'silver', 1, NULL, '2025-12-17 22:35:59', 'electron_vending', '2025-12-18 06:36:00'),
(119, 22, 'silver', 1, NULL, '2025-12-17 22:36:29', 'electron_vending', '2025-12-18 06:36:30'),
(120, 22, 'silver', 1, NULL, '2025-12-17 22:36:29', 'electron_vending', '2025-12-18 06:36:30'),
(121, 23, 'silver', 1, NULL, '2025-12-17 22:36:55', 'electron_vending', '2025-12-18 06:36:56'),
(122, 23, 'silver', 1, NULL, '2025-12-17 22:36:55', 'electron_vending', '2025-12-18 06:36:56'),
(123, 26, 'silver', 1, NULL, '2025-12-17 22:37:25', 'electron_vending', '2025-12-18 06:37:26'),
(124, 26, 'silver', 1, NULL, '2025-12-17 22:37:25', 'electron_vending', '2025-12-18 06:37:26'),
(125, 27, 'silver', 1, NULL, '2025-12-17 22:41:44', 'electron_vending', '2025-12-18 06:41:45'),
(126, 27, 'silver', 1, NULL, '2025-12-17 22:41:44', 'electron_vending', '2025-12-18 06:41:45'),
(127, 28, 'silver', 1, NULL, '2025-12-17 22:44:05', 'electron_vending', '2025-12-18 06:44:06'),
(128, 28, 'silver', 1, NULL, '2025-12-17 22:44:05', 'electron_vending', '2025-12-18 06:44:06'),
(129, 31, 'silver', 1, NULL, '2025-12-17 22:45:37', 'electron_vending', '2025-12-18 06:45:38'),
(130, 31, 'silver', 1, NULL, '2025-12-17 22:45:37', 'electron_vending', '2025-12-18 06:45:38'),
(131, 32, 'silver', 1, NULL, '2025-12-17 22:46:25', 'electron_vending', '2025-12-18 06:46:26'),
(132, 32, 'silver', 1, NULL, '2025-12-17 22:46:25', 'electron_vending', '2025-12-18 06:46:26'),
(133, 33, 'silver', 1, NULL, '2025-12-17 22:46:52', 'electron_vending', '2025-12-18 06:46:53'),
(134, 33, 'silver', 1, NULL, '2025-12-17 22:46:52', 'electron_vending', '2025-12-18 06:46:53'),
(135, 34, 'silver', 1, NULL, '2025-12-17 22:47:20', 'electron_vending', '2025-12-18 06:47:21'),
(136, 34, 'silver', 1, NULL, '2025-12-17 22:47:20', 'electron_vending', '2025-12-18 06:47:21'),
(137, 35, 'silver', 1, NULL, '2025-12-17 22:47:46', 'electron_vending', '2025-12-18 06:47:47'),
(138, 35, 'silver', 1, NULL, '2025-12-17 22:47:47', 'electron_vending', '2025-12-18 06:47:48'),
(139, 24, 'gold', 1, NULL, '2025-12-17 22:56:41', 'electron_vending', '2025-12-18 06:56:42'),
(140, 24, 'gold', 1, NULL, '2025-12-17 22:56:41', 'electron_vending', '2025-12-18 06:56:42'),
(141, 36, 'silver', 1, NULL, '2025-12-18 06:35:36', 'electron_vending', '2025-12-18 14:35:36'),
(142, 36, 'silver', 1, NULL, '2025-12-18 06:35:36', 'electron_vending', '2025-12-18 14:35:36'),
(143, 37, 'silver', 1, NULL, '2025-12-18 06:47:46', 'electron_vending', '2025-12-18 14:47:46'),
(144, 37, 'silver', 1, NULL, '2025-12-18 06:47:46', 'electron_vending', '2025-12-18 14:47:46'),
(145, 38, 'silver', 1, NULL, '2025-12-18 06:48:14', 'electron_vending', '2025-12-18 14:48:14'),
(146, 38, 'silver', 1, NULL, '2025-12-18 06:48:14', 'electron_vending', '2025-12-18 14:48:14'),
(147, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-18 07:10:02', 'electron_vending', '2025-12-18 15:10:04'),
(148, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-18 07:10:05', 'electron_vending', '2025-12-18 15:10:05'),
(149, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-18 07:10:26', 'electron_vending', '2025-12-18 15:10:27'),
(150, 0, '', 0, 'Game time too short for prize eligibility', '2025-12-18 07:10:27', 'electron_vending', '2025-12-18 15:10:27'),
(151, 45, 'silver', 1, NULL, '2025-12-18 07:10:53', 'electron_vending', '2025-12-18 15:10:53'),
(152, 45, 'silver', 1, NULL, '2025-12-18 07:10:54', 'electron_vending', '2025-12-18 15:10:54');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
