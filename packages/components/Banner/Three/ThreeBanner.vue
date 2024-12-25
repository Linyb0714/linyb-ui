<template>
  <div id="ThreeBanner" ref="threeBannerRef">
    <!-- <canvas id="three">当前无模型素材</canvas> -->
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PointsCloudToHole from './utils/PointsCloudToHole.js'
import { ref } from 'vue';
defineOptions({
  name: "LinThreeBanner",
});

// 加载场景和摄像机
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// 光源-环境光
const ambientLight = new THREE.AmbientLight(0xdddddd, 2.7);
// 光源-平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 12.75);
directionalLight.position.set(1500, -1200, 0);
scene.add(ambientLight, directionalLight);
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
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
geometry.attributes.position = new THREE.BufferAttribute(points, 12);
geometry.setIndex(index);
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00
})
const cube = new THREE.Mesh(geometry, cubeMaterial)
// scene.add( cube );

camera.position.z = 12;

// function animate() {
// 	requestAnimationFrame( animate );

// 	cube.rotation.x += 0.01;
// 	cube.rotation.y += 0.01;

// 	renderer.render( scene, camera );
// }

// animate();

const threeBannerRef = ref();
const init = ((object: any) => {
  // new PointsCloudToHole({
  //   object: object,
  //   endCallback() {
  //     // scene.add(cube);
  //   }
  // });
  console.log('获取对象', object);
  object.rotation.x += 0.2;
  object.rotation.y -= 0.07;
  scene.add(object);
  renderer.render( scene, camera );
})

defineExpose({ init })
</script>

<style scoped>
#ThreeBanner {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.27);
}
</style>
