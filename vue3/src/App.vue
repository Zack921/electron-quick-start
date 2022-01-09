<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import { getLCP, getFID, getCLS } from "web-vitals";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  created() {
    console.log("created", Date.now());
    getCLS(console.log);
    getFID(console.log);
    getLCP(console.log);
  },
  mounted() {
    console.log("mounted", Date.now());
    getCLS(console.log);
    getFID(console.log);
    getLCP(console.log);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
