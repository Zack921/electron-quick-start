<template>
  <div class="wrap" ref="wrap" @scroll="handleScroll()">
    <div class="item" v-for="item in list" :key="item">{{item}}</div>
  </div>
</template>

<script>
import _ from 'lodash';

let wrap;
// let seed = 0;

export default {
  name: 'list',
  data() {
    return {
      list: [10, 9, 8,7,6,5,4,3,2,1,10, 9, 8,7,6,5,4,3,2,1],
      init: false,
      added: false,
    };
  },
  mounted() {
    window.wrap = this.$refs.wrap;
    wrap = this.$refs.wrap;
    console.log('wrap.scrollTop: ', wrap.scrollTop);
    // this.$nextTick(() => {
    //   wrap.scrollTop = 1000;
    //   console.log('wrap.scrollTop: ', wrap.scrollTop);
    //   this.init = true;
    // });
  },
  methods: {
    handleScroll: _.debounce(function() {
      // if(wrap.scrollTop < 100 && this.init && !this.added) {
      //   console.log('added');
      //   const addList = [`F-${seed}`,`E-${seed}`,`D-${seed}`,`C-${seed}`,`B-${seed}`,`A-${seed}`];
      //   this.list = addList.concat(this.list);
      //   console.log('this.list: ', this.list);
      //   console.log('wrap.scrollTop: ', wrap.scrollTop);
      //   // wrap.scrollTop = 4 * 100;
      //   console.log('wrap.scrollTop: ', wrap.scrollTop);
      //   // this.added = true;
      //   seed++;
      // }

      if(wrap.scrollTop > 300) {
        this.list = this.list.splice(0, 10);
      }
    }, 10),
  }
}
</script>

<style>
.wrap {
  overflow: scroll;
  height: 500px;
  border: 1px solid #000;
  scroll-behavior: smooth;
}

.item {
  height: 100px;
  border: 1px solid #ccc;
}
</style>