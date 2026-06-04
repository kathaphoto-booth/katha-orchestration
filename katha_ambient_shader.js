/**
 * Katha Booth - Vanilla WebGL Ambient Shader
 * A lightweight, zero-dependency fluid gradient.
 * Blends Piña Ecru (#EAE2D5) and Champagne Heirloom (#C4B59D).
 */

(function() {
  const initKathaShader = () => {
    const canvas = document.getElementById('katha-ambient-canvas');
    if (!canvas) return;

    // Apply fixed styling to position canvas behind everything
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '-1',
      pointerEvents: 'none'
    });

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex Shader: Full screen quad
    const vsSource = `
      attribute vec4 aVertexPosition;
      varying vec2 vUv;
      void main() {
        vUv = aVertexPosition.xy * 0.5 + 0.5;
        gl_Position = aVertexPosition;
      }
    `;

    // Fragment Shader: Smooth ambient noise
    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;

      // Pseudo-random noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        uv.x *= aspect;

        // Animate noise slowly
        float n = snoise(uv * 1.5 + uTime * 0.05);
        float n2 = snoise(uv * 3.0 - uTime * 0.02);
        
        float blend = (n + n2) * 0.5 + 0.5;

        // Piña Ecru: #EAE2D5 -> rgb(234, 226, 213)
        vec3 c1 = vec3(234.0/255.0, 226.0/255.0, 213.0/255.0);
        // Champagne Heirloom: #C4B59D -> rgb(196, 181, 157)
        vec3 c2 = vec3(196.0/255.0, 181.0/255.0, 157.0/255.0);

        vec3 finalColor = mix(c1, c2, blend * 0.5 + 0.2); // Subtle blending

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const loadShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Katha Shader compile error: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Katha Shader link error: ' + gl.getProgramInfoLog(shaderProgram));
      return;
    }

    gl.useProgram(shaderProgram);

    // Set up geometry
    const positions = new Float32Array([
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(shaderProgram, 'uTime');
    const uResolution = gl.getUniformLocation(shaderProgram, 'uResolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform2f(uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    window.addEventListener('resize', resize);
    resize();

    let startTime = Date.now();
    let pausedTime = 0;
    let pauseStart = 0;
    let isVisible = true;
    let animationFrameId;

    const render = () => {
      if (!isVisible) return;
      const time = (Date.now() - startTime - pausedTime) * 0.001;
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
        pauseStart = Date.now();
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        if (pauseStart > 0) {
          pausedTime += Date.now() - pauseStart;
        }
        render();
      }
    });

    render();
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKathaShader);
  } else {
    initKathaShader();
  }
})();
