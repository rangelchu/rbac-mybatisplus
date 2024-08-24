package org.ranger.configuration;


import org.ranger.security.CustomUserDetailsService;
import org.ranger.security.JwtAuthenticationFilter;
import org.ranger.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security Configuration
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {
    @Bean
    public WebSecurityCustomizer ignoreSwaggerPath() {
        return (web) -> web.ignoring().requestMatchers("/webjars/js/**","webjars/css/**", "/doc.html", "/v3/api-docs","/webjar/**","swagger-ui.html","/swagger-ui/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers(
                                "/v3/api-docs/**", "/webjar/**", "/auth/**")
                        .permitAll() // 允许这些路径无需认证
                        .anyRequest().authenticated() // 其他请求需要认证
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider(), customUserDetailsService()), UsernamePasswordAuthenticationFilter.class) // 自定义JWT过滤器
                // 禁用表单登录
                .formLogin((l)->l.disable())
                // 禁用CSRF保护
                .csrf((c)->c.disable())
                // 开启CORS并进行基本配置（如果需要更详细的CORS配置，考虑使用CorsConfigurationSource）
                .cors((r)->r.disable());

        return http.build();
    }

    @Bean
    public JwtTokenProvider jwtTokenProvider(){
        return  new JwtTokenProvider();
    }


    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();

    }

    @Bean
  public CustomUserDetailsService customUserDetailsService(){
        return  new CustomUserDetailsService();
    }

   @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
       DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
       daoAuthenticationProvider.setUserDetailsService(customUserDetailsService());
       daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
       return new ProviderManager(daoAuthenticationProvider);
    }


}

