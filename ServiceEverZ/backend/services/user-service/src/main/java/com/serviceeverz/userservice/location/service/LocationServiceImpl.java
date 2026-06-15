package com.serviceeverz.userservice.location.service;

import com.serviceeverz.userservice.location.dto.CreateLocationRequest;
import com.serviceeverz.userservice.location.dto.LocationResponse;
import com.serviceeverz.userservice.location.dto.MapUserLocationRequest;
import com.serviceeverz.userservice.location.dto.UpdateLocationRequest;
import com.serviceeverz.userservice.location.entity.Location;
import com.serviceeverz.userservice.location.repository.LocationRepository;
import com.serviceeverz.userservice.shared.exception.DuplicateResourceException;
import com.serviceeverz.userservice.shared.exception.ResourceNotFoundException;
import com.serviceeverz.userservice.usermanagement.entity.User;

import com.serviceeverz.userservice.usermanagement.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LocationServiceImpl implements ILocationService {

    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    public LocationServiceImpl(LocationRepository locationRepository,
                               UserRepository userRepository) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public LocationResponse create(CreateLocationRequest request) {
        String name = request.getName().trim();

        if (locationRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Location already exists: " + name);
        }

        Location saved = locationRepository.save(new Location(name));
        return LocationResponse.from(saved);
    }

    @Override
    public List<LocationResponse> getAll(String search) {
        List<Location> results;

        if (search == null || search.isBlank()) {
            results = locationRepository.findAll();
        } else {
            // Uses the new repository method that filters by name
            results = locationRepository.findByNameContainingIgnoreCase(search.trim());
        }

        return results.stream()
                .map(LocationResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void assignLocationToUser(Long userId, MapUserLocationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + request.getLocationId()));

        user.setLocation(location);
        userRepository.save(user);
    }
    
    
   
    @Transactional
    public LocationResponse update(Long id, UpdateLocationRequest request) {
     
        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Location not found: " + id));
     
        String newName = request.getName().trim();
     
        // check duplicate
        locationRepository.findByNameIgnoreCase(newName)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Location already exists: " + newName);
                    }
                });
     
        location.setName(newName);
        
     
        Location updated = locationRepository.save(location);
     
        return LocationResponse.from(updated);
    }
    
    @Transactional
    public void delete(Long id) {
     
        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Location not found: " + id));
     
        locationRepository.delete(location);
    }
     
     
}


