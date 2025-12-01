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
    isHidingEverything = false;
    if (gameLoadState && gameLoadState == 4)
    {
        // We actually gotta transition to the 'hide absolutely everything' state.
        isHidingEverything = true;
    }
    
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

    //// Right Bottom hugs 2
    //{
    //    var targetLeft, targetTop, targetRight, targetBottom;
    //    if (isPortrait) {
    //        // More vertical layout
    //        targetLeft = "0%";
    //        targetRight = "0%"
    //        targetTop = "40vmin";
    //        targetBottom = "0%";
    //    } else {
    //        // More horizontal layout
    //        targetLeft = "40vmin";
    //        targetRight = "0%"
    //        targetTop = "0%";
    //        targetBottom = "0%";
    //    }
    //    gsap.killTweensOf('.area-hug-right-bottom');
    //    gsap.to('.area-hug-right-bottom', {left:targetLeft, right:targetRight, top:targetTop, bottom:targetBottom, duration: 0.6, ease: "power2.out"});
    //}

    // Left Top hugs
    {
        var targetLeft, targetTop, targetRight, targetBottom;
        if (isPortrait) {
            // More vertical layout
            targetLeft = "0%";
            targetRight = "0%"
            targetTop = "0%";
            targetBottom = "60vmin";
            if (isHidingEverything)
            {
                targetLeft = "0%";
                targetRight = "0%"
                targetTop = "-60vmin";
                targetBottom = "100%";
            }
        } else {
            // More horizontal layout
            targetLeft = "0%";
            targetRight = "60vmin"
            targetTop = "0%";
            targetBottom = "0%";
            if (isHidingEverything)
            {
            targetLeft = "-60vmin";
            targetRight = "100%"
            targetTop = "0%";
            targetBottom = "0%";
            }
        }
        gsap.killTweensOf('.area-hug-left-top');
        gsap.to('.area-hug-left-top', {left:targetLeft, right:targetRight, top:targetTop, bottom:targetBottom, duration: 0.6, ease: "power2.out"});
    }

    //// Left Top hugs
    //{
    //    var targetCX, targetCY;
    //    if (isPortrait) {
    //        // More vertical layout
    //        targetCX = "50%";
    //        targetCY = "0%";
    //    } else {
    //        // More horizontal layout
    //        targetCX = "0%";
    //        targetCY = "50%";
    //    }
    //    gsap.killTweensOf('.edge-hug-left-top');
    //    gsap.to('div.edge-hug-left-top', {left: targetCX, top: targetCY, duration: 0.6, ease: "power2.out"});
    //}

    // Left Top hugs
    {
        if (loadingCover)
        {
            var rotation;
            if (isPortrait) {
                // More vertical layout
                rotation = 270;
            } else {
                // More horizontal layout
                rotation = 180;
            }
            if (loadingCover.style.display == "")
            {
                // Add 180 degrees
                rotation += 180;
            }
        }
        gsap.killTweensOf(loadingCover);
        gsap.to(loadingCover, {transformOrigin: "70 50%", rotation: rotation, duration: 0.6, ease: "power2.out"});
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