<template>
  <div class="logo">
    <div class="logo-wrapper text-white">
      <div class="logo-i text-white">i</div>
      <div class="logo-dot text-white"></div>
      <div class="logo-guide text-white">
        <span class="guide-letter text-white" v-for="(letter, index) in 'GUIDE'" :key="index">
          {{ letter }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for now
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-i {
  font-size: 72px;
  font-weight: 900;
  position: relative;
  transform-origin: bottom;
  animation: stretch 2s ease-in-out infinite;
}

.logo-dot {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: relative;
  animation: blink 2s ease-in-out infinite;
}

.logo-guide {
  display: flex;
  position: relative;
}

.guide-letter {
  font-size: 72px;
  font-weight: 900;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.4s ease forwards;
}

.guide-letter:nth-child(1) {
  animation-delay: 0.1s;
}
.guide-letter:nth-child(2) {
  animation-delay: 0.2s;
}
.guide-letter:nth-child(3) {
  animation-delay: 0.3s;
}
.guide-letter:nth-child(4) {
  animation-delay: 0.4s;
}
.guide-letter:nth-child(5) {
  animation-delay: 0.5s;
}

@keyframes stretch {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.1);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive design for smaller screens
@media (max-width: 900px) {
  .logo-i,
  .guide-letter {
    font-size: 48px;
  }

  .logo-dot {
    width: 8px;
    height: 8px;
  }

  .logo-wrapper {
    gap: 6px;
  }
}

@media (max-width: 600px) {
  .logo-i,
  .guide-letter {
    font-size: 36px;
  }

  .logo-dot {
    width: 6px;
    height: 6px;
  }

  .logo-wrapper {
    gap: 4px;
  }
}

@media (max-width: 400px) {
  .logo-i,
  .guide-letter {
    font-size: 28px;
  }

  .logo-dot {
    width: 5px;
    height: 5px;
  }

  .logo-wrapper {
    gap: 3px;
  }

  .guide-letter {
    transform: translateY(15px);
  }

  @keyframes slideUp {
    0% {
      opacity: 0;
      transform: translateY(15px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
