package com.serviceeverz.userservice.location.service;

import com.serviceeverz.userservice.location.dto.CreateLocationRequest;
import com.serviceeverz.userservice.location.dto.LocationResponse;
import com.serviceeverz.userservice.location.dto.MapUserLocationRequest;
import com.serviceeverz.userservice.location.dto.UpdateLocationRequest;

import jakarta.validation.Valid;

import java.util.List;

public interface ILocationService {
    LocationResponse create(CreateLocationRequest request);

    // Updated: accepts search string (empty = return all)
    List<LocationResponse> getAll(String search);

    // NEW: assign location to a user
   

	void assignLocationToUser(Long userId, MapUserLocationRequest request);
	

	 
	void delete(Long id);

	LocationResponse update(Long id, UpdateLocationRequest request);
	 
}