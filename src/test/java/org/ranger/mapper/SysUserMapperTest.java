package org.ranger.mapper;

import org.ranger.entity.SysUser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Date;

import static net.sf.jsqlparser.util.validation.metadata.NamedObject.user;

@SpringBootTest
public class SysUserMapperTest {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Test
    public void find(){
        SysUser sysUser = sysUserMapper.selectById(1L);
        System.out.println(sysUser);
    }

    @Test
    public void save(){
        SysUser user=new SysUser();
        user.setUsername("test2");
        user.setPassword("123456");
        user.setActive(true);
        user.setCreateDate(new Date());
        user.setUpdateDate(new Date());
        int insert = sysUserMapper.insert(user);
        System.out.println(insert);
    }
}
