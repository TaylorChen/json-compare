<template>
  <div id="app">
    <JsonDiff />
  </div>
</template>

<script>
import JsonDiff from './components/JsonDiff.vue';

export default {
  components: {
    JsonDiff,
  },
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
</style>
