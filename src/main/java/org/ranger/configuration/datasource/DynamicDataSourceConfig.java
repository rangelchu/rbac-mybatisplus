package org.ranger.configuration.datasource;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Mapper;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import javax.sql.DataSource;
import java.beans.PropertyVetoException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Configuration
@EnableTransactionManagement(proxyTargetClass = true)
@EnableConfigurationProperties(value = {DynamicDataSourceProperties.class})
@MapperScan(basePackages = "org.ranger.mapper",annotationClass = Mapper.class)
public class DynamicDataSourceConfig {

    @Autowired
    private DynamicDataSourceProperties dataSourceProperties;

    @Bean
    @Primary
    public DynamicDataSource dynamicDataSource() {

        Map<Object, Object> targetDataSources = new HashMap<>();

        List<DataSourceConfig> dataSources = dataSourceProperties.getDataSources();
        for (DataSourceConfig config:dataSources){
            DataSource ds = this.createDataSource(config);
            targetDataSources.put(config.getServerName(), ds);
        }
        DataSourceConfig dataSourceConfig = dataSourceProperties.getDataSources().get(0);
        DynamicDataSource dataSource = new DynamicDataSource(targetDataSources,targetDataSources.get(dataSourceConfig.getServerName()));
        return dataSource;
    }



    private DataSource createDataSource(DataSourceConfig config) {
        log.info("=======config:"+config.toString());
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName(config.getDriverClassName());
        dataSource.setJdbcUrl(config.getUrl());
        dataSource.setUsername(config.getUsername());
        dataSource.setPassword(config.getPassword());
        dataSource.setMaximumPoolSize(config.getMaximumPoolSize());
        dataSource.setMinimumIdle(config.getMinimumIdle());
        dataSource.setIdleTimeout(config.getIdleTimeout());
        dataSource.setMaxLifetime(config.getMaxLifetime());
        dataSource.setConnectionTestQuery("SELECT 1");
        return dataSource;
    }


    @Bean(name = "transactionManager")
    public PlatformTransactionManager platformTransactionManager() throws PropertyVetoException{
        DataSourceTransactionManager transactionManager=new DataSourceTransactionManager();
        transactionManager.setDataSource(this.dynamicDataSource());
        return transactionManager;
    }
}
