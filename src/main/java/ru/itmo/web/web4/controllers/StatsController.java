package ru.itmo.web.web4.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.web.web4.model.Stats;
import ru.itmo.web.web4.service.StatsService;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/stats")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Stats> getStatsForUser(@PathVariable Long userId) {
        Stats stats = statsService.getStatsByUser(userId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Stats>> getLeaderboard() {
        List<Stats> allStats = statsService.getAllStats();
        List<Stats> sortedStats = allStats.stream()
                .sorted(Comparator.comparing(Stats::getScore).reversed())
                .collect(Collectors.toList());
        return ResponseEntity.ok(sortedStats);
    }
}