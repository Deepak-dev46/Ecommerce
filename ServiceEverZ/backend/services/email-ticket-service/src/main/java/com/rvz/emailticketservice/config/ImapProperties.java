package com.rvz.emailticketservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "email.imap")
public class ImapProperties {
    private String host;
    private int    port;
    private String username;
    private String password;
    private String folder        = "INBOX";
    private long   pollIntervalMs = 60000;

    public String getHost()              { return host; }
    public void   setHost(String v)      { this.host = v; }
    public int    getPort()              { return port; }
    public void   setPort(int v)         { this.port = v; }
    public String getUsername()          { return username; }
    public void   setUsername(String v)  { this.username = v; }
    public String getPassword()          { return password; }
    public void   setPassword(String v)  { this.password = v; }
    public String getFolder()            { return folder; }
    public void   setFolder(String v)    { this.folder = v; }
    public long   getPollIntervalMs()    { return pollIntervalMs; }
    public void   setPollIntervalMs(long v) { this.pollIntervalMs = v; }
}