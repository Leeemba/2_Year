package ru.itmo.web.web4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.web.web4.db.PointRepository;
import ru.itmo.web.web4.model.Point;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PointService {

    @Autowired
    private PointRepository pointRepository;

    public List<Point> getPointsByUser(Long userId) {
        return pointRepository.findByUserId(userId);
    }

    public List<Point> getAllPoints() {
        return pointRepository.findAll();
    }

    @Transactional
    public Point savePoint(Point point) {
        return pointRepository.save(point);
    }

    @Transactional
    public void deletePointsByUser(Long userId) {
        pointRepository.deleteByUserId(userId);
    }

    @Transactional
    public void deletePointsByUserAndRadius(Long userId, Double r) {
        pointRepository.deleteByUserIdAndR(userId, r);
    }
}