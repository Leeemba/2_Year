package ru.itmo.web.web4.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.web.web4.model.Stats;

import java.util.List;


@Repository
public interface StatsRepository extends JpaRepository<Stats, Long> {
    List<Stats> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}