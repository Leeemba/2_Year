#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int x;
    int y;
} Point;

typedef enum {
    Triangle,
    Square,
    Circle
} ShapeType;

typedef struct {
    Point p;
    ShapeType type;
    char* name;
} Shape;

typedef struct {
    Shape* shapes;
    int size;
} Container;

Container* init_container();
void add_new_shape(Container* ct, Point p, char* name, ShapeType type);
void print(Container* ct);
void remove_shape_by_index(Container* ct, int index);
void free_container(Container* ct);

int main() {
    Container* ct = init_container();

    Point p1 = {1, 2};
    Point p2 = {5, 7};
    Point p3 = {10, -3};

    add_new_shape(ct, p1, "Shape A", Triangle);
    add_new_shape(ct, p2, "Shape B", Square);
    add_new_shape(ct, p3, "Shape C", Circle);

    printf("All figure:\n");
    print(ct);

    printf("\nremove figure with index ...\n");
    remove_shape_by_index(ct, 1);

    printf("remaining figures:\n");
    print(ct);

    free(ct->shapes);
    free(ct);
}

Container* init_container() {
    Container* ct = malloc(sizeof(Container));
    ct->shapes = NULL;
    ct->size = 0;
    return ct;
}

void add_new_shape(Container* ct, Point p, char* name, ShapeType type) {
    Shape* tmp = realloc(ct->shapes, (ct->size + 1) * sizeof(Shape));
    if (!tmp) {
        printf("Ошибка выделения памяти при добавлении фигуры\n");
        return;
    }
    ct->shapes = tmp;
    ct->shapes[ct->size].p = p;
    ct->shapes[ct->size].type = type;
    ct->shapes[ct->size].name = strdup(name); // копируем строку
    ct->size++;
}

void print(Container* ct) {
    for (int i = 0; i < ct->size; i++) {
        printf("figure %d: %s, Point (%d, %d), Shapetype:",
               i, ct->shapes[i].name,
               ct->shapes[i].p.x, ct->shapes[i].p.y);
        switch (ct->shapes[i].type) {
            case Triangle: printf("Triangle\n"); break;
            case Square:   printf("Square\n");   break;
            case Circle:   printf("Circle\n");   break;
        }
    }
}

void remove_shape_by_index(Container* ct, int index) {
    if (index < 0 || index >= ct->size) {
        printf("Error:incorrect index\n");
        return;
    }
    free(ct->shapes[index].name);
    for (int i = index; i < ct->size - 1; i++) {
        ct->shapes[i] = ct->shapes[i + 1];
    }
    ct->size--;
    ct->shapes = realloc(ct->shapes, ct->size * sizeof(Shape));
}
void free_container(Container* ct) {
    if (!ct) return;
    for (int i = 0; i < ct->size; i++) {
        free(ct->shapes[i].name);
    }
    free(ct->shapes);
    free(ct);
}