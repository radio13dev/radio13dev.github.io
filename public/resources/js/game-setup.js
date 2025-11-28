const hideFullScreenButton = "";
const buildUrl = "http://127.0.0.1:8788/media/Survivor.WebGL.Release";
const loaderUrl = buildUrl + "/Build/Survivor.WebGL.Release.loader.js";
const config = {
    buildUrl: buildUrl,
    dataUrl: buildUrl + "/Build/Survivor.WebGL.Release.data.br",
    frameworkUrl: buildUrl + "/Build/Survivor.WebGL.Release.framework.js.br",
    codeUrl: buildUrl + "/Build/Survivor.WebGL.Release.wasm.br",
    streamingAssetsUrl: buildUrl + "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "Boto.Survivor",
    productVersion: "1.0",
    preserveDrawingBuffer: true
};

const container = document.querySelector("#unity-container");
const canvas = document.querySelector("#unity-canvas");
const loadingCover = document.querySelector("#unity-loading-cover");
const progressBar = document.querySelector("#unity-loading-bar");
const fullscreenButton = document.querySelector("#unity-fullscreen-button");

const canFullscreen = (function () {
    for (const key of [
        'exitFullscreen',
        'webkitExitFullscreen',
        'webkitCancelFullScreen',
        'mozCancelFullScreen',
        'msExitFullscreen',
    ]) {
        if (key in document) {
            return true;
        }
    }
    return false;
}());

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    container.className = "unity-mobile";
    config.devicePixelRatio = window.devicePixelRatio; // Changed from 1
}
loadingCover.style.display = "";

function spinSpinner() {
    // We'll animate the group's transform attribute directly: set transform="rotate(angle cx cy)"
    // This avoids issues with GSAP's svgOrigin/transformOrigin and matches the working manual transform approach.
    const spinner = document.querySelector('#spinner');
    if (!spinner) return;

    // Ensure there's a persistent GSAP tween driving an 'angle' value which we write to the group's transform
    if (!window.__spinTween) {
        const defaultOmega = 0.5; // rad/s
        const defaultPeriod = (2 * Math.PI) / defaultOmega; // seconds per 360deg
        const angleObj = { angle: 0 };
        // initial transform
        spinner.setAttribute('transform', `rotate(0 0 0)`);
        window.__spinTween = gsap.to(angleObj, {
            angle: '+=360',
            duration: defaultPeriod,
            ease: 'none',
            repeat: -1,
            onUpdate: function () {
                // Keep numeric precision reasonable
                const a = Math.floor(angleObj.angle * 1000) / 1000;
                spinner.setAttribute('transform', `rotate(${a} 0 0)`);
            }
        });
    }

    const spinTween = window.__spinTween;
    // Target speeds (multipliers of base speed)
    const fastOmega = 30; // rad/s
    const defaultOmega = 0.5; // rad/s
    const speedFactor = fastOmega / defaultOmega; // how much faster we want to go

    // Smoothly ramp timeScale on the angle tween
    gsap.killTweensOf(spinTween);
    gsap.to(spinTween, {
        timeScale: speedFactor,
        duration: 0.2,
        ease: 'circ.out'
    });
    gsap.to(spinTween, {
        timeScale: 1,
        duration: 1,
        delay: 0.3,
        ease: 'circ.out'
    });
}

function updateSpinnerText(newText) {
    // The spinner text elements should only be updated when the elements are off screen (i.e., not visible to the user).
    // We'll keep trying until each spinner has been updated.
    const spinnerTexts = document.querySelectorAll('.spinner-text');
    spinnerTexts.forEach(textEl => updateSpinnerText_Element(newText, textEl));
}

function updateSpinnerText_Element(newText, textEl) {
    // Check if the element is visible on screen
    const rect = textEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right < 0 || rect.left > window.innerWidth) {
        // Element is off screen, safe to update
        textEl.textContent = newText;
    } else {
        // Element is on screen, try again after a short delay
        setTimeout(() => {
            updateSpinnerText_Element(newText, textEl);
        }, 100);
    }
}

