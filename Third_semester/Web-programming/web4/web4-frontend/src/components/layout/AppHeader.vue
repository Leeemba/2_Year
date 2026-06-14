<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <h1>Point Checker</h1>
      </div>

      <nav class="nav-menu">
        <router-link to="/main" class="nav-link" active-class="active">
          <span class="text">Points</span>
        </router-link>

<!--        <router-link to="/stats" class="nav-link" active-class="active">
&lt;!&ndash;          <span class="icon">📊</span>&ndash;&gt;
          <span class="text">Stats</span>
        </router-link>-->
      </nav>

      <div class="user-info">
        <span class="username">{{ username }}</span>
        <button @click="logout" class="logout-btn">
          <span class="text">Logout</span>
        </button>
        <Clock />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Clock from './Clock.vue';

const router = useRouter();
const authStore = useAuthStore();

const username = computed(() => authStore.user?.username || 'Guest');

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #219600 0%, #1976D2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1650px;
  margin: 0 auto;
  height: 60px;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  padding: 8px 16px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  border-radius: 4px;
  /*transition: all 0.3s ease;*/
}

/*
.nav-link:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-link.active {
  background: rgba(255,255,255,0.2);
  color: white;
}
*/

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.2);
}

.icon {
  font-size: 1.2em;
}

:deep(.server-clock) {
  position: relative;
  top: 0;
  right: 0;
  align-items:center;
  background: rgba(255, 255, 255, 0.2);
  color: white ;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.server-clock .time) {
  color: white;
}

:deep(.server-clock .countdown) {
  color: #ffeb3b;
}

/* === ПЛАНШЕТ (866-1157px) === */
@media (min-width: 866px) and (max-width: 1157px) {
  .header-content {
    padding: 0 10px;
  }

  .logo h1 {
    font-size: 1.3rem;
  }

  .nav-menu {
    gap: 10px;
  }

  .nav-link {
    padding: 6px 12px;
  }

  .text {
    display: inline-block;
  }
}

/* === МОБИЛЬНЫЙ (до 865px) === */
@media (max-width: 865px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }

  .logo {
    margin-bottom: 5px;
  }

  .logo h1 {
    font-size: 1.3rem;
  }

  .nav-menu {
    margin: 5px 0;
    width: 100%;
    justify-content: center;
  }

  .nav-link {
    padding: 8px 12px;
  }

  .user-info {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    margin-bottom: 5px;
  }

  .username {
    font-size: 14px;
  }

  .logout-btn {
    width: 100%;
    justify-content: center;
  }

  .text {
    display: inline-block;
  }

  /* На мобильных часах в хедере скрыты (остаются в углу) */
  :deep(.server-clock) {
    display: none;
  }
}
</style>
