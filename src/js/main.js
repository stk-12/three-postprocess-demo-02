import '../css/style.scss';
// import { radian, random } from './utils';
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";

import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.camera = null;
    this.mesh = null;

    this.controls = null;

    // post processing
    this.composer = null;
    this.effectSobel = null;
    this.effectGlitch = null;


    this._init();

    this._setComposer();
    this._setEffectSobel();
    this._setEffectGlitch();

    this._update();
    this._addEvent();
  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 2);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  _setControlls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 80);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.0);
    this.scene.add(ambientLight);
  }

  _setComposer() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);   
  }
  
  _setEffectSobel() {
    const effectGrayScale = new ShaderPass(LuminosityShader);
    this.composer.addPass(effectGrayScale);
  
    this.effectSobel = new ShaderPass(SobelOperatorShader);
    this.effectSobel.uniforms['resolution'].value.x = window.innerWidth * window.devicePixelRatio;
    this.effectSobel.uniforms['resolution'].value.y = window.innerHeight * window.devicePixelRatio;
    this.composer.addPass(this.effectSobel);
  }
  
  _setEffectGlitch() {
    this.effectGlitch = new GlitchPass();
    this.composer.addPass(this.effectGlitch);
  }

  _addMesh() {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    // const geometry = new THREE.IcosahedronGeometry(100, 0);
    const material = new THREE.MeshStandardMaterial({color: 0x444444});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  _init() {
    this._setCamera();
    this._setControlls();
    this._setLight();
    this._addMesh();
  }

  _update() {
    this.mesh.rotation.y += 0.01;
    this.mesh.rotation.x += 0.01;

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    this.composer.render();
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
}

new Main();



