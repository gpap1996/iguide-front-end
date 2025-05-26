<template>
  <div class="particles-wrapper">
    <vue-particles
      @particles-loaded="particlesLoaded"
      id="tsparticles"
      :options="particlesOptions"
    />
  </div>
</template>

<script setup>
const particlesOptions = {
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab',
      },
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.5,
        },
      },
    },
  },
  particles: {
    color: {
      value: ['#5DAE8B', '#8BC4B0', '#B8D9CC'],
    },
    links: {
      color: '#5DAE8B',
      distance: 150,
      enable: true,
      opacity: 0.3,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce',
      },
      random: true,
      speed: { min: 0.5, max: 2 },
      straight: false,
      path: {
        enable: true,
        delay: {
          value: 0.1,
        },
        options: {
          size: 5,
          draw: false,
          increment: 0.001,
        },
      },
    },
    number: {
      density: {
        enable: true,
        area: 1200,
      },
      value: 60,
    },
    opacity: {
      value: { min: 0.3, max: 0.8 },
    },
    shape: {
      type: ['circle', 'triangle'],
    },
    size: {
      value: { min: 1, max: 3 },
      animation: {
        enable: true,
        speed: 2,
        minimumValue: 0.1,
        sync: false,
      },
    },
  },
  detectRetina: true,
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
}

const particlesLoaded = (container) => {
  console.log('Particles container loaded', container)
}
</script>

<style lang="scss" scoped>
.particles-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 50vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}
</style>
