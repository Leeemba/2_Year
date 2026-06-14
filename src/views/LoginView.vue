<template>
  <div class="auth-view">
    <Clock />
    <div class="auth-container">
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue';
import Clock from '@/components/layout/Clock.vue';
</script>
<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
/*  align-items: center;*/
  min-height: 100vh;
  position: relative; /* Для позиционирования часов */
}

.auth-container {
  width: 100%;
  max-width: 450px;
}
</style>