var gameLoadState = 0;
function gameButtonPress() {
    spinSpinner();
    startUnityInWorker();
    if (gameLoadState == 0) {
        // Nothing, waiting for ready
    }
    else if (gameLoadState == 1) {
        // Update text
        updateSpinnerText("LOADING");
        // Start load
        //gameOnLoad();
        // Iterate
        gameLoadState = 2;
    }
    else if (gameLoadState == 2) {
        // Nothing, controlled by gameOnLoad();
    }
    else if (gameLoadState == 3) {
        
        // Transition to game full screen:
        gsap.timeline().to("circle.expand-on-game-start",
            {
                r: "*=4",
                duration: 1,
                ease: 'circ.in',
            }
        ).set("circle.expand-on-game-start", { display: "none" })
        .set(".disable-on-game-start", { display: "none" });

        gsap.timeline().to("circle.shrink-on-game-start",
            {
                r: 0,
                duration: 1,
                ease: 'circ.in',
            }
        ).set("circle.shrink-on-game-start", { display: "none" });

        gsap.timeline().fromTo("g.shrink-on-game-start",
            {
                transformOrigin:"50% 50%",
                scale: 1
            },
            {
                transformOrigin:"50% 50%",
                scale: 0,
                duration: 1,
                ease: 'circ.in'
            }
        ).set("g.shrink-on-game-start", { display: "none" });

        // Iterate, this UI will probably hide now.
        gameLoadState = 4;
    }
}

function loaderReady() {
    gameLoadState = 1;
    updateSpinnerText("GAME");
    spinSpinner();
}


var webgpuVersion;
var hasWebGL;
var gpu;
var hresult;
    var systemInfo;
async function startUnityInWorker()
{
    if (typeof OffscreenCanvas === 'undefined' || typeof Worker === 'undefined') {
        console.warn("No offscreencanvas support found")
        return;
    }

    // Create worker
    const worker = new Worker('resources/js/unity-worker.js');
    
    // Listen for worker messages
    worker.addEventListener('message', (e) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        // update UI
      } else if (msg.type === 'loaded') {
        // Unity is ready
      } else if (msg.type === 'error') {
        console.error('Unity worker error', msg.message);
      }
    });

    {var e,
        r,
        t,
        n,
        o,
        i = navigator.userAgent + " ",
        a = [["Firefox", "Firefox"], ["OPR", "Opera"], ["Edg", "Edge"], ["SamsungBrowser", "Samsung Browser"], ["Trident", "Internet Explorer"], ["MSIE", "Internet Explorer"], ["Chrome", "Chrome"], ["CriOS", "Chrome on iOS Safari"], ["FxiOS", "Firefox on iOS Safari"], ["Safari", "Safari"]];
        function s(e, r, t) {
            return (e = RegExp(e, "i").exec(r)) && e[t]
        }
        for (var l = 0; l < a.length; ++l)
            if (r = s(a[l][0] + "[/ ](.*?)[ \\)]", i, 1)) {
                e = a[l][1];
                break
            }
        "Safari" == e && (r = s("Version/(.*?) ", i, 1)),
        "Internet Explorer" == e && (r = s("rv:(.*?)\\)? ", i, 1) || r);
        for (var d = [["Windows (.*?)[;)]", "Windows"], ["Android ([0-9_.]+)", "Android"], ["iPhone OS ([0-9_.]+)", "iPhoneOS"], ["iPad.*? OS ([0-9_.]+)", "iPadOS"], ["FreeBSD( )", "FreeBSD"], ["OpenBSD( )", "OpenBSD"], ["Linux|X11()", "Linux"], ["Mac OS X ([0-9_\\.]+)", "MacOS"], ["bot|google|baidu|bing|msn|teoma|slurp|yandex", "Search Bot"]], u = 0; u < d.length; ++u)
            if (n = s(d[u][0], i, 1)) {
                t = d[u][1],
                n = n.replace(/_/g, ".");
                break
            }
        var c;
        function h() {
            try {
                return window.WebAssembly ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 3, 1, 0, 1, 10, 13, 1, 11, 0, 65, 0, 65, 0, 65, 1, 252, 11, 0, 11])) ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 11, 1, 9, 1, 1, 125, 32, 0, 252, 0, 26, 11])) ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 10, 1, 8, 1, 1, 126, 32, 0, 194, 26, 11])) ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11])) ? !!WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 10, 1, 8, 0, 6, 64, 1, 25, 1, 11, 11])) || "wasm-exceptions" : "wasm-simd128" : "sign-extend" : "non-trapping fp-to-int" : "bulk-memory" : "WebAssembly"
            } catch (e) {
                return "Exception: " + e
            }
        }
        n = {
            "NT 5.0": "2000",
            "NT 5.1": "XP",
            "NT 5.2": "Server 2003",
            "NT 6.0": "Vista",
            "NT 6.1": "7",
            "NT 6.2": "8",
            "NT 6.3": "8.1",
            "NT 10.0": "10"
        }
        [n] || n,
        webgpuVersion = 0,
        (f = document.createElement("canvas")) && (c = (p = f.getContext("webgl2")) ? 2 : 0, p || (p = f && f.getContext("webgl")) && (c = 1), p && (o = p.getExtension("WEBGL_debug_renderer_info") && p.getParameter(37446) || p.getParameter(7937)), webgpuVersion = navigator.gpu ? 1 : 0);
        var f = "undefined" != typeof SharedArrayBuffer,
        p = "object" == typeof WebAssembly && "function" == typeof WebAssembly.compile,
        g = p && !0 === h();
        systemInfo = {
            width: screen.width,
            height: screen.height,
            userAgent: i.trim(),
            browser: e || "Unknown browser",
            browserVersion: r || "Unknown version",
            mobile: /Mobile|Android|iP(ad|hone)/.test(navigator.appVersion),
            os: t || "Unknown OS",
            osVersion: n || "Unknown OS Version",
            gpu: o || "Unknown GPU",
            language: navigator.userLanguage || navigator.language,
            hasWebGL: c,
            hasWebGPU: webgpuVersion,
            hasCursorLock: !!document.body.requestPointerLock,
            hasFullscreen: !!document.body.requestFullscreen || !!document.body.webkitRequestFullscreen,
            hasThreads: f,
            hasWasm: p,
            hasWasm2023: g,
            missingWasm2023Feature: g ? null : h(),
            hasWasmThreads: !1
        }
    }
    webgpuVersion = 0,
        (f = document.createElement("canvas")) && 
        (c = (p = f.getContext("webgl2")) ? 2 : 0, 
        p || (p = f && f.getContext("webgl")) && 
        (c = 1), 
        p && (o = p.getExtension("WEBGL_debug_renderer_info") && p.getParameter(37446) || p.getParameter(7937)), 
        webgpuVersion = navigator.gpu ? 1 : 0);
        webgpuVersion = webgpuVersion;
        haswebgl = c;
        gpu = o;

        hresult = window.WebAssembly ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 3, 1, 0, 1, 10, 13, 1, 11, 0, 65, 0, 65, 0, 65, 1, 252, 11, 0, 11])) ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 11, 1, 9, 1, 1, 125, 32, 0, 252, 0, 26, 11])) ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 10, 1, 8, 1, 1, 126, 32, 0, 194, 26, 11])) ? WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11])) ? !!WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 10, 1, 8, 0, 6, 64, 1, 25, 1, 11, 11])) || "wasm-exceptions" : "wasm-simd128" : "sign-extend" : "non-trapping fp-to-int" : "bulk-memory" : "WebAssembly";

    // Transfer canvas to offscreen
    //importScripts('http://127.0.0.1:8788/resources/js/loader2.js');
    const unityInstance = await createUnityInstance(document.querySelector('#unity-canvas'), 
        config,
        (progress) => {

        }
    );
    //const offscreen = document.querySelector('#unity-canvas').transferControlToOffscreen();
    //worker.postMessage({ type: 'init', canvas: offscreen, config, loaderUrl: 'http://127.0.0.1:8788/resources/js/loader2.js' }, [offscreen]);

}

