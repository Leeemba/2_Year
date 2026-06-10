package org.example;

import java.util.Arrays;

public class Validation {
    public boolean validate(Float x, Float y, Integer r) {

        if (checkX(x) && checkY(y) && checkR(r) && checkForNull(x, y, r)) {
            return true;
        }
        return false;

    }


    public boolean checkForNull(Float x, Float y, Integer r) {
        return x != null && y != null && r != null;
    }

    public boolean checkX(Float x) {
        float[] xRange = {-2, -1.5F, -1, -0.5F, 0, 0.5F, 1, 1.5F, 2};

        return Arrays.binarySearch(xRange, x) >= 0;
    }

    public boolean checkY(Float y) {
        return y >= -3 && y <= 3;
    }

    public boolean checkR(Integer r) {
        int[] rRange = {1, 2, 3, 4, 5};

        return Arrays.binarySearch(rRange, r) >= 0;
    }

}
