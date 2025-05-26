<template>
  <div class="logo-simple">
    <div class="logo-wrapper">
      <div class="logo-i">i</div>
      <div class="logo-dot"></div>
      <div class="logo-guide">GUIDE</div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for now
</script>

<style lang="scss" scoped>
.logo-simple {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.logo-i {
  font-size: 24px;
  font-weight: 900;
  color: rgb(var(--v-theme-oposite));
}

.logo-dot {
  width: 4px;
  height: 4px;
  background: rgb(var(--v-theme-oposite));
  border-radius: 50%;
}

.logo-guide {
  font-size: 24px;
  font-weight: 900;
  color: rgb(var(--v-theme-oposite));
}
</style>
