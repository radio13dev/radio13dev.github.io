const DEVMODE = true;

const hideFullScreenButton = "";
const buildUrl = "/media/game";
const loaderUrl = buildUrl + "/Build/Survivor.WebGL.loader.js";
const config = {
    buildUrl: buildUrl,
    dataUrl: buildUrl + "/Build/Survivor.WebGL.data.br",
    frameworkUrl: buildUrl + "/Build/Survivor.WebGL.framework.js.br",
    codeUrl: buildUrl + "/Build/Survivor.WebGL.wasm.br",
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

function spinSpinner(toFastDuration = 0.2, fastDuration = 0.1, toSlowDuration = 1) {
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
        duration: toFastDuration,
        ease: 'circ.out'
    });
    gsap.to(spinTween, {
        timeScale: 1,
        duration: toSlowDuration,
        delay: toFastDuration + fastDuration,
        ease: 'circ.out'
    });
}

var currentSpinnerText;
function updateSpinnerText(newText) {
    // The spinner text elements should only be updated when the elements are off screen (i.e., not visible to the user).
    // We'll keep trying until each spinner has been updated.
    currentSpinnerText = newText;
    const spinnerTexts = document.querySelectorAll('.spinner-text');
    spinnerTexts.forEach(textEl => updateSpinnerText_Element(textEl));
}

function updateSpinnerText_Element(textEl) {
    // Check if the element is visible on screen
    const rect = textEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right < 0 || rect.left > window.innerWidth) {
        // Element is off screen, safe to update
        textEl.textContent = currentSpinnerText;
    } else {
        // Element is on screen, try again after a short delay
        setTimeout(() => {
            updateSpinnerText_Element(textEl);
        }, 100);
    }
}

var gameLoadState = -1;
var circleExpandTL;
var circleShrinkTL;
var gShrinkTL;
var leftTopOffsetTL;

function gameButtonPress() {
    spinSpinner();
    if (gameLoadState == 0) {
        // Nothing, waiting for ready
    }
    else if (gameLoadState == 1) {
        setGameLoadState(2);
        // Start load. Not doing this from the game state thing because that's mostly for animations.
        gameOnLoad();
    }
    else if (gameLoadState == 2) {
        // Nothing, controlled by gameOnLoad();
    }
    else if (gameLoadState == 3) {
        setGameLoadState(4);
    }
    else if (gameLoadState == 4) {
        setGameLoadState(3);
    }
}

function loaderReady() {
    setGameLoadState(1);
    updateSpinnerText("GAME");
    spinSpinner();
    document.querySelector("#game-button").classList.add("button");
}

