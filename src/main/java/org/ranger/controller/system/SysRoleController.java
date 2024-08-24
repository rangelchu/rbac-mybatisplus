package org.ranger.controller.system;

import org.ranger.entity.SysRole;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Role Management")
@Slf4j
@RestController
public class SysRoleController {

    @Operation(summary = "Add a new role")
    @PostMapping(value = "/addRole")
    @PreAuthorize("hasAuthority('role:add')")
    public SysRole addRole(@RequestBody SysRole role) {
        log.debug("------------Add a new role---------");
          return  null;
    }
}
