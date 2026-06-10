"use strict"

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const CANVAS_LEFT_EDGE = 0;
const CANVAS_RIGHT_EDGE = CANVAS_WIDTH;
const CANVAS_TOP_EDGE = 0;
const CANVAS_BOTTOM_EDGE = CANVAS_HEIGHT;

const BASE_GRAPH_RADIUS = 100;
const MIN_ZOOM_SCALE = 0.1;
const MAX_ZOOM_SCALE = 10.0;
const DRAG_SENSITIVITY_THRESHOLD = 2;
const GRID_DIVISIONS_PER_R = 2;
const GRID_SIZE_FACTOR = 100;
const POINT_RADIUS = 6;
const POINT_GLOW_RADIUS = 8;
const TICK_LENGTH = 5;
const TICK_LABEL_OFFSET = 22;
const ARROW_SIZE = 6;
const ORIGIN_LABEL_OFFSET = 10;

const X_MIN_VALUE = -4;
const X_MAX_VALUE = 4;
const Y_MIN_VALUE = -3;
const Y_MAX_VALUE = 3;

const GRAPH_PRIMARY = '#00ff9d';
const GRAPH_BACKGROUND = '#0a0f1c';
const GRAPH_AXES = '#00ff9d';
const GRAPH_GRID = '#00FF9D26';
const GRAPH_HIT = '#00ff9d';
const GRAPH_MISS = '#ff4d4d';
const GRAPH_TEMP = '#ffcc00';
const GRAPH_HIT_GLOW = '#00cc7d';
const GRAPH_MISS_GLOW = '#cc0000';
const GRAPH_TEMP_GLOW = '#cc9900';
const VALID_AREA_COLOR = '#00ff9d0a';
const VALID_AREA_BORDER = '#00ff9d1a';
const GRAPH_UNIT_RADIUS = 100; // Радиус для R=1 в пикселях

window.displayPoint = null;
let currentR = parseFloat(sessionStorage.getItem('currentR')) || 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let hasDragged = false;
let scale = 1.0;
let redrawScheduled = false;

function graphToCanvas(graphX, graphY) {
    const scaleFactor = GRAPH_UNIT_RADIUS / currentR;
    const pixelX = CANVAS_CENTER_X + ((graphX - offsetX) * scaleFactor * scale);
    const pixelY = CANVAS_CENTER_Y - ((graphY - offsetY) * scaleFactor * scale);
    return {x: pixelX, y: pixelY};
}


function canvasToGraph(canvasX, canvasY) {
    const scaleFactor = currentR / (GRAPH_UNIT_RADIUS * scale);
    const graphX = ((canvasX - CANVAS_CENTER_X) * scaleFactor) + offsetX;
    const graphY = ((CANVAS_CENTER_Y - canvasY) * scaleFactor) + offsetY;
    return {x: graphX, y: graphY};
}
function zoomAtCenter(zoomFactor, useCenter = true) {
    const newScale = scale * zoomFactor;

    if (newScale >= MIN_ZOOM_SCALE && newScale <= MAX_ZOOM_SCALE) {
        const scaleChange = newScale / scale;

        if (useCenter) {
            // Масштабирование относительно центра
            offsetX = -offsetX / scaleChange;
            offsetY = -offsetY / scaleChange;
        }

        scale = newScale;
        scheduleRedraw();
    }
}

function resetView() {
    offsetX = 0;
    offsetY = 0;
    scale = 1.0;
    scheduleRedraw();
}

function scheduleRedraw() {
    if (!redrawScheduled) {
        redrawScheduled = true;
        requestAnimationFrame(() => {
            drawGraph(currentR);
            redrawScheduled = false;
        });
    }
}

