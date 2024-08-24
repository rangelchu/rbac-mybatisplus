package org.ranger.controller.system;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@Tag(name = "User Management")
@Slf4j
@RestController
public class SysUserController {

	@GetMapping("/add")
	@Operation(summary =  "Add a new user")
	@PreAuthorize("hasAuthority('user:add')")
	public Object add() {
		log.info("Hello world! Create user successful");
		return "Hello world! Create user successful";
	}
}
