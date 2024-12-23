<template>
  <div id="ThreeDom" ref="threeRef">
    <span>地图信息</span>
  </div>
</template>

<script setup lang='ts'>
defineOptions({
  name: "LinThreeMap",
});
import { onMounted, ref } from 'vue';
import ThreeInit from '../../utils/threeInit';

const threeRef = ref();
onMounted(() => {
  const threeInit = new ThreeInit(threeRef.value);
})

</script>

<style scoped>
#ThreeDom {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  > span {
    position: absolute;
    left: 20px;
    top: 30px;
    color: #aaa;
  }
}
</style>