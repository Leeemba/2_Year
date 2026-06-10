import Validate from './validate.js';

// Константы для графика (из SVG)
const GRAPH_CENTER_X = 300;
const GRAPH_CENTER_Y = 300;
const GRAPH_SCALE = 200; // пикселей на единицу R

// Функция для отрисовки точки на графике
function drawPoint(x, y, r, hit, isCurrent = false, id = null) {
    const svg = document.querySelector('.graphSVG');
    if (!svg) return;

    // Проверяем, что R не равен 0 (чтобы избежать деления на 0)
    if (r === 0 || isNaN(r)) {
        console.error('Некорректное значение R:', r);
        return;
    }

    // Вычисляем координаты точки на SVG
    const cx = GRAPH_CENTER_X + x * (GRAPH_SCALE / r);
    const cy = GRAPH_CENTER_Y - y * (GRAPH_SCALE / r);

    // Проверяем, находится ли точка в пределах SVG
    if (cx < 0 || cx > 650 || cy < 0 || cy > 650) {
        console.warn('Точка выходит за пределы графика:', {x, y, r, cx, cy});
        return;
    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', isCurrent ? '5' : '3');
    circle.setAttribute('fill', hit ? '#00FF00' : '#FF0000'); // Зеленый для попаданий, красный для промахов
    circle.setAttribute('stroke', isCurrent ? '#000000' : (hit ? '#006400' : '#8B0000'));
    circle.setAttribute('stroke-width', isCurrent ? '1.5' : '1');
    circle.setAttribute('fill-opacity', isCurrent ? '0.9' : '0.7');
    circle.setAttribute('data-x', String(x));
    circle.setAttribute('data-y', String(y));
    circle.setAttribute('data-r', String(r));
    circle.setAttribute('data-hit', String(hit));

    if (id) {
        circle.setAttribute('id', id);
    }

    // Добавляем класс для идентификации точек
    circle.classList.add('graph-point');
    if (isCurrent) {
        circle.classList.add('current-point');
    }

    // Добавляем всплывающую подсказку
    circle.setAttribute('title', `X=${x}, Y=${y}, R=${r}, ${hit ? 'Попали!' : 'Промах'}`);

    svg.appendChild(circle);
    return circle;
}

// Функция для удаления всех точек с графика
function clearGraphPoints() {
    const points = document.querySelectorAll('.graph-point');
    points.forEach(point => {
        if (!point.classList.contains('current-point')) {
            point.remove();
        }
    });
}

// Функция для отрисовки всех точек из localStorage
function drawAllPointsFromStorage(currentR = null) {
    // Очищаем только старые точки, но не текущую
    const oldPoints = document.querySelectorAll('.graph-point:not(.current-point)');
    oldPoints.forEach(point => point.remove());

    const savedSession = localStorage.getItem('session');
    if (!savedSession) return;

    try {
        const results = JSON.parse(savedSession);
        if (!Array.isArray(results)) return;

        let pointsDrawn = 0;
        let pointsSkipped = 0;

        results.forEach((res, index) => {
            // Проверяем, что данные точки валидны
            const x = parseFloat(res.x);
            const y = parseFloat(res.y);
            const r = parseFloat(res.r);
            const hit = (res.result === true || res.result === 'true' || res.result === true);

            // Пропускаем точки с некорректными данными
            if (isNaN(x) || isNaN(y) || isNaN(r) || r === 0) {
                pointsSkipped++;
                return;
            }

            // Если задан currentR, отрисовываем только точки с этим R
            if (currentR !== null && Math.abs(r - parseFloat(currentR)) > 0.001) {
                return;
            }

            drawPoint(x, y, r, hit, false, `point_${index}`);
            pointsDrawn++;
        });

        // Обновляем информацию в логе графика
        const graphLog = document.getElementById('graph-log');
        if (graphLog) {
            if (currentR !== null) {
                graphLog.textContent = `Отображено точек для R=${currentR}: ${pointsDrawn}`;
            } else {
                graphLog.textContent = `Отображено всех точек: ${pointsDrawn}`;
            }
            if (pointsSkipped > 0) {
                graphLog.textContent += ` (пропущено некорректных: ${pointsSkipped})`;
            }
        }

    } catch (e) {
        console.error('Ошибка при отрисовке точек:', e);
        const graphLog = document.getElementById('graph-log');
        if (graphLog) {
            graphLog.textContent = 'Ошибка загрузки точек';
        }
    }
}

// Функция для обновления текущей точки
function updateCurrentPoint(x, y, r, hit) {
    // Удаляем предыдущую текущую точку
    const oldCurrentPoint = document.querySelector('.current-point');
    if (oldCurrentPoint) {
        oldCurrentPoint.remove();
    }

    // Скрываем стандартный dot
    const dot = document.getElementById('dot');
    if (dot) {
        dot.setAttribute('visibility', 'hidden');
    }

    // Рисуем новую текущую точку
    if (!isNaN(x) && !isNaN(y) && !isNaN(r) && r !== 0) {
        drawPoint(parseFloat(x), parseFloat(y), parseFloat(r), hit, true, 'current-point');
    }
}

// Обновленная функция загрузки старых результатов
function loadOldResults() {
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
        try {
            const results = JSON.parse(savedSession);
            if (Array.isArray(results)) {
                const tbody = document.querySelector('#result-table tbody');
                results.forEach(res => {
                    const row = document.createElement('tr');
                    const isHit = document.createElement('td');
                    const tdX = document.createElement('td');
                    const tdY = document.createElement('td');
                    const tdR = document.createElement('td');
                    const time = document.createElement('td');
                    const worktime = document.createElement('td');

                    const hit = (res.result === true || res.result === 'true' || res.result === true);
                    isHit.innerText = hit ? 'Попали!' : 'Неудача!';
                    tdX.innerText = res.x;
                    tdY.innerText = res.y;
                    tdR.innerText = res.r;
                    time.innerText = res.time;
                    worktime.innerText = res.workTime;

                    row.append(isHit, tdX, tdY, tdR, time, worktime);
                    tbody.appendChild(row);
                });

                // Отрисовываем все точки после загрузки таблицы
                drawAllPointsFromStorage();
            }
        } catch (e) {
            console.error('Ошибка загрузки старых результатов:', e);
        }
    }
}

