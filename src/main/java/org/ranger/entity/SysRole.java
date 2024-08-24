package org.ranger.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.io.Serializable;

@Data
@TableName(value = "sys_role")
@NoArgsConstructor
@AllArgsConstructor
public class SysRole implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long roleId;
    private String roleName;
   // private List<SysUser> users;

}
