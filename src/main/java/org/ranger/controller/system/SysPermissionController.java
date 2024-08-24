package org.ranger.controller.system;

import org.ranger.entity.SysPermission;
import org.ranger.entity.SysRole;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Permission Management")
@Slf4j
@RestController
public class SysPermissionController {

    @Operation(summary  = "Add a new permission")
    @PostMapping(value = "/addPermission")
    @PreAuthorize("hasAuthority('permission:add')")
    public SysRole addPermission(@RequestBody SysPermission permission) {
        log.debug("-------------Add a new permission-------------");
        return  null;
    }
}
