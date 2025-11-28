const hideFullScreenButton = "";
const buildUrl = "/media/Survivor.WebGL.Release";
const loaderUrl = buildUrl + "/Build/Survivor.WebGL.Release.loader.js";
const config = {
    dataUrl: buildUrl + "/Build/Survivor.WebGL.Release.data.br",
    frameworkUrl: buildUrl + "/Build/Survivor.WebGL.Release.framework.js.br",
    codeUrl: buildUrl + "/Build/Survivor.WebGL.Release.wasm.br",
    streamingAssetsUrl: buildUrl + "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "Boto.Survivor",
    productVersion: "1.0",
    preserveDrawingBuffer: true,
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
    if (gameLoadState == 0) {
        // Nothing, waiting for ready
    }
    else if (gameLoadState == 1) {
        // Update text
        updateSpinnerText("LOADING");
        // Start load
        gameOnLoad();
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