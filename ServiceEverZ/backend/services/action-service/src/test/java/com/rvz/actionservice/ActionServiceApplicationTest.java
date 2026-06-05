package com.rvz.actionservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

// FIX #6: Added all properties that Feign clients and @Value fields require
// so the application context loads cleanly during tests.
// Previously missing: email.service.base-url, master.service.url, itsm.manager.user.id
// Previously wrong: itsm.manager.email (property no longer exists in the service)
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "email.service.base-url=http://localhost:8085/api/mail",
    "ticket.service.url=http://localhost:8082/api/tickets",
    "master.service.url=http://localhost:8081",
    "sla.service.url=http://localhost:8086/api/sla",
    "itsm.manager.user.id=2"
})
class ActionServiceApplicationTest {
    @Test
    void contextLoads() {}
}
