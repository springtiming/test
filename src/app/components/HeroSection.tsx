import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// 你的3D金鱼模型URL（放在 public/ 下，构建时会原样复制到 dist/）
const MODEL_URL = './model/koi_fish.glb';

export function HeroSection() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationId: number;
    let renderer: THREE.WebGLRenderer;

    // 场景设置
    const scene = new THREE.Scene();
    
    // 俯视角度相机 - 从正上方往下看
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -100,
      window.innerWidth / 100,
      window.innerHeight / 100,
      window.innerHeight / -100,
      0.1,
      1000
    );
    camera.position.set(0, 15, 0); // 相机在正上方
    camera.lookAt(0, 0, 0); // 看向中心

    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current?.appendChild(renderer.domElement);

    // 基础环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);
    
    // 添加左侧红光
    const redLight = new THREE.PointLight(0xff3333, 5, 20);
    redLight.position.set(-8, 5, 0);
    scene.add(redLight);
    
    // 添加右侧蓝光
    const blueLight = new THREE.PointLight(0x3333ff, 5, 20);
    blueLight.position.set(8, 5, 0);
    scene.add(blueLight);

    // 水面波纹
    const waterGeometry = new THREE.PlaneGeometry(30, 30, 50, 50);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1929,
      transparent: true,
      opacity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.2;
    scene.add(water);
    
    // 添加水下雾效果
    scene.fog = new THREE.FogExp2(0x000814, 0.05);

    // 后处理效果
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 辉光效果
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,  // 强度
      0.6,  // 半径
      0.3   // 阈值
    );
    composer.addPass(bloomPass);

    // 创建多圈金鱼，相邻圈层方向相反
    const circles = 6; // 6个圈层
    // 每个圈层的鱼数量不同：内圈少，外圈多
    const fishCountPerCircle = [7, 9, 11, 13, 15, 17]; // 总共72条鱼
    const fishes: Fish[] = [];

    for (let circle = 0; circle < circles; circle++) {
      const baseRadius = 3.5 + circle * 1.8; // 适中的基础半径和圈层间距
      const isClockwise = circle % 2 === 0; // 偶数圈顺时针，奇数圈逆时针
      const fishesInThisCircle = fishCountPerCircle[circle];

      for (let i = 0; i < fishesInThisCircle; i++) {
        // 增大随机偏移，让每条鱼到相邻圈的距离都不同
        const radiusOffset = (Math.random() - 0.5) * 1.4; // 半径随机偏移 ±0.7（大幅增加）
        const radius = baseRadius + radiusOffset;
        
        const angleOffset = (Math.random() - 0.5) * 0.6; // 角度随机偏移（增加）
        const angle = (i / fishesInThisCircle) * Math.PI * 2 + angleOffset;
        
        const yOffset = (Math.random() - 0.5) * 0.5; // 高度随机偏移
        
        // 扩大速度随机范围：0.5-1.6倍，让每条鱼速度差异更明显
        const baseSpeed = 0.5 + Math.random() * 1.1; // 0.5-1.6倍基础速度
        
        // 添加速度波动参数，让鱼的速度随时间变化
        const speedWaveFrequency = 0.3 + Math.random() * 0.5; // 波动频率随机
        const speedWaveAmplitude = 0.15 + Math.random() * 0.25; // 波动幅度随机 0.15-0.4

        fishes.push({
          angle,
          radius,
          baseSpeed: 0.13 * baseSpeed, // 基础速度
          speed: 0.13 * baseSpeed, // 当前速度（会动态变化）
          clockwise: isClockwise,
          yOffset,
          speedWaveFrequency, // 速度波动频率
          speedWaveAmplitude, // 速度波动幅度
          speedPhaseOffset: Math.random() * Math.PI * 2, // 随机相位偏移，让鱼不同步
        });
      }
    }

    // 修改材质 Shader 以实现方形光照区域
    const applyCustomLighting = (material: THREE.Material) => {
      if ((material as any).isMeshStandardMaterial || (material as any).isMeshPhongMaterial) {
        const mat = material as THREE.MeshStandardMaterial;
        
        // 使用 onBeforeCompile 注入自定义光照代码
        mat.onBeforeCompile = (shader) => {
          // 添加自定义 uniforms
          shader.uniforms.redLightColor = { value: new THREE.Color(0xff3333) };
          shader.uniforms.blueLightColor = { value: new THREE.Color(0x3333ff) };
          shader.uniforms.lightIntensity = { value: 2.5 };
          shader.uniforms.transitionWidth = { value: 0.5 };
          
          // 在 vertex shader 中添加 varying 来传递世界坐标
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>
            varying vec3 vWorldPosition;
            `
          );
          
          // 在 project_vertex 之后计算世界坐标
          shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `
            #include <project_vertex>
            vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
            vWorldPosition = worldPos.xyz;
            `
          );
          
          // 在 fragment shader 中添加 varying 和 uniforms 声明
          shader.fragmentShader = `
            varying vec3 vWorldPosition;
            uniform vec3 redLightColor;
            uniform vec3 blueLightColor;
            uniform float lightIntensity;
            uniform float transitionWidth;
            ${shader.fragmentShader}
          `;
          
          // 替换光照计算部分
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <lights_fragment_begin>',
            `
            #include <lights_fragment_begin>
            
            // 获取世界坐标 x 值
            float x = vWorldPosition.x;
            
            // 根据 x 坐标计算光照颜色
            vec3 customLightColor;
            if (x < -transitionWidth) {
              customLightColor = redLightColor;
            } else if (x > transitionWidth) {
              customLightColor = blueLightColor;
            } else {
              float mixFactor = (x + transitionWidth) / (2.0 * transitionWidth);
              customLightColor = mix(redLightColor, blueLightColor, mixFactor);
            }
            
            // 应用自定义光照
            reflectedLight.directDiffuse *= customLightColor * lightIntensity;
            reflectedLight.indirectDiffuse *= customLightColor * lightIntensity * 0.5;
            `
          );
        };
        
        mat.needsUpdate = true;
      }
    };

    // 提前声明金鱼实例数组（在加载前）
    const fishClones: THREE.Group[] = [];
    const fishMixers: (THREE.AnimationMixer | undefined)[] = [];

    // 加载GLB模型
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        console.log('✅ 3D金鱼模型加载成功！');
        console.log('📦 动画数量:', gltf.animations.length);
        
        // 为每条金鱼创建实例
        fishes.forEach((fish) => {
          const fishClone = gltf.scene.clone();
          fishClone.scale.set(0.4, 0.4, 0.4);
          
          // 创建动画混合器
          let mixer: THREE.AnimationMixer | undefined;
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(fishClone);
            gltf.animations.forEach((clip) => {
              const action = mixer!.clipAction(clip);
              action.play();
            });
          }
          
          // 应用自定义光照到所有材质
          fishClone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(mat => applyCustomLighting(mat));
                } else {
                  applyCustomLighting(mesh.material);
                }
              }
            }
          });
          
          fishClones.push(fishClone);
          fishMixers.push(mixer);
          scene.add(fishClone);
        });
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(0);
        console.log(`🐟 加载金鱼模型: ${percent}%`);
      },
      (error) => {
        console.error('❌ GLB模型加载失败:', error);
      }
    );

    // 动画循环
    const clock = new THREE.Clock();
    
    function animate() {
      animationId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      
      // 水波纹动画 - 增强波浪效果
      const positions = waterGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const distance = Math.sqrt(x * x + z * z);
        
        // 多层波纹叠加，创造更复杂的水波效果
        const wave1 = Math.sin(distance * 0.5 - time * 2) * 0.12;
        const wave2 = Math.sin(distance * 0.3 + time * 1.5) * 0.08;
        const wave3 = Math.cos(x * 0.4 + time * 1.8) * Math.sin(z * 0.4 - time * 1.2) * 0.06;
        const ripple = Math.sin(distance * 0.8 - time * 3) * 0.04 * Math.exp(-distance * 0.05);
        
        positions.setY(i, wave1 + wave2 + wave3 + ripple);
      }
      positions.needsUpdate = true;
      
      // 更新金鱼位置
      fishes.forEach((fish, index) => {
        // 动态更新每条鱼的速度，添加正弦波动效果
        const speedWave = Math.sin(time * fish.speedWaveFrequency + fish.speedPhaseOffset);
        fish.speed = fish.baseSpeed * (1 + speedWave * fish.speedWaveAmplitude);
        
        // 每帧增加角度（而不是用总时间乘以速度）
        const angleIncrement = delta * fish.speed * (fish.clockwise ? 1 : -1);
        fish.angle += angleIncrement;
        
        const x = Math.cos(fish.angle) * fish.radius;
        const z = Math.sin(fish.angle) * fish.radius;
        
        // 检查金鱼实例是否已加载
        if (fishClones[index]) {
          fishClones[index].position.set(x, fish.yOffset, z);
          
          // 金鱼朝向根据游动方向调整
          if (fish.clockwise) {
            fishClones[index].rotation.y = -fish.angle - Math.PI / 2; // 顺时针朝向
          } else {
            fishClones[index].rotation.y = -fish.angle + Math.PI / 2; // 逆时针朝向（反向）
          }
          
          if (fishMixers[index]) {
            // 根据速度调整动画播放速率，让快鱼摆尾快，慢鱼摆尾慢
            const animationSpeed = 0.8 + (fish.speed / fish.baseSpeed) * 0.4; // 0.8-1.2倍速
            fishMixers[index]!.timeScale = animationSpeed;
            fishMixers[index]!.update(delta);
          }
        }
      });
      
      composer.render();
    }
    
    animate();

    // 响应窗口大小调整
    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      camera.left = window.innerWidth / -100;
      camera.right = window.innerWidth / 100;
      camera.top = window.innerHeight / 100;
      camera.bottom = window.innerHeight / -100;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // 更新辉光效果
      bloomPass.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 背景 - 左红右蓝分割 */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-gradient-to-r from-red-950 via-red-900/50 to-black" />
        <div className="w-1/2 bg-gradient-to-l from-blue-950 via-blue-900/50 to-black" />
      </div>
      
      {/* 红蓝辉光 */}
      <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/40 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/40 blur-[180px] rounded-full pointer-events-none" />

      {/* 3D Canvas */}
      <div ref={canvasRef} className="absolute inset-0" />
      
      {/* 水面质感叠加层 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,8,20,0.3) 50%, rgba(0,8,20,0.7) 100%)',
        mixBlendMode: 'multiply'
      }} />

      {/* 标题文字覆盖层 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-7xl font-bold bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] italic" style={{ fontFamily: 'Georgia, serif' }}>
            Luminous
          </h1>
          <h2 className="text-6xl font-bold bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] italic -mt-2" style={{ fontFamily: 'Georgia, serif' }}>
            Sanctum
          </h2>
        </div>
      </div>
      
      {/* 聚焦模糊层 - 边缘模糊，中心清晰 */}
      <div className="absolute inset-0 pointer-events-none z-20" style={{
        background: 'radial-gradient(circle at center, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.6) 100%)',
        backdropFilter: 'blur(0px)',
      }}>
        {/* 外层模糊环 */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%)',
          filter: 'blur(40px)',
        }} />
        {/* 中层模糊环 */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 0%, transparent 50%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.4) 100%)',
          filter: 'blur(20px)',
        }} />
        {/* 内层轻微模糊 */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.1) 85%, rgba(0,0,0,0.25) 100%)',
          filter: 'blur(10px)',
        }} />
      </div>
    </div>
  );
}

interface Fish {
  angle: number;
  radius: number;
  baseSpeed: number;
  speed: number;
  clockwise: boolean;
  yOffset: number;
  speedWaveFrequency: number;
  speedWaveAmplitude: number;
  speedPhaseOffset: number;
  mixer?: THREE.AnimationMixer;
}
