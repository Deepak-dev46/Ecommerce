package com.rvz.serviceeverz.config;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.notification.AssetNotificationService;
import com.rvz.serviceeverz.repository.AssetRepository;
 
@Component
public class RentalExpiryScheduler {
 
    private static final Logger log = LoggerFactory.getLogger(RentalExpiryScheduler.class);
 
    private final AssetRepository assetRepo;
    private final AssetNotificationService notifService;
 
    // Manager userId — email resolved from UMS DB at runtime
    @Value("${notification.manager.user-id}")
    private Long managerUserId;
 
    public RentalExpiryScheduler(AssetRepository assetRepo,
                                  AssetNotificationService notifService) {
        this.assetRepo = assetRepo;
        this.notifService = notifService;
    }
 
    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkRentalExpiry() {
        List<Asset> expiring = assetRepo.findRentalAssetsExpiringSoon(
                LocalDate.now().plusDays(30));
        log.info("Rental expiry check: {} assets expiring within 30 days", expiring.size());
        for (Asset asset : expiring) {
            int daysLeft = (int)(asset.getRentalEndDate().toEpochDay()
                    - LocalDate.now().toEpochDay());
            notifService.notifyRentalExpiryWarning(asset, managerUserId, daysLeft);
        }
    }
}
 