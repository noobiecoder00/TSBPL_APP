const fs = require("fs");
const path = require("path");

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, "../assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Create a simple SVG splash screen
const svgContent = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <text x="50%" y="50%" font-family="Arial" font-size="72" fill="#007AFF" text-anchor="middle" dominant-baseline="middle">
    TSBPL App
  </text>
</svg>
`;

// Write the SVG file
fs.writeFileSync(path.join(assetsDir, "splash.svg"), svgContent);

console.log("Splash screen SVG generated successfully!");
console.log(
  "Please convert this SVG to PNG using an image editor or online converter."
);
console.log('Save the PNG as "splash.png" in the assets directory.');
