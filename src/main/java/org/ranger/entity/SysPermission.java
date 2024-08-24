package org.ranger.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

@Data
@TableName(value="sys_permission")
public class SysPermission implements Serializable {

	@TableId(type = IdType.AUTO)
	private Long permissionId;
	private Byte permissionEnable;
	private String permissionKey;
	private String permissionName;
	private String permissionType;


}