function drawTick(x, y, orientation, label) {
    context.strokeStyle = GRAPH_PRIMARY;
    context.lineWidth = 1.5;

    context.beginPath();

    if (orientation === 'horizontal') {
        context.moveTo(x, y - TICK_LENGTH);
        context.lineTo(x, y + TICK_LENGTH);
        context.fillText(label, x, y + TICK_LABEL_OFFSET);
    } else {
        context.moveTo(x - TICK_LENGTH, y);
        context.lineTo(x + TICK_LENGTH, y);
        context.fillText(label, x - TICK_LABEL_OFFSET, y);
    }

    context.stroke();
}

function drawArrows(yAxisCanvasX, xAxisCanvasY) {
    context.strokeStyle = GRAPH_PRIMARY;
    context.lineWidth = 2;
    context.beginPath();

    const xArrowX = CANVAS_WIDTH - 1;
    const xArrowY = xAxisCanvasY;

    context.moveTo(xArrowX, xArrowY);
    context.lineTo(xArrowX - ARROW_SIZE, xArrowY - ARROW_SIZE);
    context.moveTo(xArrowX, xArrowY);
    context.lineTo(xArrowX - ARROW_SIZE, xArrowY + ARROW_SIZE);

    const yArrowX = yAxisCanvasX;
    const yArrowY = 1;

    context.moveTo(yArrowX, yArrowY);
    context.lineTo(yArrowX - ARROW_SIZE, yArrowY + ARROW_SIZE);
    context.moveTo(yArrowX, yArrowY);
    context.lineTo(yArrowX + ARROW_SIZE, yArrowY + ARROW_SIZE);

    context.stroke();
}

function drawGrid(rValue) {
    if (!rValue || rValue <= 0) {
        return;
    }

    context.strokeStyle = GRAPH_GRID;
    context.lineWidth = 0.5;
    context.setLineDash([2, 4]);

    const gridStep = rValue / GRID_DIVISIONS_PER_R;
    const gridSize = GRID_SIZE_FACTOR * rValue;

    if (gridSize <= 0 || gridStep <= 0) {
        return;
    }

    for (let x = -gridSize; x <= gridSize; x += gridStep) {
        const start = graphToCanvas(x, -gridSize);
        const end = graphToCanvas(x, gridSize);

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    }

    for (let y = -gridSize; y <= gridSize; y += gridStep) {
        const start = graphToCanvas(-gridSize, y);
        const end = graphToCanvas(gridSize, y);

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    }

    context.setLineDash([]);
}

function drawValidArea() {
    const topLeft = graphToCanvas(X_MIN_VALUE, Y_MAX_VALUE);
    const bottomRight = graphToCanvas(X_MAX_VALUE, Y_MIN_VALUE);

    context.fillStyle = VALID_AREA_COLOR;
    context.fillRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
    );

    context.strokeStyle = VALID_AREA_BORDER;
    context.lineWidth = 1;
    context.strokeRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
    );
}

