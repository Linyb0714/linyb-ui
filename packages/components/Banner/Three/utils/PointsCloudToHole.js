import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { divideCurve } from './divideCurve.js';

export default class PointsCloudToHole {
  animateRequestID = null;
  action = null;
  endCallback;
  constructor({ object, allTime, delayPct, easing, endCallback = () => {} }) {
    allTime = allTime || 5000;
    delayPct = delayPct || 0;
    easing = easing || TWEEN.Easing.Sinusoidal.InOut;
    this.endCallback = endCallback;
    let position1 = object.geometry.attributes.position;
    function findMaxN(x) {
      const discriminant = Math.sqrt(225 + 8 * x);
      const n = Math.floor((-15 + discriminant) / 2);
      return n;
    }
    const maxN = findMaxN(position1.count);
    const count = (maxN * maxN + 15 * maxN) * 0.5;
    const vertices1 = [],
      vertices2 = [],
      delays = [];
    for (let i = 0; i < position1.count; i++) {
      const x1 = position1.getX(i);
      const y1 = position1.getY(i);
      const z1 = position1.getZ(i);
      vertices1.push(x1, y1, z1);
    }
 
    const a = 0.03;
    const b = Math.E * 2;
    const n = maxN * 50; // 积分的步数
    const segments = maxN; // 分割的段数
 
    const points = divideCurve(a, b, n, segments);
 
    // console.log('获取', object);
    for (let i = 0; i < maxN; i++) {
      const r = points[i].x * 0.4;
      for (let j = 0; j < 8 + i; j++) {
        const p = (j / (8 + i)) * Math.PI * 2;
        let x = r * Math.cos(p);
        let z = r * Math.sin(p);
        let y = points[i].y * 0.2 - 0.5;
 
        // 定义旋转角度 a（以弧度为单位）
        // let a = Math.PI / 10; // 例如，旋转45度
        // 绕 x 轴旋转
        // y = y * Math.cos(a) - z * Math.sin(a);
        // z = y * Math.sin(a) + z * Math.cos(a);
        vertices2.push(x, y, z);
        delays.push((Math.random() * 0.3 + 0.7) * (i / maxN) * delayPct);
      }
    }
    for (let i = 0; i < position1.count - count; i++) {
      const x = vertices2[3 * i];
      const y = vertices2[3 * i + 1];
      const z = vertices2[3 * i + 2];
      vertices2.push(x, y, z);
      delays.push(Math.random() * delayPct);
    }
 
    const geometry = new THREE.BufferGeometry();
 
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices1, 3)
    );
    geometry.setAttribute(
      "target",
      new THREE.Float32BufferAttribute(vertices2, 3)
    );
    geometry.setAttribute("delay", new THREE.Float32BufferAttribute(delays, 1));
    geometry.setDrawRange(0, position1.count);
 
    const material = this.getMaterial({
      color: 0xffffff,
      size: 1,
    });
    this.points = new THREE.Points(geometry, material);
    this.animationInit(1 + delayPct, allTime, easing, this.endCallback);
  }
 
  // 创建材质
  getMaterial(options) {
    options = Object.assign(
      {
        color: 0xffffff,
        size: 1,
        map: new THREE.TextureLoader().load(
          // `${VITE_PUBLIC_PATH || "/public/"}textures/sprites/circle.png`
          `/public/textures/i.jpg`
        ),
      },
      options
    );
    this.uniforms = {
      color: { value: new THREE.Color(options.color) },
      size: { value: options.size },
      map: { value: options.map },
      percent: { value: 0 },
      time: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      // transparent: true,
      depthTest: true,
      depthWrite: true,
      // blending: THREE.AdditiveBlending,
      uniforms: this.uniforms,
      vertexShader: `
      attribute float delay;
      attribute vec3 target;
      uniform float percent;
      uniform float size;
      uniform float time;
      void main() {
        float p = clamp(percent - delay,0.0,1.0);  //进程百分比
        vec3 _position = mix( position,target,p);  //根据进程百分比插值计算当前位置
        float distance = sqrt(_position.x*_position.x + _position.z*_position.z);
        _position.y += sqrt(distance)*sin(distance*10.0-time)*0.05*p*p;
        vec4 mvPosition = modelViewMatrix * vec4(_position, 1.0); 
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize =  (8.0 / -mvPosition.z)*size;
      }
      `,
      fragmentShader: `
      uniform vec3 color;
      uniform sampler2D map;
      void main() {
        gl_FragColor = vec4(color, 1.0);
				// gl_FragColor = gl_FragColor * texture2D( map, gl_PointCoord );
      }
      `,
    });
    // gui.add(material.uniforms.percent, "value", 0, 2, 0.01);
    return material;
  }
 
  /**
   * 初始化动画，设置切换进程的百分比、持续时间和缓动函数。
   * @param {number} percent - 切换进程的百分比。
   * @param {number} duration - 动画的持续时间，默认为 2000 毫秒。
   * @param {Function} easing - 动画的缓动函数，默认为 TWEEN.Easing.Sinusoidal.InOut。
   * @param {Function} endCallback - 动画结束时的回调函数，默认为空。
   * @returns {TWEEN} - 返回一个Tween对象，用于控制动画。
   */
  animationInit(
    percent,
    duration = 2000,
    easing = TWEEN.Easing.Sinusoidal.InOut,
    endCallback = () => {}
  ) {
    if (this.action) {
      this.action = null;
    }
    this.action = new TWEEN.Tween(this.uniforms.percent)
      .to({ value: percent }, duration)
      .easing(easing)
      .onUpdate((obj) => {
        this.points.rotation.x = Math.PI / 16*obj.value;
      })
      .onComplete((res) => {
        cancelAnimationFrame(this.animateRequestID);
        this.animateRequestID = null;
        endCallback();
      })
      .onStop(() => {
        cancelAnimationFrame(this.animateRequestID);
        this.animateRequestID = null;
        endCallback();
      });
    this.animateRequestID = null;
    // this.startAnimation();
  }
 
  // 开始动画
  startAnimation() {
    if (this.animateRequestID) return;
 
    this.action.start();
    const animate = () => {
      this.animateRequestID = requestAnimationFrame(animate);
      TWEEN.update();
    };
    animate();
  }
 
  // 停止动画
  stopAnimation() {
    if (!this.animateRequestID) return;
    this.action.stop();
  }
 
  // 更新波动动画
  update(delta) {
    this.uniforms.time.value += delta;
  }
}