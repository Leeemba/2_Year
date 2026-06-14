<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="links">
        <a href="https://github.com/Leeemba" class="link">Contact</a>
      </div>

      <div class="copyright">
        &copy; {{ currentYear }} | Вариант: 3889167 | Баукин Максим Александрович
      </div>

      <div class="version" @click="handleVersionClick">
        Version 1.9.5 "Cog's passion"
      </div>
    </div>

    <!-- Модальное окно пасхалки -->
    <div v-if="showEasterEgg" class="easter-egg-modal" @click.self="closeEasterEgg">
      <div class="easter-egg-content">
        <button class="easter-egg-close" @click="closeEasterEgg">×</button>
        <div class="easter-egg-image">
          <img src="/easter-egg/image.jpg" alt="Easter Egg" />
          <div class="easter-egg-message">
            <p>Pov мой муд во время написания этой лабы</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

const currentYear = computed(() => new Date().getFullYear());

// Логика пасхалки
const showEasterEgg = ref(false);
const clickCount = ref(0);
let clickTimer: NodeJS.Timeout | null = null;

const handleVersionClick = () => {
  clickCount.value++;

  // Сбрасываем таймер при каждом клике
  if (clickTimer) {
    clearTimeout(clickTimer);
  }

  // Устанавливаем таймер на сброс счетчика (2 секунды)
  clickTimer = setTimeout(() => {
    clickCount.value = 0;
  }, 2000);

  // Проверяем, достигли ли 3 кликов
  if (clickCount.value >= 3) {
    clickCount.value = 0;
    showEasterEgg.value = true;

    // Запрещаем прокрутку страницы при открытом модальном окне
    document.body.style.overflow = 'hidden';

  }
};

const closeEasterEgg = () => {
  showEasterEgg.value = false;
  // Восстанавливаем прокрутку страницы
  document.body.style.overflow = '';
};


// Очищаем таймер при размонтировании компонента
onUnmounted(() => {
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
});
</script>

<style scoped>
.app-footer {
  background: #2c3e50;
  color: white;
  padding: 20px;
  margin-top: auto;
  position: relative;
}

.footer-content {
  display: flex;
  align-items: center;
  max-width: 1650px;
}

.copyright {
  text-align: center;
  margin-left: 550px;
}

.links {
  display: flex;
  gap: 20px;
  margin-left: 0;
}

.link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: white;
}

.version {
  margin-left: 370px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
  position: relative;
}

.version:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.version:active {
  transform: scale(0.95);
}

/* Анимация для обратной связи при клике */
@keyframes versionClick {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.version.clicked {
  animation: versionClick 0.3s ease;
}

/* Стили для модального окна пасхалки */
.easter-egg-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.easter-egg-content {
  background: linear-gradient(135deg, #2c3e50 0%, #1a2530 100%);
  border-radius: 16px;
  padding: 30px;
  max-width: 90%;
  max-height: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  /*animation: modalAppear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);*/
  overflow: hidden;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-5deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.easter-egg-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.easter-egg-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.easter-egg-image {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 20px;
}

.easter-egg-image img {
  width: 100%;
  max-width: 600px;
  height: auto;
  display: block;
  border-radius: 12px;
  transition: transform 0.5s ease;
}

.easter-egg-image:hover img {
  transform: scale(1.02);
}

.easter-egg-message {
  text-align: center;
  color: white;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  margin-top: 15px;
}

.easter-egg-message p {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffcc00;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.easter-egg-message small {
  font-size: 14px;
  opacity: 0.8;
}


@keyframes backgroundFloat {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-50px, -50px) rotate(360deg); }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .links {
    margin-left: 0;
    justify-content: center;
  }

  .copyright {
    margin-left: 0;
    order: 1;
  }

  .version {
    margin-left: 0;
    order: 2;
  }

  .easter-egg-content {
    padding: 20px;
    margin: 10px;
  }

  .easter-egg-message p {
    font-size: 20px;
  }
}

/* Адаптивность для маленьких экранов */
@media (max-width: 480px) {
  .easter-egg-image img {
    max-width: 100%;
  }

  .easter-egg-message {
    padding: 15px;
  }

  .easter-egg-message p {
    font-size: 18px;
  }
}

/* Темная тема адаптация */
.dark-theme .easter-egg-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-color: rgba(255, 255, 255, 0.05);
}

.dark-theme .easter-egg-message {
  background: rgba(0, 0, 0, 0.7);
}

/* === ПЛАНШЕТ (866-1157px) === */
@media (min-width: 866px) and (max-width: 1157px) {
  .footer-content {
    justify-content: space-between;
  }

  .copyright {
    margin-left: 0;
    text-align: center;
    flex: 1;
  }

  .version {
    margin-left: 0;
  }
}

/* === МОБИЛЬНЫЙ (до 865px) === */
@media (max-width: 865px) {
  .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .links {
    margin-left: 0;
    justify-content: center;
  }

  .copyright {
    margin-left: 0;
    order: 2;
  }

  .version {
    margin-left: 0;
    order: 1;
  }
}
</style>
