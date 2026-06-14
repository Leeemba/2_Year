package ru.itmo.web.web4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.web.web4.db.PointRepository;
import ru.itmo.web.web4.db.StatsRepository;
import ru.itmo.web.web4.db.UserRepository;
import ru.itmo.web.web4.model.Stats;
import ru.itmo.web.web4.model.Users;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private StatsService statsService;
    @Autowired
    private StatsRepository statsRepository;
    @Autowired
    private PointRepository pointRepository;

    public Users findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Users authenticate(String username, String password) {
        Users user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }
    @Transactional
    public void deleteUser(Long userId) {
        // Сначала удалить точки
        pointRepository.deleteByUserId(userId);
        // Затем статистику
        statsRepository.deleteByUserId(userId); // Нужно добавить метод
        // Затем пользователя
        userRepository.deleteById(userId);
    }

    @Transactional
    public Users register(String username, String password) {
        // Проверяем, не существует ли уже пользователь
        if (userRepository.findByUsername(username) != null) {
            throw new IllegalArgumentException("User already exists");
        }

        // Создаем пользователя
        Users user = new Users();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user = userRepository.save(user);

        // Создаем статистику для пользователя
        Stats stats = new Stats();
        stats.setUserId(user.getUid());
        stats.setUsername(user.getUsername());
        stats.setAlive(0L);
        stats.setDied(0L);
        stats.setScore(0L);
        statsService.createStats(stats);

        return user;
    }
}