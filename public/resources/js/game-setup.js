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
const loadingCover = document.querySelector("#loading-cover");
const progressBarEmpty = document.querySelector("#unity-progress-bar-empty");
const progressBarFull = document.querySelector("#unity-progress-bar-full");
const fullscreenButton = document.querySelector("#unity-fullscreen-button");
const spinner = document.querySelector('.spinner');

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

function gameOnLoad() {
    createUnityInstance(canvas, config, (progress) => {
        spinner.style.display = "none";
        progressBarEmpty.style.display = "";
        progressBarFull.style.width = `${100 * progress}%`;
    }).then((instance) => {
        unityInstance = instance; // store the instance globally

        loadingCover.style.display = "none";
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