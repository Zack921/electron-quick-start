<template>
  <div class="wrap-item">{{ itemData.dataKey }}</div>
</template>

<script>
export default {
  props: {
    itemData: Object,
  },
  mounted() {
    // console.log('data', this.itemData);
  },
}
</script>

<style scoped>
.wrap-item {
  height: 100px;
  border: 1px solid #ccc;
}
</style>