// 引入Three.js和OrbitControls
import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

// 创建场景、相机和渲染器
let scene = new THREE.Scene(); // 创建一个新场景
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // 创建一个透视相机
camera.position.z = 150; // 设置相机的位置
camera.lookAt(0, 0, 0); // 设置相机的朝向
let renderer = new THREE.WebGLRenderer({ antialias: true }); // 创建WebGL渲染器，并开启抗锯齿
renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器的尺寸
document.getElementById("canvasContainer").appendChild(renderer.domElement); // 将渲染器的DOM元素添加到页面中
new OrbitControls(camera, renderer.domElement); // 创建OrbitControls以允许用户交互

// 加载地图数据
let loader = new THREE.FileLoader(); // 创建一个文件加载器
loader.load(
'world.json', // 加载名为world.json的文件
function (data) { // 文件加载成功时的回调函数
    let jsonData = JSON.parse(data); // 解析JSON数据

    // 创建材质
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 创建一个基础材质，并设置颜色为绿色

    // 绘制边界线
    jsonData.features.forEach(function (feature) { // 遍历所有特征
        let coordinates = feature.geometry.coordinates; // 获取坐标数据
        let group = new THREE.Group(); // 创建一个组来包含所有线条
        coordinates.forEach(function (polygon) { // 遍历每个多边形
            let pointArr = []; // 创建一个数组来存储点

            polygon[0].forEach(elem => {
                pointArr.push(elem[0], elem[1], 0); // 将坐标点添加到数组
            });
            let geometry = new THREE.BufferGeometry(); // 创建一个缓冲几何体

            let vertices = new Float32Array(pointArr); // 将点数组转换为Float32Array
            let attribute = new THREE.BufferAttribute(vertices, 3); // 创建一个属性来存储顶点
            geometry.setAttribute('position', attribute); // 设置几何体的位置属性

            let line = new THREE.LineLoop(geometry, material); // 创建一个线循环
            group.add(line); // 将线循环添加到组

        });
        scene.add(group); // 将组添加到场景
    });

    // 绘制区域填充色
    jsonData.features.forEach(function (feature) { // 遍历所有特征
        let coordinates = feature.geometry.coordinates; // 获取坐标数据
        let shapeArr = []; // 创建一个数组来存储形状
        coordinates.forEach(pointsArr => {
            let vector2Arr = []; // 创建一个数组来存储Vector2对象

            pointsArr[0].forEach(elem => {
                vector2Arr.push(new THREE.Vector2(elem[0], elem[1])); // 将坐标点转换为Vector2并添加到数组
            });
            let shape = new THREE.Shape(vector2Arr); // 创建一个形状
            shapeArr.push(shape); // 将形状添加到数组
        });
        let material = new THREE.MeshBasicMaterial({
            color: 0x003333, // 设置材质颜色
            side: THREE.DoubleSide, // 设置材质为双面
        });
        let geometry = new THREE.ShapeBufferGeometry(shapeArr); // 创建一个形状缓冲几何体
        let mesh = new THREE.Mesh(geometry, material); // 创建一个网格
        scene.add(mesh); // 将网格添加到场景
    });
},
function (xhr) { // 加载过程中的回调函数
    console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // 输出加载进度
},
function (error) { // 加载失败时的回调函数
    console.error('Loading failed'); // 输出错误信息
}
