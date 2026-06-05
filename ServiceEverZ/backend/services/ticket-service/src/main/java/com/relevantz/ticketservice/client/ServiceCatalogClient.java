// NEW FILE: ticket-service/src/main/java/com/relevantz/ticketservice/client/ServiceCatalogClient.java
package com.relevantz.ticketservice.client;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;
 
@FeignClient(name = "service-catalog", url = "${service.catalog.base-url}")
public interface ServiceCatalogClient {
 
    @GetMapping("/api/service-catalog/categories/{id}")
    Map<String, Object> getCategoryById(@PathVariable("id") Long id);
 
    @GetMapping("/api/service-catalog/subcategories/{id}")
    Map<String, Object> getSubcategoryById(@PathVariable("id") Long id);
 
    @GetMapping("/api/service-catalog/services/{id}")
    Map<String, Object> getServiceById(@PathVariable("id") Long id);
}
 