package org.ranger.configuration.datasource;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DataSourceContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();

    public static void setDataSource(String dataSource) {
        log.info("==setDataSource set:"+dataSource);
        contextHolder.set(dataSource);
    }

    public static String getDataSource() {
        log.info("==getDataSource get:"+contextHolder.get());
        return contextHolder.get();
    }

    public static void clearDataSource() {
        contextHolder.remove();
    }
}
