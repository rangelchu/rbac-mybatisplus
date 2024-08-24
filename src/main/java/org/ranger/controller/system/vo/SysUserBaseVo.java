package org.ranger.controller.system.vo;

import org.ranger.entity.SysRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Schema(name = "User value-object")
public class SysUserBaseVo {
    private Long userId;
    private String username;
    private String password;
    private Date createDate;
    private Date updateDate;
    private boolean active;
    private List<SysRole> roles ;
}
