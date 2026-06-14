package ru.itmo.web.web4.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.itmo.web.web4.model.Point;

import java.util.List;

@Repository
public interface PointRepository extends JpaRepository<Point, Long> {
    List<Point> findByUserId(Long userId);
    void deleteByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Point p WHERE p.userId = :userId AND p.r = :r")
    void deleteByUserIdAndR(@Param("userId") Long userId, @Param("r") Double r);
}