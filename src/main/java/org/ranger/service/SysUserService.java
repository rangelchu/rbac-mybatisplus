package org.ranger.service;

import org.ranger.entity.SysUser;
import org.springframework.security.core.userdetails.User;

public interface SysUserService {

     SysUser save(SysUser user);
}