function gameOnLoad() {
    createUnityInstance(canvas, config, (progress) => {
        container.style.display = "none";
        loadingCover.style.display = "";
        var len = progressBar.getTotalLength();
        progressBar.style.strokeDasharray = len;
        progressBar.style.strokeDashoffset = len + (progress * len);
    }).then((instance) => {
        unityInstance = instance; // store the instance globally

        // Display game container
        container.style.display = "";

        // Play animation that hides loading cover over time
        gameLoadState = 3;
        updateSpinnerText("PLAY");
        spinSpinner();

        gsap.killTweensOf(loadingCover);
        gsap.timeline().to(loadingCover, {transform:"matrix(-1,0,0,1,0,0)", duration: 0.6, ease: "power2.out"}
        ).set(loadingCover, { display: "none" });

        // Setup fullscreen button
        if (canFullscreen) {
            if (!hideFullScreenButton) {
                fullscreenButton.style.display = "";
            }
            fullscreenButton.onclick = () => {
                unityInstance.SetFullscreen(1);
            };
        }

        // Parse URL parameters and get the token
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('lobby');
        if (tokenParam) {
            console.log("Token param found:", tokenParam);
            unityInstance.SendMessage("JavascriptHook", "JoinLobby", tokenParam);
        } else {
            console.log("No token param provided.");
        }

        // When the user clicks on the canvas, it will receive focus
        canvas.addEventListener("focus", function () {
            // e.g., send a message to Unity to unpause
            unityInstance.SendMessage("JavascriptHook", "SetFocused", 1);
        });

        // When the canvas loses focus (e.g., clicking elsewhere, pressing tab, etc.)
        canvas.addEventListener("blur", function () {
            // e.g., send a message to Unity to pause
            unityInstance.SendMessage("JavascriptHook", "SetFocused", 0);
        });

        // We need these here just for iOS Safari, which handles "focus" and "blur" differently
        canvas.addEventListener("touchstart", function () {
            unityInstance.SendMessage("JavascriptHook", "SetFocused", 1);
        });

    }).catch((message) => {
        alert(message);
    });
}