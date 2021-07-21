<template>
  <div>
    <div
      :class="{
        wrap: true,
      }"
      ref="wrap"
      @scroll="handleScroll()"
    >
      <div
        :id="item.id"
        :class="{ item: true, 'new-item': firstNewId === item.id }"
        v-for="item in renderList"
        :key="item.id"
      >
        {{ item }}
      </div>
    </div>
    <br />
    <div>
      <button @click="addNewNews">新增一组新消息</button>
      <button @click="gotoNewNews">有 {{ hasNew }} 条新消息, 定位</button>
      <br /><br />
      <div>startId: {{ startId }}, startIdx: {{ startIdx }}</div>
      <div>endId: {{ endId }}, endIdx: {{ endIdx }}</div>
    </div>
  </div>
</template>

<script>
// import _ from "lodash";

let wrap;
let seed = 0;
let seed_new = 0;
// window.console.log = ()=>{};

export default {
  name: "list",
  data() {
    return {
      list: [
        { id: 10 },
        { id: 9 },
        { id: 8 },
        { id: 7 },
        { id: 6 },
        { id: 5 },
        { id: 4 },
        { id: 3 },
        { id: 2 },
        { id: 1 },
      ],
      init: false,
      // added: false,
      hasNew: 0,
      firstNewId: "",
      startId: 10,
      endId: 1,
      maxHeight: 0,
      deleteIds: [], // 存一下删减的节点列表最后一个节点，用于还原
      deleteIdsFromHead: [], // 存一下从头部删减的节点列表最后一个节点，用于还原
    };
  },
  computed: {
    startIdx: function () {
      return this.list.findIndex((item) => item.id === this.startId);
    },
    endIdx: function () {
      console.log("this.endId: ", this.endId);
      return this.list.findIndex((item) => item.id === this.endId);
    },
    renderList: function () {
      console.log("startIdx: ", this.startIdx);
      console.log("endIdx: ", this.endIdx);
      return this.list.slice(this.startIdx, this.endIdx + 1);
    },
  },
  mounted() {
    window.wrap = this.$refs.wrap;
    wrap = this.$refs.wrap;
    // console.log("wrap.scrollTop: ", wrap.scrollTop);
    // console.log('wrap.scrollHeight: ', wrap.scrollHeight);
    this.$nextTick(() => {
      wrap.scrollTop = 1000;
      console.log("wrap.scrollTop: ", wrap.scrollTop);
      this.maxHeight = wrap.clientHeight * 3;
      console.log("this.maxHeight: ", this.maxHeight);
      this.init = true;
    });
    console.log("this.renderList: ", this.renderList);
  },
  methods: {
    handleScroll() {
      console.log('handleScroll: ', wrap.scrollTop);
      if (wrap.scrollTop < 100 && this.init) {
        console.log("added");
        const addList = [
          { id: `F-${seed}` },
          { id: `E-${seed}` },
          { id: `D-${seed}` },
          { id: `C-${seed}` },
          { id: `B-${seed}` },
          { id: `A-${seed}` },
        ];
        this.list = addList.concat(this.list);
        console.log("this.list: ", this.list);
        // this.added = true;
        this.startId = addList[0].id;
        seed++;

        if (this.deleteIdsFromHead.length) {
          // 还原删除的节点
          const deleteId = this.deleteIdsFromHead.pop();
          console.log("deleteId: ", deleteId);
          this.startId = deleteId;
        }

        console.log("wrap.scrollHeight: ", wrap.scrollHeight);
        console.log("this.maxHeight: ", this.maxHeight);
        if (wrap.scrollHeight > this.maxHeight) {
          console.warn("滚动条在顶部, 从列表尾部裁减～");
          const delHtight = wrap.scrollHeight - this.maxHeight; // 需要裁减掉的高度
          // 从尾部开始遍历，找到开始裁减的节点
          let endId, endItem;
          for (let i = this.endIdx; i > this.startIdx; i--) {
            endId = this.list[i].id;
            console.log("endId: ", endId);
            endItem = document.getElementById(endId);
            console.log("endItem: ", endItem);
            if (wrap.scrollHeight - endItem.offsetTop > delHtight) {
              this.deleteIds.push(this.endId);
              this.endId = endId;
              console.log("this.deleteIds.: ", this.deleteIds);
              break;
            }
          }
        }
      }

      if (wrap.scrollTop + wrap.clientHeight === wrap.scrollHeight) {
        this.firstNewId = "";
        this.hasNew = 0;
      }

      if (wrap.scrollHeight - (wrap.scrollTop + wrap.clientHeight) < 100) {
        console.warn("滚动条接近底部拉～");
        if (this.deleteIds.length) {
          // 还原删除的节点
          const deleteId = this.deleteIds.pop();
          console.log("deleteId: ", deleteId);
          this.endId = deleteId;
        }

        if (wrap.scrollHeight > this.maxHeight) {
          console.warn("滚动条接近底部, 从列表头部裁减～");
          const delHeight = wrap.scrollHeight - this.maxHeight; // 需要裁减掉的高度
          // 从头部开始遍历，找到开始裁减的节点
          let startId, startItem;
          for (let i = this.startIdx; i < this.endIdx; i++) {
            startId = this.list[i].id;
            startItem = document.getElementById(startId);
            if (startItem.offsetTop > delHeight) {
              console.log("startId: ", startId);
              console.log("startItem: ", startItem);
              this.deleteIdsFromHead.push(this.startId);
              this.startId = startId;
              console.log("this.deleteIdsFromHead: ", this.deleteIdsFromHead);
              break;
            }
          }
        }
      }
    },
    addNewNews() {
      console.log("addNewNews: ");
      const newList = [
        { id: `[N]F-${seed_new}` },
        { id: `[N]E-${seed_new}` },
        { id: `[N]D-${seed_new}` },
        { id: `[N]C-${seed_new}` },
        { id: `[N]B-${seed_new}` },
        { id: `[N]A-${seed_new}` },
      ];
      this.list = this.list.concat(newList);
      console.log("this.list: ", this.list);
      this.endId = newList[newList.length - 1].id;
      this.deleteIds = []; // 清空还原列表，避免重置混乱
      // 如果当前滚动条在最底部，需要定位到最新一条消息
      if (wrap.scrollTop + wrap.clientHeight === wrap.scrollHeight) {
        console.log("滚到最底部了～");
        console.log("wrap.scrollTop: ", wrap.scrollTop);
        this.$nextTick(() => {
          wrap.scrollTo({
            top: wrap.scrollTop + 1000,
            behavior: "smooth",
          });
        });
      } else {
        // 如果当前滚动条在最底部，手动定位到最新消息列表的第一条
        this.hasNew += newList.length;
        if (!this.firstNewId) this.firstNewId = newList[0].id;
      }
      seed_new++;
    },
    gotoNewNews() {
      console.log("this.firstNewId: ", this.firstNewId);
      if (!this.firstNewId) return;
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
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}

.wrap {
  overflow: scroll;
  height: 500px;
  border: 1px solid #000;
  /* padding-top: 1000px; */
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