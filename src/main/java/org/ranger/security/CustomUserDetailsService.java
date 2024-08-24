package org.ranger.security;




import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.ranger.entity.*;
import org.ranger.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private SysUserMapper userMapper;
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    @Autowired
    private SysRoleMapper roleMapper;
    @Autowired
    private  PasswordEncoder passwordEncoder;
    @Autowired
    private SysRolePermissionMapper rolePermissionMapper;
    @Autowired
    private SysPermissionMapper permissionMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CustomUserDetails userDetails = this.findCustomUserDetailsByUsername(username);
        return new org.springframework.security.core.userdetails.User(
                userDetails.getUsername(),
                userDetails.getPassword(),
                userDetails.getAuthorities());
    }


    private CustomUserDetails findCustomUserDetailsByUsername(String username) {
        SysUser user = userMapper.selectByUsername(username);
        List<SysUserRole> sysUserRoles = userRoleMapper.selectAllByIdUserId(user.getUserId());
        List<Long> roleIds = sysUserRoles.stream().map(SysUserRole::getRoleId).collect(Collectors.toList());
        List<SysRole> roles = roleMapper.selectBatchIds(roleIds);
        //

        Set<SimpleGrantedAuthority> authorities=new HashSet<>();
        for(SysRole role : roles){
            List<SysRolePermission> rolePermissions = rolePermissionMapper.selectAllByIdRoleId(role.getRoleId());
            List<Long> permissionIds = rolePermissions.stream().map(SysRolePermission::getPermissionId).collect(Collectors.toList());
            if (CollectionUtils.isNotEmpty(permissionIds)) {
                List<SysPermission> permissions = permissionMapper.selectBatchIds(permissionIds);
                if (CollectionUtils.isNotEmpty(permissions)) {
                    for (SysPermission permission : permissions) {
                        if (Objects.nonNull(permission.getPermissionKey())) {
                            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(permission.getPermissionKey());
                            authorities.add(authority);
                        }
                    }
                }
            }
        }
        String password = passwordEncoder.encode(user.getPassword());
        CustomUserDetails userDetails=new CustomUserDetails(user.getUsername(),user.getPassword(),authorities);
        log.debug("Encoder password:"+password);
        return userDetails;
    }
}

