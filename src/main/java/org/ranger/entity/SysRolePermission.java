package org.ranger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;


@Data
@TableName(value="sys_role_permission")
public class SysRolePermission implements Serializable {
	private static final long serialVersionUID = 1L;
		private Long roleId;
		private Long permissionId;
}