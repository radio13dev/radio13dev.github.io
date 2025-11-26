
// Go over all 'connect-cable-lines' SVG elements and for each create a random number of cable lines that animate over time
const connectCableLineSVGs = document.querySelectorAll('svg.connect-cable-lines');
const generatedCableDiv = document.getElementById('generated-cable-div');
var cableLineCount = 0;
connectCableLineSVGs.forEach((svg) => {
    // Create a container div for the generated cable lines
    // <svg class="connect-cable-lines cable-lines-container">
    // </svg>
    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.setAttribute("class", "cable-lines-container");
    container.setAttribute("style", "width:max(30vmin,100%);height:20vmin;overflow: visible;");
    generatedCableDiv.appendChild(container);

    const numberOfCables = Math.floor(Math.random() * 3) + 2; // Between 2 and 4 cables
    for (let i = 0; i < numberOfCables; i++) {
        // Create a new path element
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const pathId = `cable-path-${String(cableLineCount).padStart(2, '0')}`;
        path.setAttribute("id", pathId);
        cableLineCount++;
        path.setAttribute("class", "cable-outline draw-line-over-time");
        // Choose a random end point, which will be on the SVG bounds
        const horizontalEdge = Math.random() < 0.5;
        const verticalEdge = Math.random() < 0.5;
        const endX = 0;//horizontalEdge ? (verticalEdge ? 0 : svg.clientWidth) : Math.random() * svg.clientWidth;
        const endY = 0;//horizontalEdge ? Math.random() * svg.clientHeight : (verticalEdge ? 0 : svg.clientHeight);
        // Do a random walk 'away' from the center of the SVG to create control points
        let currentX = endX;
        let currentY = endY;
        const steps = 10;
        let d = `m ${currentX},${currentY} `;
        for (let step = 0; step < steps; step++) {
            // Move away from center
            const centerX = svg.clientWidth / 2;
            const centerY = svg.clientHeight / 2;
            const dirX = currentX - centerX;
            const dirY = currentY - centerY;
            const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
            const normX = dirX / length;
            const normY = dirY / length;
            const moveDistance = 50;
            currentX += normX * moveDistance + (Math.random() - 0.5) * 100;
            currentY += normY * moveDistance + (Math.random() - 0.5) * 100;
            d += `q ${currentX},${currentY} ${currentX},${currentY} `; 
        }

        path.setAttribute("d", d);
        container.appendChild(path);

        // Also create a cable outline path
        const outlinePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        outlinePath.setAttribute("class", "cable-line draw-line-over-time");
        outlinePath.setAttribute("d", d);
        container.appendChild(outlinePath);

        // Finally, create the 'cable tip' that will follow the path
        const cableTip = document.createElementNS("http://www.w3.org/2000/svg", "use");
        cableTip.setAttribute("href", '#cable-tip');
        cableTip.setAttribute("class", "follow-path-over-time");
        cableTip.setAttribute("path-to-follow", `#${pathId}`);
        container.appendChild(cableTip);
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


