package com.rvz.serviceeverz.feign;
 
import java.util.List;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
 
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.UserEmailResponse;
 
@FeignClient(name = "ums-service", url = "${ums.service.url}")
public interface UserServiceClient {
 
    @GetMapping("/api/v1/admin/users")
    ApiResponse<List<UserEmailResponse>> getAllUsers();
 
    @GetMapping("/api/v1/admin/users/{id}")
    ApiResponse<UserEmailResponse> getUserById(@PathVariable("id") Long id);
}
 