// Добавляем вызов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadOldResults();

    // Восстанавливаем выбранный R из localStorage
    const savedR = localStorage.getItem('currentR');
    if (savedR) {
        r = savedR;
        // Подсвечиваем выбранную кнопку R
        document.querySelectorAll('.r').forEach(button => {
            if (button.getAttribute('value') === savedR) {
                button.classList.add('selected');
            }
        });
        drawAllPointsFromStorage(savedR);
    }
});

const validator = new Validate();

let x;
let r;

const table = document.getElementById("result-table");
const checkboxes = document.querySelectorAll('input[type="checkbox"][name="x"]');

checkboxes.forEach(cb => {
    cb.addEventListener('change', function (ev) {
        if (cb.checked) {
            checkboxes.forEach(other => {if (other !== cb) other.disabled = true;x = parseFloat(ev.target.value);});} else {checkboxes.forEach(other => other.disabled = false);x = NaN;
        }
    });
});

const buttonsR = document.querySelectorAll('.r');
buttonsR.forEach(button => {
    button.addEventListener('click', function () {
        r = this.getAttribute('value');

        // Убираем выделение со всех кнопок R
        buttonsR.forEach(btn => btn.classList.remove('selected'));
        // Добавляем выделение текущей кнопке
        this.classList.add('selected');

        // Сохраняем выбранный R в localStorage
        localStorage.setItem('currentR', r);

        // Перерисовываем точки только для текущего R
        drawAllPointsFromStorage(r);
    });
});