function drawAxesWithOffset(rValue) {
    context.strokeStyle = GRAPH_AXES;
    context.lineWidth = 2;
    context.beginPath();

    const xAxisCanvasY = graphToCanvas(0, 0).y;
    const yAxisCanvasX = graphToCanvas(0, 0).x;

    const clampedXAxisY = Math.max(CANVAS_TOP_EDGE, Math.min(CANVAS_BOTTOM_EDGE, xAxisCanvasY));
    context.moveTo(CANVAS_LEFT_EDGE, clampedXAxisY);
    context.lineTo(CANVAS_RIGHT_EDGE, clampedXAxisY);

    const clampedYAxisX = Math.max(CANVAS_LEFT_EDGE, Math.min(CANVAS_RIGHT_EDGE, yAxisCanvasX));
    context.moveTo(clampedYAxisX, CANVAS_TOP_EDGE);
    context.lineTo(clampedYAxisX, CANVAS_BOTTOM_EDGE);

    context.stroke();
    drawArrows(clampedYAxisX, clampedXAxisY);

    context.fillStyle = GRAPH_PRIMARY;
    context.font = "12px 'JetBrains Mono', monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const topLeftGraph = canvasToGraph(0, 0);
    const bottomRightGraph = canvasToGraph(CANVAS_WIDTH, CANVAS_HEIGHT);

    const visibleXMin = Math.min(topLeftGraph.x, bottomRightGraph.x);
    const visibleXMax = Math.max(topLeftGraph.x, bottomRightGraph.x);
    const visibleYMin = Math.min(topLeftGraph.y, bottomRightGraph.y);
    const visibleYMax = Math.max(topLeftGraph.y, bottomRightGraph.y);

    const TICK_SPACING = rValue / 2;

    const xTickStart = Math.floor(visibleXMin / TICK_SPACING) * TICK_SPACING;
    const xTickEnd = Math.ceil(visibleXMax / TICK_SPACING) * TICK_SPACING;
    const yTickStart = Math.floor(visibleYMin / TICK_SPACING) * TICK_SPACING;
    const yTickEnd = Math.ceil(visibleYMax / TICK_SPACING) * TICK_SPACING;

    const LABEL_MARGIN = 25;
    const CORNER_MARGIN = 40;

    for (let xValue = xTickStart; xValue <= xTickEnd; xValue += TICK_SPACING) {
        if (Math.abs(xValue) < TICK_SPACING / 4) continue;

        const xTickPos = graphToCanvas(xValue, 0);

        if (xTickPos.x >= 0 && xTickPos.x <= CANVAS_WIDTH) {
            drawTick(xTickPos.x, clampedXAxisY, 'horizontal', '');

            const isNearLeftCorner = xTickPos.x < CORNER_MARGIN && clampedXAxisY < CORNER_MARGIN;
            const isNearRightCorner = xTickPos.x > CANVAS_WIDTH - CORNER_MARGIN && clampedXAxisY < CORNER_MARGIN;
            const isNearBottomLeftCorner = xTickPos.x < CORNER_MARGIN && clampedXAxisY > CANVAS_HEIGHT - CORNER_MARGIN;
            const isNearBottomRightCorner = xTickPos.x > CANVAS_WIDTH - CORNER_MARGIN && clampedXAxisY > CANVAS_HEIGHT - CORNER_MARGIN;

            if (isNearLeftCorner || isNearRightCorner || isNearBottomLeftCorner || isNearBottomRightCorner) {
                continue;
            }

            let labelX = xTickPos.x;
            let labelY = clampedXAxisY + TICK_LABEL_OFFSET;

            if (clampedXAxisY <= CANVAS_TOP_EDGE + LABEL_MARGIN) {
                labelY = clampedXAxisY + TICK_LABEL_OFFSET;
            } else if (clampedXAxisY >= CANVAS_BOTTOM_EDGE - LABEL_MARGIN) {
                labelY = clampedXAxisY - TICK_LABEL_OFFSET;
            }

            const labelText = xValue.toFixed(1);
            context.fillText(labelText, labelX, labelY);
        }
    }

    for (let yValue = yTickStart; yValue <= yTickEnd; yValue += TICK_SPACING) {
        if (Math.abs(yValue) < TICK_SPACING / 4) continue;

        const yTickPos = graphToCanvas(0, yValue);

        if (yTickPos.y >= 0 && yTickPos.y <= CANVAS_HEIGHT) {
            drawTick(clampedYAxisX, yTickPos.y, 'vertical', '');

            const isNearTopCorner = yTickPos.y < CORNER_MARGIN && clampedYAxisX < CORNER_MARGIN;
            const isNearBottomCorner = yTickPos.y > CANVAS_HEIGHT - CORNER_MARGIN && clampedYAxisX < CORNER_MARGIN;
            const isNearTopRightCorner = yTickPos.y < CORNER_MARGIN && clampedYAxisX > CANVAS_WIDTH - CORNER_MARGIN;
            const isNearBottomRightCorner = yTickPos.y > CANVAS_HEIGHT - CORNER_MARGIN && clampedYAxisX > CANVAS_WIDTH - CORNER_MARGIN;

            if (isNearTopCorner || isNearBottomCorner || isNearTopRightCorner || isNearBottomRightCorner) {
                continue;
            }

            let labelX = clampedYAxisX - TICK_LABEL_OFFSET;
            let labelY = yTickPos.y;

            if (clampedYAxisX <= CANVAS_LEFT_EDGE + LABEL_MARGIN) {
                labelX = clampedYAxisX + TICK_LABEL_OFFSET;
            } else if (clampedYAxisX >= CANVAS_RIGHT_EDGE - LABEL_MARGIN) {
                labelX = clampedYAxisX - TICK_LABEL_OFFSET;
            }

            const labelText = yValue.toFixed(1);
            context.fillText(labelText, labelX, labelY);
        }
    }

    const originLabelPos = graphToCanvas(0, 0);
    context.fillText("0", originLabelPos.x + ORIGIN_LABEL_OFFSET, originLabelPos.y + ORIGIN_LABEL_OFFSET);
}

