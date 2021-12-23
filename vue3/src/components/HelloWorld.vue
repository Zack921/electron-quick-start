<template>
  <div class="hello">
    <h1 id="title">{{ msg }}</h1>
    <button id="newPage" @click="handleClick">新建窗口</button>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  mounted() {
    window.api.receive("fromMain", (data) => {
      console.log(`Received ${data} from main process`);
    });
  },
  methods: {
    handleClick() {
      window.api.send("toMain", "new page");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
