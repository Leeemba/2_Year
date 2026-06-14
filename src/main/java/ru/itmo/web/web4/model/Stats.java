package ru.itmo.web.web4.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stats")
public class Stats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "username")
    private String username;

    @Column(name = "alive_count")
    private Long alive;

    @Column(name = "died_count")
    private Long died;

    @Column(name = "score")
    private Long score;

    @Column(name = "user_id")
    private Long userId;
}