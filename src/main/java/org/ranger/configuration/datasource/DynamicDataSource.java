package org.ranger.configuration.datasource;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.jdbc.datasource.lookup.DataSourceLookup;

import java.util.Map;

@Slf4j
public class DynamicDataSource extends AbstractRoutingDataSource {

    public DynamicDataSource(Map<Object, Object> targetDataSources, Object defaultTargetDataSource) {
        super.setDefaultTargetDataSource(defaultTargetDataSource);
        super.setTargetDataSources(targetDataSources);
    }

    @Override
    protected Object determineCurrentLookupKey() {
        log.info("==Current Datasource:"+DataSourceContextHolder.getDataSource());
        return DataSourceContextHolder.getDataSource();
    }
}
