package cit.edu.portfolioX.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import cit.edu.portfolioX.Service.UserService;
import cit.edu.portfolioX.Entity.UserEntity;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();
        
        boolean shouldNotFilter = path.startsWith("/api/auth/") || 
               path.startsWith("/swagger-ui/") || 
               path.startsWith("/v3/api-docs/") ||
               path.startsWith("/api/portfolios/public/") ||
               path.startsWith("/uploads/") ||
               "OPTIONS".equalsIgnoreCase(method);

        logger.debug("Request path: {}, method: {}, shouldNotFilter: {}", path, method, shouldNotFilter);
        return shouldNotFilter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");
            String path = request.getServletPath();
            String method = request.getMethod();
            
            logger.info("Processing request - Path: {}, Method: {}, Auth Header Present: {}", 
                       path, method, (authHeader != null));

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                logger.debug("Found Bearer token: {}", token);

                try {
                    String username = jwtUtil.extractUsername(token);
                    logger.info("Extracted username from token: {}", username);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        if (jwtUtil.isTokenValid(token)) {
                            // Get user from database to get their role
                            UserEntity user = userService.findByUsername(username);
                            if (user == null) {
                                logger.error("User not found in database: {}", username);
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.getWriter().write("User not found");
                                return;
                            }

                            // Create granted authorities from user role
                            List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                            );

                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    username, null, authorities
                            );
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            logger.info("Successfully authenticated user: {} with role: {}", username, user.getRole());
                        } else {
                            logger.warn("Token validation failed for token: {}", token);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("Token validation failed");
                            return;
                        }
                    } else {
                        logger.warn("Username null or authentication already exists - Username: {}, Auth: {}", 
                                  username, SecurityContextHolder.getContext().getAuthentication());
                    }
                } catch (ExpiredJwtException e) {
                    logger.error("JWT token expired: {}", e.getMessage());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token has expired");
                    return;
                } catch (MalformedJwtException | SignatureException e) {
                    logger.error("Invalid JWT token: {}", e.getMessage());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid token");
                    return;
                } catch (Exception e) {
                    logger.error("JWT processing error: {}", e.getMessage(), e);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token processing error: " + e.getMessage());
                    return;
                }
            } else {
                logger.warn("No Bearer token found in request to protected endpoint: {}", path);
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Filter chain error: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication failed: " + e.getMessage());
        }
    }
}
