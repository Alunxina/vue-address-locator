<template>
  <topHeader />
  <locatorForm />
</template>

<script>
import topHeader from './components/top-header.vue'
import locatorForm from './components/locator-form.vue'

export default {
  name: 'App',
  components: {
    topHeader,
    locatorForm,
  }
}
</script>

<style lang="scss">
@import 'bulma/css/bulma.css';
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600&family=Roboto:ital,wght@0,300;1,400&display=swap');

#app {
  font-family: Roboto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
