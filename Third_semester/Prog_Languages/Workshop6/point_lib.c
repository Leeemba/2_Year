#include <math.h>

typedef struct {
    int x;
    int y;
} Point;

void calc_distances(Point* data1, Point* data2, double* results, int n) {
    for (int i = 0; i < n; ++i) {
        double dx = data1[i].x - data2[i].x;
        double dy = data1[i].y - data2[i].y;
        results[i] = sqrt(dx*dx + dy*dy);
    }
    // malloc()
}
