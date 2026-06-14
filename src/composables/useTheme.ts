import { ref, onMounted, watch } from 'vue';

export const useTheme = () => {
  const isDark = ref<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  watch(isDark, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-theme', newValue);
  });

  onMounted(() => {
    document.documentElement.classList.toggle('dark-theme', isDark.value);
  });

  return { isDark, toggleTheme };
};
