// FILE: auth-service/src/main/java/com/serviceeverz/authservice/client/RoleServiceClient.java
package com.serviceeverz.authservice.client;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
 
@FeignClient(name = "role-service")
public interface RoleServiceClient {
 
    @GetMapping("/api/v1/internal/roles/user/{userId}")
    List<String> getRolesForUser(@PathVariable("userId") Long userId);
}
 