function gameOnLoad() {
    if (DEVMODE)
    {
        container.style.display = "none";
        var len = progressBar.getTotalLength();
        progressBar.style.strokeDasharray = len;
        progressBar.style.strokeDashoffset = len; // Only load to the 0.75 mark
        gsap.timeline().fromTo(progressBar, { strokeDashoffset: len }, { strokeDashoffset: len*1.75, duration: 2, onComplete: () => setGameState(1) } );
        return;
    }
    
    createUnityInstance(canvas, config, (progress) => {
        container.style.display = "none";
        loadingCover.style.display = "";
        var len = progressBar.getTotalLength();
        progressBar.style.strokeDasharray = len;
        progressBar.style.strokeDashoffset = len + (progress * len * 0.75); // Only load to the 0.75 mark
    }).then((instance) => {
        unityInstance = instance; // store the instance globally

        // Display game container
        container.style.display = "";

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

function setGameState(state){
        setGameLoadState(3);
        spinSpinner();
        
        // When game reports a '1' loading is done.
        gsap.killTweensOf(progressBar);
        gsap.timeline().to(progressBar.style, { strokeDashoffset: progressBar.getTotalLength() * 2, duration: 0.5 });
}

function setGameLoadState(state){
    if (gameLoadState == state) return;

    gameLoadState = state;

    var gameButton = document.querySelector("#game-button");
    if (gameLoadState == 0){
        // Update text
        updateSpinnerText("LOADING");
        // Initial state has disabled button
        gameButton.classList.remove("button");
        gameButton.classList.add("button-loading");
    }
    else if (gameLoadState == 1){
        // Update text
        updateSpinnerText("GAME");
        // Enable the button
        gameButton.classList.add("button");
        gameButton.classList.remove("button-loading");
    }
    else if (gameLoadState == 2){
        // Update text
        updateSpinnerText("LOADING");
        // Disable button
        gameButton.classList.remove("button");
        gameButton.classList.add("button-loading");

        gsap.killTweensOf(progressBar);
        loadingCover.style.display = "";
        gsap.timeline()
            .to(loadingCover, {
                transformOrigin: "70 50%", rotation: "+=180", duration: 0.8, ease: "back.out"
            });
    }
    else if (gameLoadState == 3){
        // Update text
        updateSpinnerText("PLAY");
        // Enable button
        gameButton.classList.add("button");
        gameButton.classList.remove("button-loading");

        // If if the anims exist, reverse them
        if (circleExpandTL && !circleExpandTL.reversed()) circleExpandTL.reverse();
        if (circleShrinkTL && !circleShrinkTL.reversed()) circleShrinkTL.reverse();
        if (gShrinkTL && !gShrinkTL.reversed()) gShrinkTL.reverse();
        if (leftTopOffsetTL && !leftTopOffsetTL.reversed()) leftTopOffsetTL.reverse();
        if (adjustSVGPositions) adjustSVGPositions(true);
    }
    else if (gameLoadState == 4){
        // Button doesn't need changing

        // Transition to game full screen:
        if (progressBar.style.display != "none")
        {
            spinSpinner(0.2, 5, 0.3);
            gsap.killTweensOf(progressBar);
            gsap.timeline()
                .to(loadingCover, {
                    transformOrigin: "70 50%", rotation: "+=180", duration: 0.6, ease: "back.in",
                    onComplete: () => {
                        // Play animation that hides loading cover over time
                        loadingCover.style.display = "none";
                        initEnterGameAnimation();
                    }
                }).set(loadingCover, { display: "none" });
        }
        else
            initEnterGameAnimation();
        
        function initEnterGameAnimation()
        {
            if (circleExpandTL){
                if (circleExpandTL.reversed()) circleExpandTL.play();
            }
            else{
                circleExpandTL = gsap.timeline();
                circleExpandTL.to("circle.expand-on-game-start",
                    {
                        r: "*=4",
                        duration: 1,
                        ease: 'circ.in',
                    }
                ).set("circle.expand-on-game-start", { display: "none" })
                .set(".disable-on-game-start", { display: "none" });
            }

            if (circleShrinkTL){
                if (circleShrinkTL.reversed()) circleShrinkTL.play();
            }
            else{
                circleShrinkTL = gsap.timeline();
                circleShrinkTL.to("circle.shrink-on-game-start",
                {
                    r: 0,
                    duration: 1,
                    ease: 'circ.in',
                })
                .set("circle.shrink-on-game-start", { display: "none" });
            }

            if (gShrinkTL){
                if (gShrinkTL.reversed()) gShrinkTL.play();
            }
            else{
                gShrinkTL = gsap.timeline();
                gShrinkTL.fromTo("g.shrink-on-game-start",
                {
                    transformOrigin: "50% 50%",
                    scale: 1
                },
                {
                    transformOrigin: "50% 50%",
                    scale: 0,
                    duration: 1,
                    ease: 'circ.in'
                }
                ).set("g.shrink-on-game-start", { display: "none" });
            }

            if (leftTopOffsetTL){
                if (leftTopOffsetTL.reversed()) leftTopOffsetTL.play();
            }
            else{
                leftTopOffsetTL = gsap.timeline();
                leftTopOffsetTL.to(".game-state-offset-left-top",
                    {
                        left: "-100%",
                        top: "-100%",
                        duration: 1,
                        ease: 'circ.in',
                    }
                );
            }
            if (adjustSVGPositions) adjustSVGPositions(true);
        }
    }
}

// Init
setGameLoadState(0);

if (DEVMODE)
{
    loaderReady();
}