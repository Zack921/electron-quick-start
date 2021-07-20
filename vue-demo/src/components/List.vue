<template>
  <div>
    <div :class="{
        'wrap': true,
      }" ref="wrap" @scroll="handleScroll()">
      <div 
        :id="item" 
        :class="{'item': true, 'new-item': firstNewId ===item}" 
        v-for="item in list" 
        :key="item"
      >{{ item }}</div>
    </div>
    <br />
    <div>
      <button @click="addNewNews">新增一组新消息</button>
      <button @click="gotoNewNews">有 {{hasNew}} 条新消息, 定位</button>
    </div>
  </div>
</template>

<script>
import _ from "lodash";

let wrap;
let seed = 0;

export default {
  name: "list",
  data() {
    return {
      list: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      init: false,
      // added: false,
      hasNew: 0,
      firstNewId: '',
    };
  },
  mounted() {
    window.wrap = this.$refs.wrap;
    wrap = this.$refs.wrap;
    console.log("wrap.scrollTop: ", wrap.scrollTop);
    this.$nextTick(() => {
      wrap.scrollTop = 1000;
      console.log('wrap.scrollTop: ', wrap.scrollTop);
      this.init = true;
    });
  },
  methods: {
    handleScroll: _.debounce(function () {
      console.log('this.init: ', this.init);
      if(wrap.scrollTop < 100 && this.init) {
        console.log('added');
        const addList = [`F-${seed}`,`E-${seed}`,`D-${seed}`,`C-${seed}`,`B-${seed}`,`A-${seed}`];
        this.list = addList.concat(this.list);
        console.log('this.list: ', this.list);
        // this.added = true;
        seed++;
      }

      if(wrap.scrollTop + wrap.clientHeight === wrap.scrollHeight) {
        this.firstNewId = '';
        this.hasNew = 0;
      }
    }, 10),
    addNewNews() {
      console.log('addNewNews: ');
      const newList = [`[N]F-${seed}`,`[N]E-${seed}`,`[N]D-${seed}`,`[N]C-${seed}`,`[N]B-${seed}`,`[N]A-${seed}`];
      this.list = this.list.concat(newList);
      console.log('this.list: ', this.list);
      // 如果当前滚动条在最底部，需要定位到最新一条消息
      if(wrap.scrollTop + wrap.clientHeight === wrap.scrollHeight){
        console.log('滚到最底部了～');
        console.log('wrap.scrollTop: ', wrap.scrollTop);
        this.$nextTick(()=>{
          wrap.scrollTo({
            top: wrap.scrollTop + 1000,
            behavior: "smooth"
          });
        });
      } else { // 如果当前滚动条在最底部，手动定位到最新消息列表的第一条
        this.hasNew += newList.length;
        this.firstNewId = newList[0];
      }
      seed++;
    },
    gotoNewNews() {
      console.log('this.firstNewId: ', this.firstNewId);
      if(!this.firstNewId) return;
      document.getElementById(this.firstNewId).scrollIntoView(true);
    },
  },
};
</script>

<style>
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}

.wrap {
  overflow: scroll;
  height: 500px;
  border: 1px solid #000;
  /* overflow-y: scroll; */
  /* scroll-behavior: smooth; */
}

.item {
  height: 100px;
  border: 1px solid #ccc;
}

.new-item {
  border-top: 2px solid red;
}

.hide {
  visibility: hidden;
}

button + button {
  margin: 0 20px;
}
</style>