package ru.itmo.listeners;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import ru.itmo.db.DatabaseManager;
import ru.itmo.db.PointDAO;

import java.util.logging.Logger;

@WebListener
public class DataBaseInitializer implements ServletContextListener {
    private static final Logger LOGGER = Logger.getLogger(DataBaseInitializer.class.getName());

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            LOGGER.info("Initializing database schema...");
            DatabaseManager.getInstance().initializeSchema();
            LOGGER.info("Database schema initialized successfully");

            PointDAO pointDAO = new PointDAO();
            pointDAO.deleteExpiredPoints();
        } catch (Exception e) {
            LOGGER.severe("Failed to initialize database schema: " + e.getMessage());
        }
    }
}