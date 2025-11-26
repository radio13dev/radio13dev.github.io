// Global values
var isPortrait = false;

// Listen to window resize events and adjust the position of SVG elements accordingly
window.addEventListener('resize', adjustSVGPositions);
adjustSVGPositions(true); // Initial call to set positions on load

// Function
function adjustSVGPositions(forceUpdate = false) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    var newIsPortrait = aspectRatio <= 0.8;
    if (!forceUpdate && newIsPortrait == isPortrait) {
        // No change in orientation, skip adjustments
        return;
    }
    isPortrait = newIsPortrait;
    
    // Right Bottom hugs
    {
        var targetCX, targetCY;
        if (isPortrait) {
            // More vertical layout
            targetCX = "50%";
            targetCY = "100%";
        } else {
            // More horizontal layout
            targetCX = "100%";
            targetCY = "50%";
        }
        gsap.killTweensOf('.edge-hug-right-bottom');
        gsap.to('.edge-hug-right-bottom', {cx: targetCX, cy: targetCY, duration: 0.6, ease: "power2.out"});
    }

    // Right Bottom hugs 2
    {
        var targetLeft, targetTop, targetRight, targetBottom;
        if (isPortrait) {
            // More vertical layout
            targetLeft = "0%";
            targetRight = "0%"
            targetTop = "40vmin";
            targetBottom = "0%";
        } else {
            // More horizontal layout
            targetLeft = "40vmin";
            targetRight = "0%"
            targetTop = "0%";
            targetBottom = "0%";
        }
        gsap.killTweensOf('.area-hug-right-bottom');
        gsap.to('.area-hug-right-bottom', {left:targetLeft, right:targetRight, top:targetTop, bottom:targetBottom, duration: 0.6, ease: "power2.out"});
    }

    // Left Top hugs
    {
        var targetLeft, targetTop, targetRight, targetBottom;
        if (isPortrait) {
            // More vertical layout
            targetLeft = "0%";
            targetRight = "0%"
            targetTop = "0%";
            targetBottom = "60vmin";
        } else {
            // More horizontal layout
            targetLeft = "0%";
            targetRight = "60vmin"
            targetTop = "0%";
            targetBottom = "0%";
        }
        gsap.killTweensOf('.area-hug-left-top');
        gsap.to('.area-hug-left-top', {left:targetLeft, right:targetRight, top:targetTop, bottom:targetBottom, duration: 0.6, ease: "power2.out"});
    }
}