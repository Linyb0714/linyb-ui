<template>
  <lin-ThreeBanner ref="threeBannerRef" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const threeBannerRef = ref();
var geometry = new THREE.BufferGeometry();
var points = new Float32Array([
    5, 5, 5,
    5, 5, -5,
    5, -5, 5,
    5, -5, -5,
    -5, 5, -5,
    -5, 5, 5,
    -5, -5, -5,
    -5, -5, 5
]);
var index = [
    0, 2, 1,
    2, 3, 1,
    4, 6, 5,
    6, 7, 5,
    4, 5, 1,
    5, 0, 1,
    7, 6, 2,
    6, 3, 2,
    5, 7, 0,
    7, 2, 0,
    1, 3, 4,
    3, 6, 4,
];
geometry.attributes.position = new THREE.BufferAttribute(points, 3);
geometry.setIndex(index);
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff000
})
// 根据几何体和材质创建一个物体
const cube = new THREE.Mesh(geometry, cubeMaterial)
// console.log('获取对象', cube);

onMounted(() => {
  /** 引入对象 */
  var loader = new OBJLoader();
  loader.load('/models/Interior.obj', (object: any) => {
    threeBannerRef.value.init(object);
  })
  // threeBannerRef.value.init(cube)
})
</script>

<style scoped></style>
