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
    
    var newIsPortrait = aspectRatio <= 0.72;
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
            targetCY = "0%";
        } else {
            // More horizontal layout
            targetCX = "0%";
            targetCY = "50%";
        }
        gsap.killTweensOf('.edge-hug-right-bottom');
        gsap.to('div.edge-hug-right-bottom', {right: targetCX, bottom: targetCY, duration: 0.6, ease: "power2.out"});
        //gsap.to('text.edge-hug-right-bottom', {x: targetCX, y: targetCY, duration: 0.6, ease: "power2.out"});
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

    // Left Top hugs
    {
        var targetTransform;
        if (isPortrait) {
            // More vertical layout
            targetTransform = "matrix(0,1,-1,0,0,0)";
        } else {
            // More horizontal layout
            targetTransform = "matrix(1,0,0,1,0,0)";
        }
        gsap.killTweensOf('.rotate-hug-right-bottom');
        gsap.to('.rotate-hug-right-bottom', {transform:targetTransform, duration: 0.6, ease: "power2.out"});
    }

    // Update all the scale-with-vmin elements
    // - Evaluate vmin
    const vmin = Math.min(window.innerWidth, window.innerHeight);

    // - Do scaling
    const scaleElements = document.querySelectorAll('.scale-with-vmin');
    scaleElements.forEach((el) => {
        el.style.transform = 'translate(0) scale(' + (vmin/1000) + ')';
    });
}