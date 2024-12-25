<template>
  <div id="ThreeDom">
    <span>地图信息</span>
  </div>
</template>

<script setup lang='ts'>
defineOptions({
  name: "LinThreeMap",
});
import * as THREE from 'three';
import { onMounted } from 'vue';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as d3geo from 'd3-geo';
import jsonData from './china.json';

onMounted(() => {
  /* ------------------------------初始化三件套--------------------------------- */
  const dom = document.getElementById('ThreeDom');
  const { innerHeight, innerWidth } = window

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 300);
  camera.lookAt(scene.position);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,// 抗锯齿
    alpha: false,// 透明度
    powerPreference: 'high-performance',// 性能
    logarithmicDepthBuffer: true,// 深度缓冲
  })
  renderer.setClearColor(0x0000000, 0.7);// 设置背景色
  // renderer.clear();// 清除渲染器
  renderer.shadowMap.enabled = true;// 开启阴影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;// 阴影类型
  renderer.outputEncoding = THREE.sRGBEncoding;// 输出编码
  renderer.toneMapping = THREE.ACESFilmicToneMapping;// 色调映射
  renderer.toneMappingExposure = 1;// 色调映射曝光
  renderer.physicallyCorrectLights = true;// 物理正确灯光
  renderer.setPixelRatio(devicePixelRatio);// 设置像素比
  renderer.setSize(innerWidth, innerHeight);// 设置渲染器大小
  dom.appendChild(renderer.domElement);

  // 重置大小
  window.addEventListener('resize', () => {
    const { innerHeight, innerWidth } = window
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  })

  /* ------------------------------初始化工具--------------------------------- */
  const controls = new OrbitControls(camera, renderer.domElement) // 相机轨道控制器
  controls.enableDamping = true // 是否开启阻尼
  controls.dampingFactor = 0.05// 阻尼系数
  controls.panSpeed = -1// 平移速度

  /* ------------------------------辅助坐标系--------------------------------- */
  // const axesHelper = new THREE.AxesHelper(10);
  // scene.add(axesHelper);

  /* ------------------------------正题--------------------------------- */

  // 光晕效果配置
  const bloomOptions = {
    threshold: 0,// 亮度阈值
    strength: 0.5,// 光晕强度
    radius: 0.5,// 光晕半径
    exposure: 0.5// 曝光
  }

  // 相机控制器配置
  const cameraControl = {
    autoCamera: true,// 是否自动旋转
    height: 10,// 相机高度
    width: 0.5,// 相机宽度
    depth: 1,// 相机深度
    cameraPosX: 10,// 相机位置x
    cameraPosY: 181,// 相机位置y
    cameraPosZ: 116,// 相机位置z
    autoRotate: false,// 是否自动旋转
    rotateSpeed: 2000// 旋转速度
  }

  let geoFun;// 地理投影函数
  let map = null; // 地图
  let mapAreaData = [];// 地图数据
  const group = new THREE.Group();
  const composer = new EffectComposer(renderer);// 效果合成器
  let time = 1;// 时间
  const edgeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },// 当前时间
      len: { value: 0.05 },// 粒子在时间轴上活动的长度
      size: { value: 0.02 },// 粒子的大小
      color1: { value: new THREE.Color('#FFFFFF') },// 定义边框色
      color2: { value: new THREE.Color('yellow') }// 定义移动色
    },
    // 顶点着色器
    vertexShader: `
    uniform float time;
    uniform float size;
    uniform float len;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec3 vColor; 
    void main() {
      vColor = color1;// 设置初始颜色
      vec3 newPosition = position;// 新的位置初始化为当前顶点的位置
      float d = uv.x - time;// 当前纹理坐标的x值与时间值的差值
      if(abs(d) < len) {
        // 粒子接近时间轴
        newPosition = newPosition + normal * size;// 根据法线方向和粒子大小调整位置，模拟粒子在表面上的移动
        vColor = color2;// 设置颜色为移动色
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }`,
    // 片段着色器
    fragmentShader: `
    varying vec3 vColor; 
    void main() {
      gl_FragColor =vec4(vColor, 1.0);
    }`,
  })

  // 初始化地理投影
  const initGeo = (size) => {
    geoFun = d3geo.geoMercator().scale(size || 100)
  }

  // 经纬度转像素坐标
  const latlng2px = (pos) => {
    if (pos[0] >= -180 && pos[0] <= 180 && pos[1] >= -90 && pos[1] <= 90) {
      return geoFun(pos);
    }
    return pos;
  };

  /** 遍历地图数据 */
  const mapForData = () => {
    processData()// 处理地图数据
    createMap()// 创建地图块
  }
  // 处理地图数据
  const processData = () => {
    const mapObj = jsonData.features.filter(item => item.properties.name === '省');
    mapAreaData = mapObj[0].geometry.coordinates[0];
    // 数据 从 经纬度-> 像素坐标-> 三维坐标
    console.log('获取数据', jsonData);
    
    mapAreaData = mapAreaData.map(item => {
      const two = latlng2px(item);
      const three = new THREE.Vector3(two[0], 0, two[1]);
      return three;
    })
  }

  // 创建地图块
  const createMap = () => {
    const shape = new THREE.Shape();
    shape.moveTo(mapAreaData[0].x, mapAreaData[0].z);// 移动到第一个点
    for (let i = 1; i < mapAreaData.length; i++) {
      shape.lineTo(mapAreaData[i].x, mapAreaData[i].z);// 连线
    }
    shape.lineTo(mapAreaData[0].x, mapAreaData[0].z);// 闭合
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,// 区块厚度
      bevelEnabled: false// 是否使用倒角
    });

    const img = new URL('./images/gz-map.jpg', import.meta.url).href;
    const text = new THREE.TextureLoader().load(img);
    text.wrapS = THREE.RepeatWrapping;// 水平方向
    text.wrapT = THREE.RepeatWrapping;// 垂直方向
    const material = new THREE.MeshBasicMaterial({
      map: text,
      color: new THREE.Color('#00FFFF')
    })
    map = new THREE.Mesh(geometry, material);
    map.rotateX(Math.PI / 2);// 旋转90度
    group.add(map);
  }

  // 创建边缘线
  const createEdge = () => {
    // 创建曲线(数据, 是否闭合, 曲线类型, 张力)
    const curve = new THREE.CatmullRomCurve3(mapAreaData, true, 'catmullrom', 0);
    // 创建管状几何体(曲线, 管道半径, 管道分段, 管道圆周分段, 是否闭合)
    const geometry = new THREE.TubeGeometry(curve, Math.round(mapAreaData.length * 0.5), 0.01, 8, true);
    // const edgeMaterial = new THREE.MeshBasicMaterial({ color: 'white' });// 如果只需要白色边缘线，可以直接使用这个材质
    const mesh = new THREE.Mesh(geometry, edgeMaterial);
    group.add(mesh);
  }

  // 设置模型的中心点
  const setModeCenter = (object, viewControl) => {
    // 如果对象不存在，则返回   
    if (!object) {
      return;
    }
    if (object.updateMatrixWorld) {
      object.updateMatrixWorld();// 更新模型矩阵
    }
    // 获得包围盒得min和max
    let box = new THREE.Box3().setFromObject(object);

    let objSize;// 获取包围盒的尺寸
    try {
      objSize = box.getSize();
    } catch (error) {
      objSize = new THREE.Vector3(
        Math.abs(box.max.x - box.min.x),
        Math.abs(box.max.y - box.min.y),
        Math.abs(box.max.z - box.min.z)
      );
    }

    // 返回包围盒的中心点
    const center = box.getCenter(new THREE.Vector3());
    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;

    let width = objSize.x;
    let height = objSize.y;
    let depth = objSize.z;

    // 设置相机位置
    let centroid = new THREE.Vector3().copy(objSize);
    centroid.multiplyScalar(0.5);
    if (viewControl.autoCamera) {
      camera.position.x =
        centroid.x * (viewControl.centerX || 0) + width * (viewControl.width || 0);
      camera.position.y =
        centroid.y * (viewControl.centerY || 0) + height * (viewControl.height || 0);
      camera.position.z =
        centroid.z * (viewControl.centerZ || 0) + depth * (viewControl.depth || 0);
    } else {
      camera.position.set(
        viewControl.cameraPosX || 0,
        viewControl.cameraPosY || 0,
        viewControl.cameraPosZ || 0
      );
    }
    camera.lookAt(0, 0, 0);
  }

  // 添加Bloom发光效果
  const addBloom = () => {
    // 创建一个渲染器通道
    const renderPass = new RenderPass(scene, camera, null, new THREE.Color('rgba(0,0,255,0.0)'), 0);
    composer.addPass(renderPass);// 添加渲染器通道

    // 创建一个Bloom发光效果通道 (泛光所覆盖的场景大小, 泛光强度, 泛光模糊度, 泛光衰减)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloomOptions.threshold;// 发光阈值
    bloomPass.strength = bloomOptions.strength;// 发光强度
    bloomPass.radius = bloomOptions.radius;// 发光模糊度
    bloomPass.copyUniforms.opacity.value = 1;// 发光衰减
    composer.addPass(bloomPass);// 添加发光效果通道

    const outputPass = new OutputPass(); // 创建一个输出通道
    composer.addPass(outputPass);// 添加输出通道
  }

  const animationRender = () => {
    renderer.setViewport(0, 0, innerWidth, innerHeight);// 设置渲染器视口大小
    renderer.autoClear = false;// 关闭自动清除
    renderer.clear();// 清除渲染器
    map.visible = false;
    composer.render();// 渲染后期效果
    renderer.clearDepth();// 清除深度缓存
    map.visible = true;
    renderer.render(scene, camera);// 渲染场景
  }

  // 初始化
  const init = () => {
    initGeo(180)// 初始化地理投影
    mapForData()// 处理数据
    createEdge()// 创建边缘线
    scene.add(group);// 添加到场景中
    setModeCenter(group, cameraControl)// 设置模型的中心点
    addBloom()// 添加Bloom发光效果
  }
  init();

  /* ------------------------------动画函数--------------------------------- */
  const animation = () => {
    if (edgeMaterial) {
      if (time >= 1.0) {
        time = 0.0;
      }
      time += 0.005;
      edgeMaterial.uniforms.time.value = time;
    }
    controls.update();// 如果不调用，就会很卡
    animationRender()
    // renderer.render(scene, camera);
    requestAnimationFrame(animation);
  }
  animation();
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
    color: #fff;
  }
}
</style>