function drawAllPoints() {
    if (!window.pointsData || window.pointsData.length === 0) {
        return;
    }

    window.pointsData.forEach(point => {
        const coords = graphToCanvas(point.x, point.y);
        const isHit = point.isHit;

        context.fillStyle = isHit ? GRAPH_HIT : GRAPH_MISS;
        context.strokeStyle = isHit ? GRAPH_HIT_GLOW : GRAPH_MISS_GLOW;
        context.lineWidth = 2;

        context.beginPath();
        context.arc(coords.x, coords.y, POINT_RADIUS, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        if (isHit) {
            context.shadowColor = GRAPH_HIT;
            context.shadowBlur = 8;
            context.beginPath();
            context.arc(coords.x, coords.y, POINT_GLOW_RADIUS, 0, 2 * Math.PI);
            context.stroke();
            context.shadowBlur = 0;
        }
    });
}

function drawDisplayPoint() {
    if (!window.displayPoint) {
        return;
    }

    let x = window.displayPoint.x;
    let y = window.displayPoint.y;

    const coords = graphToCanvas(x, y);

    context.fillStyle = GRAPH_TEMP;
    context.strokeStyle = GRAPH_TEMP_GLOW;
    context.lineWidth = 2;

    context.beginPath();
    context.arc(coords.x, coords.y, POINT_RADIUS, 0, 2 * Math.PI);
    context.fill();
    context.stroke();

    context.shadowColor = GRAPH_TEMP;
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(coords.x, coords.y, POINT_GLOW_RADIUS, 0, 2 * Math.PI);
    context.stroke();
    context.shadowBlur = 0;
}

function drawGraph(rValue) {
    context.fillStyle = GRAPH_BACKGROUND;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawValidArea();
    drawGrid(rValue);

    context.fillStyle = 'rgba(0, 255, 157, 0.25)';
    const origin = graphToCanvas(0, 0);

    // 1. Четверть круга в первой четверти (радиус r/2)
    const circleRadius = rValue / 2;
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    // Отрисовка четверти круга от 0 до 0.5π (первая четверть)
    context.arc(origin.x, origin.y,
        (circleRadius * GRAPH_UNIT_RADIUS / rValue) * scale,
        0, Math.PI *1.5, true);
    context.lineTo(origin.x, origin.y);
    context.fill();

    // 2. 2-я четверть: Прямоугольник (-r/2 ≤ x ≤ 0, 0 ≤ y ≤ r)
    const rectTopLeft = graphToCanvas(-rValue/2, rValue);
    context.beginPath();
    context.rect(rectTopLeft.x, rectTopLeft.y,
        origin.x - rectTopLeft.x,    // Ширина = r/2
        origin.y - rectTopLeft.y);
    context.fill();

    // 3. 3-я четверть: Треугольник с катетами r и r/2
    const triangleRight = graphToCanvas(-rValue, 0);
    const triangleTop = graphToCanvas(0, -rValue / 2);
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(triangleRight.x, triangleRight.y);
    context.lineTo(triangleTop.x, triangleTop.y);
    context.closePath();
    context.fill();

    drawAxesWithOffset(rValue);
    drawAllPoints();
    drawDisplayPoint();
}

function handleDrag(e) {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const currentMouseX = e.clientX - rect.left;
    const currentMouseY = e.clientY - rect.top;

    const deltaX = currentMouseX - lastMouseX;
    const deltaY = currentMouseY - lastMouseY;

    // Корректировка смещения с учетом масштаба и R
    offsetX -= deltaX / (GRAPH_UNIT_RADIUS / currentR) / scale;
    offsetY += deltaY / (GRAPH_UNIT_RADIUS / currentR) / scale;

    lastMouseX = currentMouseX;
    lastMouseY = currentMouseY;
    scheduleRedraw();
}

function updateCurrentR(newR) {
    currentR = newR;
    sessionStorage.setItem('currentR', newR);
    scheduleRedraw();
}

function stopDragging() {
    if (!isDragging) {
        return;
    }

    isDragging = false;
    canvas.style.cursor = 'crosshair';

    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDragging);

    setTimeout(() => {
        hasDragged = false;
    }, 10);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('zoom-in')?.addEventListener('click', () => zoomAtCenter(1.2,true));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoomAtCenter(0.8,true));
    document.getElementById('reset-view')?.addEventListener('click', resetView);
    document.getElementById('focus-canvas')?.addEventListener('click', () => canvas.focus());
});

