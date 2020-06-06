--
-- Dumping data for table `chatrooms`
--

INSERT INTO `chatrooms` (`userid`, `chatroomid`, `chatroomdescription`, `linkToChatroom`, `chatroomprivacy`, `chatroompassword`, `chatroomstart`, `chatroomsize`) VALUES
('', '', '', './rings/chatroom_.php', '', '', '1545595319', 0);

-- --------------------------------------------------------

--
-- Dumping data for table `contentunits`
--

INSERT INTO `contentunits` (`title`, `description`, `author`, `linkToContent`, `timeOfUpload`, `typeOfContent`, `sizeOfContent`, `source`, `underrated`, `rated`, `overrated`, `generalaudiences`, `parentalguidancesuggested`, `restricted`) VALUES
('reeeeg', 'ergtbtr trbhybh tbhyt', 'whenhesaidthat', '/ringeround.com/uploads/digital_space_universe_4k_8k-3840x2160.jpg', 1545422241, 'image/jpeg', 877151, '/ringeround.com/home.php', 0, 0, 0, 0, 0, 0),
('fbfdbdgbdg', 'dfbdffdbdf', 'thrt', '/ringeround.com/uploads/hero-commercial-excellence.jpg', 1545497740, 'image/jpeg', 77831, '/ringeround.com/home.php', 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`userid`, `roomid`, `message`, `currentTime`) VALUES
('may', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/24 07:27pm</div><div class=\"msgcontent\">coming home</div></div>', 1545672425),
('whenhesaidthat', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/21 09:56pm</div><div class=\"msgcontent\">yengena</div></div>', 1545422166),
('whenhesaidthat', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/21 09:58pm</div><div class=\"msgcontent\">super cold</div></div>', 1545422336),
('whenhesaidthat', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/21 09:59pm</div><div class=\"msgcontent\">yeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey</div></div>', 1545422385),
('whenhesaidthat', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/21 10:11pm</div><div class=\"msgcontent\">hahaha lol</div></div>', 1545423085),
('soframatic', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/22 04:52pm</div><div class=\"msgcontent\">ujhuihui <br><br><br>iuhijoo<br><br><br>uihijii9joikjplk</div></div>', 1545490374),
('missme', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/22 07:19pm</div><div class=\"msgcontent\">hello</div></div>', 1545499196),
('wow', '/ringeround.com/home.php', '<div class=\"message message-text\"><div class=\"timestamp\">2018/12/23 08:58pm</div><div class=\"msgcontent\">hello world lol</div></div>', 1545591499);

-- --------------------------------------------------------

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userid`, `message`, `source`, `currentTime`, `ipaddress`) VALUES
('whenhesaidthat', 'Welcome', 'index.php', 1545422129, '::1'),
('soframatic', 'Welcome', 'index.php', 1545490301, '::1'),
('fedb', 'Welcome', 'index.php', 1545499795, '::1'),
('may', 'Welcome', 'index.php', 1545672195, '127.0.0.1');

-- --------------------------------------------------------
--
-- Dumping data for table `words`
--

INSERT INTO `words` (`userid`, `roomid`, `newWord`, `currentTime`) VALUES
('may', '/ringeround.com/home.php', 'home', '1545672425'),
('may', '/ringeround.com/home.php', 'coming', '1545672425'),
('whenhesaidthat', '/ringeround.com/home.php', 'yengena', '1545422166'),
('whenhesaidthat', '/ringeround.com/home.php', 'cold', '1545422336'),
('whenhesaidthat', '/ringeround.com/home.php', 'super', '1545422336'),
('whenhesaidthat', '/ringeround.com/home.php', 'yeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey', '1545422385'),
('whenhesaidthat', '/ringeround.com/home.php', 'hahaha', '1545423085'),
('whenhesaidthat', '/ringeround.com/home.php', 'lol', '1545423085'),
('soframatic', '/ringeround.com/home.php', 'uihijii9joikjplk', '1545490374'),
('soframatic', '/ringeround.com/home.php', 'ujhuihui', '1545490374'),
('soframatic', '/ringeround.com/home.php', 'iuhijoo', '1545490374'),
('missme', '/ringeround.com/home.php', 'hello', '1545499196'),
('wow', '/ringeround.com/home.php', 'lol', '1545591499'),
('wow', '/ringeround.com/home.php', 'hello', '1545591499'),
('wow', '/ringeround.com/home.php', 'world', '1545591499');
COMMIT;