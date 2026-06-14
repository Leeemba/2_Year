<template>
  <div class="register-form">
    <h2>Register</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          :disabled="isLoading"
          minlength="3"
          maxlength="20"
        />
        <small>3-20 characters</small>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          :disabled="isLoading"
          minlength="6"
        />
        <small>Minimum 6 characters</small>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          :disabled="isLoading"
        />
        <small v-if="!passwordsMatch" class="error">
          Passwords do not match
        </small>
      </div>

      <button type="submit" :disabled="isLoading || !passwordsMatch">
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>

      <p>
        Already have an account?
        <router-link to="/login" class="switch-link">
          Login
        </router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

const authStore = useAuthStore();
const router = useRouter();

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const handleSubmit = async () => {
  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (username.value.length < 3 || username.value.length > 20) {
    error.value = 'Username must be 3-20 characters';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await authStore.register(username.value, password.value);
    router.push('/main');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed';
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

small.error {
  color: #f44336;
}

button {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover:not(:disabled) {
  background: #1976D2;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  margin: 10px 0;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

p {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

a {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}
</style>
