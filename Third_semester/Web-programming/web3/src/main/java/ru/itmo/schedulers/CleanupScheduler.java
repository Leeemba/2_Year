package ru.itmo.schedulers;


import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import ru.itmo.db.PointDAO;

import java.util.logging.Logger;

@Singleton
public class CleanupScheduler {
    private static final Logger LOGGER = Logger.getLogger(CleanupScheduler.class.getName());

    @Inject
    private PointDAO pointDAO;

    @Schedule(hour = "*/6", persistent = false) // Каждые 6 часов
    public void cleanupExpiredPoints() {
        try {
            int deleted = pointDAO.deleteExpiredPoints();
            LOGGER.info("Cleaned up " + deleted + " expired points");
        } catch (Exception e) {
            LOGGER.severe("Failed to cleanup expired points: " + e.getMessage());
        }
    }
}
