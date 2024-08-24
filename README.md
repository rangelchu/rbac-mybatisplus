本项目是一个简单的RABC系统 1.集成了SpringBoot3、MybatisPlus、knife4j、SpringDoc、SpringSecurity6 2.使用的数据库MariaDB（MySQL）

安装步骤 
1.将resources/db/mysql-create.sql的放到MySQL或者MariaDB直接安装，创建数据库：db_system 
2.修改application-dev.yml的数据库信息，包括用户名、密码、IP等 
3.修改后直接通过IDEA开发工具运行SpringbootApplication

功能
1.支持多角色
2.支持多数据源切换
3.支持SpringSecurity Token校验