canvas.addEventListener('mousedown', function (e) {
    const rect = canvas.getBoundingClientRect();
    lastMouseX = e.clientX - rect.left;
    lastMouseY = e.clientY - rect.top;
    isDragging = true;
    hasDragged = false;
    canvas.style.cursor = 'grabbing';

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDragging);
});

canvas.addEventListener('mouseup', stopDragging);

canvas.addEventListener('wheel', function (e) {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Графические координаты курсора
    const graphCoords = canvasToGraph(mouseX, mouseY);

    // Определяем направление масштабирования (можно инвертировать если нужно)
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale * zoomFactor;

    if (newScale >= MIN_ZOOM_SCALE && newScale <= MAX_ZOOM_SCALE) {
        // Коэффициент изменения масштаба
        const scaleChange = newScale / scale;

        // Корректируем смещение для сохранения точки под курсором
        offsetX = graphCoords.x - (graphCoords.x - offsetX) / scaleChange;
        offsetY = graphCoords.y - (graphCoords.y - offsetY) / scaleChange;

        // Применяем новый масштаб
        scale = newScale;

        scheduleRedraw();
    }
});

canvas.addEventListener('click', function (e) {
    if (hasDragged || isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const graphCoords = canvasToGraph(clickX, clickY);
    const actualX = graphCoords.x;
    const actualY = graphCoords.y;

    window.displayPoint = {
        x: actualX, y: actualY
    };

    scheduleRedraw();

    submitForm(actualX, actualY);
});

document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
    }

    if (e.key === 'f' || e.key === 'F') {
        canvas.focus();
    }

    if (e.key === 'Escape') {
        if (document.activeElement === canvas) {
            canvas.blur();
        }
    }

    const panAmount = 0.5 / scale;
    const isCanvasFocused = document.activeElement === canvas;

    if (!isCanvasFocused) {
        return;
    }

    switch (e.key) {
        case '+':
        case '=':
            zoomAtCenter(1.2);
            break;
        case '-':
        case '_':
            zoomAtCenter(0.8);
            break;
        case '0':
            resetView();
            break;
        case 'ArrowUp':
            offsetY += panAmount;
            scheduleRedraw();
            break;
        case 'ArrowDown':
            offsetY -= panAmount;
            scheduleRedraw();
            break;
        case 'ArrowLeft':
            offsetX -= panAmount;
            scheduleRedraw();
            break;
        case 'ArrowRight':
            offsetX += panAmount;
            scheduleRedraw();
            break;
    }

    e.preventDefault();
});