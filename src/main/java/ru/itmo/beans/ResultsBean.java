package ru.itmo.beans;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.SessionScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import ru.itmo.db.PointDAO;
import ru.itmo.models.Point;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

@Named("resultsBean")
@SessionScoped
@SuppressWarnings("unused")
public class ResultsBean implements Serializable {
    private static final Logger LOGGER = Logger.getLogger(ResultsBean.class.getName());
    private static final int MAX_DISPLAY_POINTS = 100;

    @Inject
    private PointDAO pointDAO;
    @Inject
    private HttpServletRequest request;

    @Getter
    private List<Point> results = new ArrayList<>();

    @PostConstruct
    public void init() {
        loadResultsForCurrentSession();
    }

    public void addResult(Point point) {
        try {
            pointDAO.save(point);
            loadResultsForCurrentSession();
            LOGGER.fine("Added point to results: " + point);
        } catch (Exception e) {
            LOGGER.severe("Failed to save point to database: " + e.getMessage());

            if (results.size() >= MAX_DISPLAY_POINTS) {
                results.remove(0);
            }
            results.add(point);
        }
    }

    public void clearResults() {
        try {
            String sessionId = request.getSession().getId();
            pointDAO.deleteBySession(sessionId);
            results.clear();
            LOGGER.info("Cleared all results from database");
        } catch (Exception e) {
            LOGGER.severe("Failed to clear results from database: " + e.getMessage());
            results.clear();
        }
    }

    private void loadResultsForCurrentSession() {
        try {
            String sessionId = request.getSession().getId();
            results = pointDAO.findLastNBySession(MAX_DISPLAY_POINTS,sessionId);
            LOGGER.fine("Loaded " + results.size() + " points from database");
        } catch (Exception e) {
            LOGGER.severe("Failed to load results from database: " + e.getMessage());
            results = Collections.emptyList();
        }
    }
}