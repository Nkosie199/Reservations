-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 24, 2018 at 06:47 PM
-- Server version: 5.7.19
-- PHP Version: 7.1.9

-- SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
-- SET AUTOCOMMIT = 0;
-- START TRANSACTION;
-- SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ringerdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `chatrooms`
--

CREATE TABLE `chatrooms` (
  `userid` varchar(30) NOT NULL,
  `chatroomid` varchar(50) NOT NULL,
  `chatroomdescription` text,
  `linkToChatroom` varchar(100) NOT NULL,
  `chatroomprivacy` varchar(10) NOT NULL,
  `chatroompassword` varchar(30) DEFAULT NULL,
  `chatroomstart` varchar(30) NOT NULL,
  `chatroomsize` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`chatroomid`)
);

--
-- Table structure for table `contentunits`
--

CREATE TABLE `contentunits` (
  `title` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `author` varchar(100) NOT NULL,
  `linkToContent` varchar(500) NOT NULL,
  `timeOfUpload` int(11) NOT NULL,
  `typeOfContent` varchar(50) NOT NULL,
  `sizeOfContent` int(11) NOT NULL,
  `source` varchar(100) NOT NULL,
  `underrated` int(11) NOT NULL DEFAULT '0',
  `rated` int(11) NOT NULL DEFAULT '0',
  `overrated` int(11) NOT NULL DEFAULT '0',
  `generalaudiences` int(11) NOT NULL DEFAULT '0',
  `parentalguidancesuggested` int(11) NOT NULL DEFAULT '0',
  `restricted` int(11) NOT NULL DEFAULT '0'
);

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `userid` varchar(50) NOT NULL,
  `roomid` varchar(50) NOT NULL,
  `message` varchar(500) NOT NULL,
  `currentTime` int(11) NOT NULL
);

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userid` varchar(50) NOT NULL,
  `message` varchar(300) NOT NULL,
  `source` varchar(100) NOT NULL,
  `currentTime` int(11) NOT NULL,
  `ipaddress` varchar(20) NOT NULL
);

--
-- Table structure for table `words`
--

CREATE TABLE `words` (
  `userid` varchar(50) NOT NULL,
  `roomid` varchar(50) NOT NULL,
  `newWord` varchar(50) NOT NULL,
  `currentTime` varchar(30) NOT NULL
);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;