package org.ranger.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.ranger.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {


    @Select("select * from sys_user where username=#{username}")
    SysUser selectByUsername(String username);
}
