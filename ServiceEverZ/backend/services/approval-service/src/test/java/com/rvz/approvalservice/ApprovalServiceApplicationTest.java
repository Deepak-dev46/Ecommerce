package com.rvz.approvalservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "email.service.url=http://localhost:8085/api/mail/send",
    "assignment.service.url=http://localhost:8084/api/assignments/trigger"
})
class ApprovalServiceApplicationTest {
    @Test
    void contextLoads() {}
}
