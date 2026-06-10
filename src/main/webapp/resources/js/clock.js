"use strict";

const SYNC_INTERVAL_SECONDS = 7;
const COUNTDOWN_UPDATE_INTERVAL_MS = 1000;

let countdown = SYNC_INTERVAL_SECONDS;
let displayedTime = null;
let serverTimeOffset = 0;
let intervalId = null;
let initialized = false;
let lastSyncTime = null;
let syncInProgress = false;

async function fetchServerTime() {
    if (syncInProgress) return false;

    syncInProgress = true;
    try {
        const response = await fetch('server-time.xhtml');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const serverTimeText = await response.text();
        const serverTimeMatch = serverTimeText.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        if (!serverTimeMatch) throw new Error('Invalid time format');

        const serverTime = new Date(serverTimeMatch[0].replace('T', ' '));
        const clientTime = new Date();

        serverTimeOffset = serverTime.getTime() - clientTime.getTime();
        displayedTime = new Date(clientTime.getTime() + serverTimeOffset);
        lastSyncTime = Date.now();

        return true;
    } catch (error) {
        console.debug('Time sync failed:', error.message);
        serverTimeOffset = 0;
        displayedTime = new Date();
        lastSyncTime = Date.now();
        return false;
    } finally {
        syncInProgress = false;
    }
}

function formatTimeString(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function updateClockDisplay() {
    const timeElement = document.getElementById('current-time');
    if (!timeElement) return;

    let timeString;
    if (displayedTime) {
        timeString = formatTimeString(displayedTime);
    } else {
        timeString = formatTimeString(new Date());
    }

    const formattedCountdown = String(countdown).padStart(2, '0');
    timeElement.textContent = timeString + " (" + formattedCountdown + ")";
}

function updateCountdown() {
    // Уменьшаем счетчик
    countdown -= 1;

    // Обновляем отображение
    updateClockDisplay();

    // Если счетчик достиг 0 (после показа 01), запускаем синхронизацию
    if (countdown === 0) {
        // Останавливаем текущий интервал
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }

        // Выполняем синхронизацию
        fetchServerTime().then(() => {
            // После синхронизации сбрасываем счетчик
            countdown = SYNC_INTERVAL_SECONDS;

            // Обновляем отображение с новым временем и счетчиком
            updateClockDisplay();

            // Перезапускаем интервал
            if (initialized) {
                intervalId = setInterval(updateCountdown, COUNTDOWN_UPDATE_INTERVAL_MS);
            }
        });
    }
}

function initializeClock() {
    if (initialized && intervalId) {
        clearInterval(intervalId);
    }

    countdown = SYNC_INTERVAL_SECONDS;

    // Начальная синхронизация
    fetchServerTime().then(() => {
        updateClockDisplay();

        intervalId = setInterval(updateCountdown, COUNTDOWN_UPDATE_INTERVAL_MS);
        initialized = true;
    });
}

function cleanupClock() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    initialized = false;
}

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeClock();
        window.addEventListener('beforeunload', cleanupClock);
    });
} else {
    initializeClock();
    window.addEventListener('beforeunload', cleanupClock);
}