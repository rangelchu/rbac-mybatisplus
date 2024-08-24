package org.ranger.service;

import org.ranger.configuration.datasource.DataSourceContextHolder;
import org.ranger.entity.SysUser;
import org.ranger.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

@Service
public class SysUserServiceImpl implements SysUserService {

    @Autowired
    private SysUserMapper userMapper;

    @Override
    public SysUser save(SysUser user) {
        DataSourceContextHolder.setDataSource("master");
        int insert = userMapper.insert(user);
        if (insert>0) {
            return user;
        }
        return null;
    }
}
