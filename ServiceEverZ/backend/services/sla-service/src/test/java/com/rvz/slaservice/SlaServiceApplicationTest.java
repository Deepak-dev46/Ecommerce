package com.rvz.slaservice;

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
    "ticket.service.url=http://localhost:8082/api/tickets",
    "itsm.manager.email=itsm.manager@itsm.com"
})
class SlaServiceApplicationTest {
    @Test
    void contextLoads() {}
}
