import os, random, ctypes, math

# --- Генерация файла ---
def generate_points_file(filename="points.txt", count=1200):
    with open(filename, "w", encoding="utf-8") as f:
        for _ in range(count):
            x1, y1 = random.randint(0, 100), random.randint(0, 100)
            x2, y2 = random.randint(0, 100), random.randint(0, 100)
            f.write(f"{x1},{y1} {x2},{y2}\n")

# --- Класс Point ---
class Point(ctypes.Structure):
    _fields_ = [("x", ctypes.c_int), ("y", ctypes.c_int)]

# --- Чтение файла ---
def read_points(filename="points.txt"):
    pairs = []
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            p1, p2 = line.strip().split()
            x1, y1 = map(int, p1.split(","))
            x2, y2 = map(int, p2.split(","))
            pairs.append((Point(x1, y1), Point(x2, y2)))
    return pairs

# --- Основной код ---
if __name__ == "__main__":
    generate_points_file()
    pairs = read_points()

    lib_name = "point_lib.dll" if os.name == "nt" else "point_lib.so"
    lib_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), lib_name)
    c_lib = ctypes.CDLL(lib_path)

    c_lib.calc_distances.argtypes = [
        ctypes.POINTER(Point), ctypes.POINTER(Point),
        ctypes.POINTER(ctypes.c_double), ctypes.c_int
    ]

    n = len(pairs)
    data1 = (Point * n)(*(p[0] for p in pairs))
    data2 = (Point * n)(*(p[1] for p in pairs))
    results = (ctypes.c_double * n)()

    c_lib.calc_distances(data1, data2, results, n)

    for i in range(10):
        print(f"Пара {i+1}: расстояние = {results[i]:.2f}")