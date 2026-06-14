package ru.itmo.web.web4.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.web.web4.dto.PointRequest;
import ru.itmo.web.web4.dto.PointResponse;
import ru.itmo.web.web4.model.Point;
import ru.itmo.web.web4.service.PointService;
import ru.itmo.web.web4.service.StatsService;
import ru.itmo.web.web4.util.AreaChecker;
import ru.itmo.web.web4.util.PointValidation;

import java.text.DecimalFormat;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/shots")
public class PointController {

    @Autowired
    private PointService pointService;
    @Autowired
    private PointValidation validator;
    @Autowired
    private AreaChecker areaChecker;
    @Autowired
    private StatsService statsService;

    @PostMapping("/home")
    public ResponseEntity<?> checkPoint(@Valid @RequestBody PointRequest request) {
        // Форматирование чисел (при необходимости)
        DecimalFormat df = new DecimalFormat("#.####");
        double x = Double.parseDouble(df.format(request.getX()).replace(",", "."));
        double y = Double.parseDouble(df.format(request.getY()).replace(",", "."));
        double r = Double.parseDouble(df.format(request.getR()).replace(",", "."));

        if (!validator.validate(request.getAction(), x, y, r)) {
            return ResponseEntity.badRequest().body("Invalid parameters");
        }

        Point point = new Point();
        point.setX(x);
        point.setY(y);
        point.setR(r);
        point.setUserId(request.getUid());

        // Проверка попадания
        boolean hit = areaChecker.check(point.getX(), point.getY(), point.getR());
        point.setShot(hit ? 1 : 0);

        // Сохранение
        point = pointService.savePoint(point);
        statsService.updateStats(hit, point.getUserId());

        // Создание ответа
        PointResponse response = new PointResponse();
        response.setId(point.getId());
        response.setShot(point.getShot());
        response.setX(point.getX());
        response.setY(point.getY());
        response.setR(point.getR());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/points/{userId}")
    public ResponseEntity<List<PointResponse>> getPoints(@PathVariable Long userId) {
        List<Point> points = pointService.getPointsByUser(userId);

        List<PointResponse> responses = points.stream()
                .map(point -> {
                    PointResponse response = new PointResponse();
                    response.setId(point.getId());
                    response.setShot(point.getShot());
                    response.setX(point.getX());
                    response.setY(point.getY());
                    response.setR(point.getR());
                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
    @DeleteMapping("/points/{userId}")
    public ResponseEntity<?> deleteAllPoints(@PathVariable Long userId) {
        pointService.deletePointsByUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/points/{userId}/radius/{r}")
    public ResponseEntity<?> deletePointsByRadius(@PathVariable Long userId,
                                                  @PathVariable Double r) {
        pointService.deletePointsByUserAndRadius(userId, r);
        return ResponseEntity.ok().build();
    }
}