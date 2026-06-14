package ru.itmo.web.web4.util;

import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class PointValidation {

    private static final Set<Double> VALID_VALUES = Set.of(
            -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0
    );

    public boolean validate(String dataType, double x, double y, double r) {
        return checkX(x, dataType) && checkY(y) && checkR(r, dataType);
    }

    private boolean checkX(double x, String dataType) {
        if ("click".equals(dataType)) {
            return x >= -2 && x <= 2;
        }
        return VALID_VALUES.contains(x);
    }

    private boolean checkY(double y) {
        return y >= -5 && y <= 3;
    }

    private boolean checkR(double r, String dataType) {
        if ("click".equals(dataType)) {
            return r >= -2 && r <= 2;
        }
        return VALID_VALUES.contains(r);
    }
}