export interface Point {
  id: number;
  x: number;
  y: number;
  r: number;
  shot: number;
  userId: number;
  createdAt?: string;
}

export interface PointRequest {
  action: string;
  x: number;
  y: number;
  r: number;
  uid: number;
}

// Добавляем интерфейс для временных точек
export interface TemporaryPoint {
  status: string;
  message: string;
  x: number;
  y: number;
  r: number;
  hit: boolean | null;
}

// Тип объединения для ответа от API
export type PointResponse = Point | TemporaryPoint;
