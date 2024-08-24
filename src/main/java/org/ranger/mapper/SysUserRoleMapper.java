package org.ranger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.ranger.entity.SysUserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
public interface SysUserRoleMapper extends BaseMapper<SysUserRole> {

    @Select("select * from sys_user_role ur where ur.user_id=#{userId}")
    List<SysUserRole> selectAllByIdUserId(@Param("userId") Long userId);

}

