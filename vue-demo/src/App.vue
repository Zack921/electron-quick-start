<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <!-- <HelloWorld msg="Electron+Vue App From Zack"/> -->
  <div>
    <FirstList v-if="false" />
    <ChatList
      ref="zList"
      class="zList"
      :data-sources="items"
      :data-component="itemComponent"
      v-on:toTop="onScrollToTop"
      v-on:updateNewNewsToShow="updateNewNewsToShow" />
    <div>{{ isLoading ? "isLoading..." : "" }}</div>
    <br /><br />
    <button @click="addNewNews">新增一组新消息</button>
    <button @click="gotoNewNews">有 {{ hasNew }} 条新消息, 定位</button>
    <br /><br />
    <!-- <ShowItem /> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import FirstList from "./components/List.vue";
import ShowItem from "./components/ShowItem.vue";
import ChatList from './components/ChatList';

let seed = 0;
let seed_new = 0;

export default {
  name: "App",
  components: {
    // HelloWorld,
    FirstList,
    // ShowItem
    ChatList,
  },
  data() {
    return {
      isLoading: false,
      items: [
        { dataKey: 10 },
        { dataKey: 9 },
        { dataKey: 8 },
        { dataKey: 7 },
        { dataKey: 6 },
        { dataKey: 5 },
        { dataKey: 4 },
        { dataKey: 3 },
        { dataKey: 2 },
        { dataKey: 1 },
      ],
      itemComponent: ShowItem,
      hasNew: 0,
    };
  },
  methods: {
    onScrollToTop() {
      console.log("at top");
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        const addList = [
          { dataKey: `F-${seed}` },
          { dataKey: `E-${seed}` },
          { dataKey: `D-${seed}` },
          { dataKey: `C-${seed}` },
          { dataKey: `B-${seed}` },
          { dataKey: `A-${seed}` },
        ];

        this.items = addList.concat(this.items);
        // console.log("this.items: ", this.items);
        seed++;
      }, 50);
    },

    onScrollToBottom() {
      console.log("at bottom");
    },

    addNewNews() {
      console.log("addNewNews: ");
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        const newList = [
          { dataKey: `[N]F-${seed_new}` },
          { dataKey: `[N]E-${seed_new}` },
          { dataKey: `[N]D-${seed_new}` },
          { dataKey: `[N]C-${seed_new}` },
          { dataKey: `[N]B-${seed_new}` },
          { dataKey: `[N]A-${seed_new}` },
        ];

        this.items = this.items.concat(newList);
        // console.log("this.items: ", this.items);

        seed_new++;
      }, 50);
    },
    updateNewNewsToShow(length) {
      this.hasNew = length;
      console.log(`还有 ${length} 条新消息需要展示`);
    },
    gotoNewNews() {
      this.$refs.zList.locateOnNewNews();
    }
  },
};
</script>

<style scoped>
.zList {
  height: 500px;
  border: 1px solid #000;
  margin-top: 100px;
}
</style>
