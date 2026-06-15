package com.serviceeverz.userservice.location.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateLocationRequest {

    @NotBlank
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}