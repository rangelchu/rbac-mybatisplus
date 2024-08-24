package org.ranger.configuration.datasource;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Data
@ConfigurationProperties(prefix = "database-config",ignoreInvalidFields = false)
public class DynamicDataSourceProperties  {
    private List<DataSourceConfig> dataSources;
}

@Data
class DataSourceConfig {
    private String serverName;
    private String driverClassName;
    private String url;
    private String username;
    private String password;
    private Integer maximumPoolSize=10;
    private Integer minimumIdle=5;
    private Integer idleTimeout=60000;
    private Integer maxLifetime=180000;
}