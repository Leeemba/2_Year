// stores/validation.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ValidationError {
  type: 'x' | 'y' | 'both' | null;
  message: string;
  x?: number;
  y?: number;
  r?: number;
}

export const useValidationStore = defineStore('validation', () => {
  const error = ref<ValidationError | null>(null);
  const isShowing = ref(false);

  const setError = (newError: ValidationError) => {
    error.value = newError;
    isShowing.value = true;
  };

  const clearError = () => {
    error.value = null;
    isShowing.value = false;
  };

  const hideError = () => {
    isShowing.value = false;
    // Через 3 секунды полностью очищаем ошибку
    setTimeout(() => {
      if (!isShowing.value) {
        error.value = null;
      }
    }, 3000);
  };

  return {
    error,
    isShowing,
    setError,
    clearError,
    hideError
  };
});
