package org.ranger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.ranger.entity.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

}