document.getElementById('send-button').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById("input-log").innerText = "Отправка...";

    let y = document.getElementById('y-input').value.trim();
    y = y.replace(',', '.');

    const check = validator.check(x, y, r);

    if (check.allOk) {
        console.log('Отправка данных:', { x, y, r });

        const params = new URLSearchParams({
            x: x.toString(),
            y: y.toString(),
            r: r.toString()
        });

        fetch('http://localhost:8080/fcgi-bin/server.jar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ошибка ${response.status}`);
                return response.json();
            })
            .then(res => {
                let allResults = [];
                const savedSession = localStorage.getItem('session');
                if (savedSession) {
                    try {
                        allResults = JSON.parse(savedSession);
                        if (!Array.isArray(allResults)) allResults = [];
                    } catch (e) {
                        allResults = [];
                    }
                }
                allResults.push(res);

                localStorage.setItem('session', JSON.stringify(allResults));

                if (res.error) {
                    const map = {
                        fill: 'Заполните все поля',
                        method: 'Только POST запросы'
                    };
                    document.getElementById('input-log').innerText = map[res.error] ?? res.error;
                    return;
                }

                document.getElementById('input-log').innerText = '';

                const tbody = document.querySelector('#result-table tbody');
                const row = document.createElement('tr');

                const isHit = document.createElement('td');
                const tdX = document.createElement('td');
                const tdY = document.createElement('td');
                const tdR = document.createElement('td');
                const time = document.createElement('td');
                const worktime = document.createElement('td');

                const hit = (res.result === true || res.result === 'true' || res.result === true);
                isHit.innerText = hit ? 'Попали!' : 'Неудача!';
                isHit.style.color = hit ? 'green' : 'red';
                tdX.innerText = res.x;
                tdY.innerText = res.y;
                tdR.innerText = res.r;
                time.innerText = res.time;
                worktime.innerText = res.workTime;

                row.append(isHit, tdX, tdY, tdR, time, worktime);
                tbody.appendChild(row);

                // Обновляем текущую точку на графике
                updateCurrentPoint(res.x, res.y, res.r, hit);

                // Перерисовываем все точки для текущего R
                drawAllPointsFromStorage(r);

                const resultBlock = document.querySelector('.result-block');
                resultBlock.scrollTop = resultBlock.scrollHeight;
            })
            .catch(err => {
                console.error('Ошибка:', err);
                document.getElementById("input-log").innerText = `Ошибка: ${err.message}`;
            });

    } else {
        document.getElementById("input-log").innerText = check.log;
    }
});

// Обновленная функция очистки
function clear() {
    // Очищаем таблицу
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Очищаем localStorage
    localStorage.removeItem('session');
    localStorage.removeItem('currentR');

    // Очищаем график
    clearGraphPoints();

    // Сбрасываем выделение кнопок R
    buttonsR.forEach(btn => btn.classList.remove('selected'));

    // Очищаем логи
    document.getElementById("input-log").innerText = '';
    const graphLog = document.getElementById('graph-log');
    if (graphLog) {
        graphLog.textContent = '';
    }

    // Сбрасываем переменные
    x = NaN;
    r = undefined;

    // Сбрасываем чекбоксы
    checkboxes.forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
    });

    // Сбрасываем поле Y
    document.getElementById('y-input').value = '';
}

document.getElementById("clear").addEventListener("click", clear);

/*
// Добавляем кнопку для переключения между отображением всех точек и точек для текущего R
document.addEventListener('DOMContentLoaded', function() {
    // Создаем кнопку переключения режима отображения
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-points';
    toggleButton.textContent = 'Показать все точки';
    toggleButton.style.cssText = 'margin: 10px; padding: 5px 10px; cursor: pointer;';

    // Вставляем кнопку после кнопок R
    const rFieldset = document.getElementById('r-val');
    if (rFieldset) {
        rFieldset.parentNode.insertBefore(toggleButton, rFieldset.nextSibling);
    }

    let showAllPoints = false;

    toggleButton.addEventListener('click', function() {
        showAllPoints = !showAllPoints;
        if (showAllPoints) {
            toggleButton.textContent = 'Показать точки для текущего R';
            drawAllPointsFromStorage(); // Все точки
        } else {
            toggleButton.textContent = 'Показать все точки';
            drawAllPointsFromStorage(r); // Только для текущего R
        }
    });
});*/
