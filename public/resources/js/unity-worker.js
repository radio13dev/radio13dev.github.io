var buildUrl;
var canvasInfo;
var webgpuVersion;
var hasWebGL;
var gpu;
var hresult;

self.addEventListener('message', async (e) => {
  const msg = e.data;
  if (msg && msg.type === 'init') {
    try {
      // Import Unity loader inside worker (path must be reachable and CORS-friendly)
      buildUrl = msg.config.buildUrl;
      canvasInfo = msg.config.canvasInfo;
      webgpuVersion = msg.config.webgpuVersion;
      haswebgl = msg.config.hasWebGL;
      gpu = msg.config.gpu;
      hresult = msg.config.hresult;

      importScripts(msg.loaderUrl); // e.g. '/media/Survivor.WebGL.Release/Build/Survivor.WebGL.Release.loader.js'
      const offscreen = msg.canvas;
      const config = msg.config || {};
      // Provide a progress callback that posts back progress
      const unityInstance = await createUnityInstance(offscreen, 
        config,
        (progress) => {
          self.postMessage({ type: 'progress', progress: progress });
        }
      );
      self.postMessage({ type: 'loaded' });
      // You can optionally keep a reference and proxy messages if needed:
      self.unityInstance = unityInstance;
    } catch (err) {
      self.postMessage({ type: 'error', message: `Data: ${msg.loaderUrl} ${msg.config} Err: ` + err });
    }
  } else if (msg && msg.type === 'call' && self.unityInstance) {
    // optional: forward simple API calls
    try {
      const { fn, args } = msg;
      const res = self.unityInstance[fn] && self.unityInstance[fn](...args);
      self.postMessage({ type: 'callResult', fn, res });
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) });
    }
  }
});