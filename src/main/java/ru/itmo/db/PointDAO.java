package ru.itmo.db;

import jakarta.enterprise.context.ApplicationScoped;
import ru.itmo.models.Point;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class PointDAO {
    private static final Logger LOGGER = Logger.getLogger(PointDAO.class.getName());

    private static final String INSERT_SQL = """
        INSERT INTO points (x, y, r, hit, process_time_ms, request_time, session_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

    private static final String SELECT_BY_SESSION_SQL = """
        SELECT x, y, r, hit, process_time_ms, request_time, session_id
        FROM points 
        WHERE session_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
        """;

    private static final String DELETE_BY_SESSION_SQL =
            "DELETE FROM points WHERE session_id = ?";

    private static final String DELETE_EXPIRED_SQL =
            "DELETE FROM points WHERE expires_at < CURRENT_TIMESTAMP";


    public void save(Point point) {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS)) {

            statement.setDouble(1, point.getX());
            statement.setDouble(2, point.getY());
            statement.setDouble(3, point.getR());
            statement.setBoolean(4, point.isHit());
            statement.setFloat(5, point.getProcessTimeInMs());
            statement.setString(6, point.getRequestTime());
            statement.setString(7, point.getSessionId());

            int affectedRows = statement.executeUpdate();

            if (affectedRows == 0) {
                throw new SQLException("Creating point failed, no rows affected.");
            }

            LOGGER.fine("Saved point: " + point);

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to save point", e);
            throw new RuntimeException("Database save failed", e);
        }
    }

    public List<Point> findLastNBySession(int limit, String sessionId) {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BY_SESSION_SQL)) {

            statement.setString(1, sessionId);
            statement.setInt(2, limit);

            try (ResultSet resultSet = statement.executeQuery()) {
                return mapResultSetToPoints(resultSet);
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to fetch points", e);
            throw new RuntimeException("Database query failed", e);
        }
    }

    public void deleteBySession(String sessionId) {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_BY_SESSION_SQL)) {

             statement.setString(1, sessionId);
            int affectedRows = statement.executeUpdate();

            LOGGER.info("Deleted "+affectedRows + " points");

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to delete points", e);
            throw new RuntimeException("Database delete failed", e);
        }
    }

    public int deleteExpiredPoints() {
        try (Connection connection = DatabaseManager.getInstance().getConnection();
             Statement statement = connection.createStatement()) {
             int points = statement.executeUpdate(DELETE_EXPIRED_SQL);
             return points;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to delete points", e);
            throw new RuntimeException("Database delete failed", e);
        }
    }

    private List<Point> mapResultSetToPoints(ResultSet resultSet) throws SQLException {
        List<Point> points = new ArrayList<>();

        while (resultSet.next()) {
            Point point = new Point(
                    resultSet.getDouble("x"),
                    resultSet.getDouble("y"),
                    resultSet.getDouble("r"),
                    resultSet.getBoolean("hit"),
                    resultSet.getFloat("process_time_ms"),
                    resultSet.getString("request_time"),
                    resultSet.getString("session_id")
            );
            points.add(point);
        }

        return points;
    }
}