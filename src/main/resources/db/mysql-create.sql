-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        10.5.24-MariaDB - mariadb.org binary distribution
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- 导出 db_system 的数据库结构
CREATE DATABASE IF NOT EXISTS `db_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin */;
USE `db_system`;

-- 导出  表 db_system.sys_permission 结构
CREATE TABLE IF NOT EXISTS `sys_permission` (
  `permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(50) DEFAULT NULL,
  `permission_key` varchar(50) DEFAULT NULL,
  `permission_type` varchar(50) DEFAULT NULL,
  `permission_enable` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`permission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 正在导出表  db_system.sys_permission 的数据：~14 rows (大约)
INSERT INTO `sys_permission` (`permission_id`, `permission_name`, `permission_key`, `permission_type`, `permission_enable`) VALUES
	(1, '用户增加', 'user:add', 'A', 0),
	(2, '用户删除', 'user:delete', 'A', 0),
	(3, '用户查询', 'user:query', 'A', 0),
	(4, '用户修改', 'user:update', 'A', 0),
	(5, '用户管理', 'user:manager', 'D', 0),
	(6, '角色增加', 'role:add', 'A', 0),
	(7, '角色删除', 'role:delete', 'A', 0),
	(8, '角色查询', 'role:query', 'A', 0),
	(9, '角色修改', 'role:update', 'A', 0),
	(10, '角色管理', 'role:manager', 'D', 0),
	(11, '权限增加', 'permission:add', 'A', 0),
	(12, '权限删除', 'permission:delete', 'A', 0),
	(13, '权限查询', 'permission:query', 'A', 0),
	(14, '权限修改', 'permission:update', 'A', 0),
	(15, '权限管理', 'permission:manager', 'D', 0);

-- 导出  表 db_system.sys_role 结构
CREATE TABLE IF NOT EXISTS `sys_role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 正在导出表  db_system.sys_role 的数据：~2 rows (大约)
INSERT INTO `sys_role` (`role_id`, `role_name`) VALUES
	(1, 'admin'),
	(2, 'user');

-- 导出  表 db_system.sys_role_permission 结构
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 正在导出表  db_system.sys_role_permission 的数据：~14 rows (大约)
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(1, 4),
	(1, 5),
	(1, 6),
	(1, 7),
	(1, 8),
	(1, 9),
	(1, 10),
	(1, 11),
	(1, 12),
	(1, 13),
	(1, 14),
	(1, 15);

-- 导出  表 db_system.sys_user 结构
CREATE TABLE IF NOT EXISTS `sys_user` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(500) DEFAULT NULL,
  `status` bit(1) DEFAULT NULL,
  `creator` int(11) DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  `active` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户表';

-- 正在导出表  db_system.sys_user 的数据：~3 rows (大约)
INSERT INTO `sys_user` (`user_id`, `account`, `username`, `password`, `status`, `creator`, `create_date`, `update_date`, `active`) VALUES
	(1, 'admin', 'admin', '{bcrypt}$2a$10$7oSePitdzT3xy7SPi7uO8eOVuJu3PdLmnDxZ83eNbG6ThLCCIU8Ne', NULL, NULL, NULL, NULL, 1),

-- 导出  表 db_system.sys_user_role 结构
CREATE TABLE IF NOT EXISTS `sys_user_role` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 正在导出表  db_system.sys_user_role 的数据：~2 rows (大约)
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
	(1, 1),
	(1, 2);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
