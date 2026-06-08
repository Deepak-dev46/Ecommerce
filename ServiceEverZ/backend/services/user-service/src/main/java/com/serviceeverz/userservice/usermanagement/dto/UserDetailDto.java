package com.serviceeverz.userservice.usermanagement.dto;

import com.serviceeverz.userservice.usermanagement.entity.User;

/**
 * Internal DTO returned to auth-service via Feign.
 * Includes passwordHash — only exposed on internal endpoint.
 */
public class UserDetailDto {

    private Long    id;
    private String  email;
    private String  passwordHash;
    private String  firstName;
    private String  lastName;
    private String  status;
    private boolean firstLogin;

    public static UserDetailDto from(User u) {
        UserDetailDto d = new UserDetailDto();
        d.id           = u.getId();
        d.email        = u.getEmail();
        d.passwordHash = u.getPasswordHash();
        d.firstName    = u.getFirstName();
        d.lastName     = u.getLastName();
        d.status       = u.getStatus().name();
        d.firstLogin   = u.isFirstLogin();
        return d;
    }

    public Long    getId()                  { return id; }
    public void    setId(Long v)            { this.id = v; }
    public String  getEmail()               { return email; }
    public void    setEmail(String v)       { this.email = v; }
    public String  getPasswordHash()        { return passwordHash; }
    public void    setPasswordHash(String v){ this.passwordHash = v; }
    public String  getFirstName()           { return firstName; }
    public void    setFirstName(String v)   { this.firstName = v; }
    public String  getLastName()            { return lastName; }
    public void    setLastName(String v)    { this.lastName = v; }
    public String  getStatus()              { return status; }
    public void    setStatus(String v)      { this.status = v; }
    public boolean isFirstLogin()           { return firstLogin; }
    public void    setFirstLogin(boolean v) { this.firstLogin = v; }
}
