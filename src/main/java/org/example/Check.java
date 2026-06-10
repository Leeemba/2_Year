package org.example;

public class Check {
    public boolean getAnswer(float x, float y, int r) {
        return checkCircle(x, y, r) || checkRectangle(x, y, r) || checkTriangle(x, y, r);
    }

    public boolean checkRectangle(float x, float y, int r) {
        return x <= 0 && x >= (float) -r /2 && y >= 0 && y <= r;
    }

    public boolean checkCircle(float x, float y, int r) {
        return x <= 0 && y <= 0 && Math.sqrt(x*x + y*y) <= r;
    }

    public boolean checkTriangle(float x, float y, int r) {
        return x >= 0 && y >= 0 && x + 2*y <= r;
    }

}