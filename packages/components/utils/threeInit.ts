import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default class ThreeInit {
  container: any;
  scene: null;
  camera: null;
  renderer: null;
  css2Renderer: null;
  // endCallback!: () => {};

  constructor(container: any) {
    // 容器
    this.container = container;
    // 场景
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.css2Renderer = new CSS2DRenderer();
    this.init();
  }
  init() {
    console.info('/******* 函数初始 *******/');
    // 相机
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 45, 45);
    console.info('/******* 创建相机 *******/');
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    console.info('/******* 创建渲染器 *******/');
    // 2d渲染器
    this.css2Renderer.setSize(window.innerWidth, window.innerHeight);
    this.css2Renderer.domElement.style.position = 'absolute';
    this.css2Renderer.domElement.style.top = '0px';
    this.css2Renderer.domElement.style.left = '0px';
    this.css2Renderer.domElement.style.pointerEvents = 'none';

    this.container.appendChild(this.css2Renderer.domElement);
    this.container.appendChild(this.renderer.domElement);
    console.info('/******* 创建2D渲染器 *******/');
    // 控制器
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 80;
    controls.minDistance = 20;
    controls.target.set(0, 0, 5);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
    console.info('/******* 创建控制器 *******/');

    // 渲染
    const animate = function () {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
      this.css2Renderer.render(this.scene, this.camera);
      controls.update();
    };
    console.info('/******* 函数结束 *******/');
    // animate();
  }
  
}

