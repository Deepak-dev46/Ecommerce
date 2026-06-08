package com.rvz.serviceeverz.service;
import java.util.List;

import com.rvz.serviceeverz.dto.request.FreezeWindowRequest;
import com.rvz.serviceeverz.dto.response.FreezeWindowResponse;

public interface FreezeWindowService {
    FreezeWindowResponse createFreezeWindow(FreezeWindowRequest request);
    List<FreezeWindowResponse> getAllFreezeWindows();
    List<FreezeWindowResponse> getActiveFreezeWindows();
    void deleteFreezeWindow(Long id);
}
