
// Go over all 'connect-cable-lines' SVG elements and for each create a random number of cable lines that animate over time
const connectCableLineSVGs = document.querySelectorAll('svg.connect-cable-lines');
const generatedCableDiv = document.getElementById('generated-cable-div');
var cableLineCount = 0;
connectCableLineSVGs.forEach((svg) => {
    const numberOfCables = Math.floor(Math.random() * 3) + 2; // Between 2 and 4 cables
    for (let i = 0; i < numberOfCables; i++) {
        // Create a new path element
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const pathId = `cable-path-${String(cableLineCount).padStart(2, '0')}`;
        path.setAttribute("id", pathId);
        cableLineCount++;
        path.setAttribute("class", "cable-line draw-line-over-time");
        // Choose a random end point, which will be on the SVG bounds
        const horizontalEdge = Math.random() < 0.5;
        const verticalEdge = Math.random() < 0.5;
        const endX = horizontalEdge ? (verticalEdge ? 0 : svg.clientWidth) : Math.random() * svg.clientWidth;
        const endY = horizontalEdge ? Math.random() * svg.clientHeight : (verticalEdge ? 0 : svg.clientHeight);
        // Do a random walk 'away' from the center of the SVG to create control points
        // We have to record the points in a list because we'll need to reverse this to create the actual path.
        let currentX = endX;
        let currentY = endY;
        const steps = 4;
        const points = [];
        for (let step = 0; step < steps; step++) {
            points.push([currentX, currentY]);
            // Move away from center
            const centerX = svg.clientWidth / 2;
            const centerY = svg.clientHeight / 2;
            const dirX = currentX - centerX;
            const dirY = currentY - centerY;
            const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
            const normX = dirX / length;
            const normY = dirY / length;
            const moveDistance = 50 + Math.random() * 100;
            currentX += normX * moveDistance + (Math.random() - 0.5) * 100;
            currentY += normY * moveDistance + (Math.random() - 0.5) * 100;
        }
        // Now create the path data string
        let d = `M ${currentX},${currentY} `;
        // Add quadratic Bezier curves through the points in reverse order
        for (let p = points.length - 1; p >= 0; p--) {
            const [px, py] = points[p];
            d += `Q ${px},${py} ${px},${py} `;
        }

        path.setAttribute("d", d);
        generatedCableDiv.appendChild(path);

        // Also create a cable outline path
        const outlinePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        outlinePath.setAttribute("class", "cable-outline draw-line-over-time");
        outlinePath.setAttribute("d", d);
        generatedCableDiv.appendChild(outlinePath);

        // Finally, create the 'cable tip' that will follow the path
        const cableTip = document.createElementNS("http://www.w3.org/2000/svg", "use");
        cableTip.setAttribute("href", '#cable-tip');
        cableTip.setAttribute("class", "follow-path-over-time");
        cableTip.setAttribute("path-to-follow", `#${pathId}`);
        generatedCableDiv.appendChild(cableTip);
    }
});

// Find all the svg paths with the class 'draw-line-over-time'
const paths = document.querySelectorAll('path.draw-line-over-time');
paths.forEach((path) => {
    // Get the total length of the path
    const pathLength = path.getTotalLength();
    // Set up the stroke-dasharray and stroke-dashoffset to hide the path initially
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    // Animate the stroke-dashoffset to 0 over time to create a drawing effect
    gsap.to(path.style, {
        strokeDashoffset: 0,
        duration: 5, // Duration of the animation in seconds
        ease: "power1.inOut"
    });
});

            
// Now handle the 'follow-path-over-time' class. These objects should set their x/y position along the path over time, with the path chosen by the 'path-to-follow="#path-id"' attribute.
const followPaths = document.querySelectorAll('.follow-path-over-time');
followPaths.forEach((obj) => {
    const pathId = obj.getAttribute('path-to-follow');
    const path = document.querySelector(pathId);
    if (!path) {
        console.warn(`Path with id ${pathId} not found for follow-path-over-time element.`);
        return;
    }
    // Animate the x/y position of obj along the path over time
    gsap.to(obj, {
        motionPath: { path: pathId, align: pathId, autoRotate: true, alignOrigin: [0.5, 0.5] 
        },
        transformOrigin: "50% 50%",
        duration: 5, // Duration of the animation in seconds
        ease: "power1.inOut",
    });
});


