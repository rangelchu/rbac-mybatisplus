package org.ranger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.ranger.entity.SysRolePermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
public interface SysRolePermissionMapper extends BaseMapper<SysRolePermission> {
    @Select("select * from sys_role_permission rp where rp.role_id=#{roleId}")
    List<SysRolePermission> selectAllByIdRoleId(@Param("roleId") Long roleId);
}
