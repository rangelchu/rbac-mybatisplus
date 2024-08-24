package org.ranger.controller;

import org.ranger.common.constants.CommonConstants;
import org.ranger.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.tags.Tags;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;

@Tag(name = "User authenticate")
@Tags()
@RestController
@RequestMapping(value = "/auth")
@Slf4j
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider=jwtTokenProvider;
    }

    @PostMapping("/login-api")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest loginRequest) {
        try {
            log.info("=============User Login=====================");
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtTokenProvider.generateToken((UserDetails) authentication.getPrincipal());
            LoginReponse loginReponse=new LoginReponse();
            loginReponse.setToken(token);
            loginReponse.setTokenType(CommonConstants.TOKEN_TYPE_BEARER);
            loginReponse.setExpiresIn(jwtTokenProvider.getExpirationInMs());
            return ResponseEntity.ok(loginReponse);
        } catch (AuthenticationException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class LoginRequest implements Serializable {
        private String username;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class LoginReponse implements Serializable{
         private String token;
         private String tokenType;
         private Long expiresIn;
    }
}
