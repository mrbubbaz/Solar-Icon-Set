const fs = require('fs');
const path = require('path');
const distPath = path.join(__dirname, './../dist');
const cssFilePath = path.join(distPath, 'icons.css');
const icons = JSON.parse(fs.readFileSync(path.join(__dirname, './list.json'), 'utf-8'));
const classPrefix = 'sa';
let cssContent = '';


const iconSizes = {
    'xs': '12px',
    'sm': '16px',
    'md': '24px',
    'lg': '32px',
    'xl': '48px',
    '2xl': '64px',
    '3xl': '96px',
    '4xl': '128px',
    '5xl': '192px',
    '6xl': '256px',
    '7xl': '384px',
    '8xl': '512px'
}



cssContent += `:root {\n`;
cssContent += `--icon-color: #000000;\n`;
cssContent += `}\n`;

cssContent += `.${classPrefix} {\n`;
cssContent += `  display: inline-block;\n`;
cssContent += `  mask-size: contain;\n`;
cssContent += `  -webkit-mask-size: contain;\n`;
cssContent += `  mask-repeat: no-repeat;\n`;
cssContent += `  -webkit-mask-repeat: no-repeat;\n`;
cssContent += `  mask-position: center;\n`;
cssContent += `  -webkit-mask-position: center;\n`;
cssContent += ` background-color : var(--icon-color);\n`;
cssContent += ` width: 24px;\n`;
cssContent += ` height: 24px;\n`;
cssContent += `}\n`;

Object.entries(iconSizes).forEach(([size, value]) => {
    cssContent += `.${classPrefix}-${size} {\n`;
    cssContent += `  width: ${value};\n`;
    cssContent += `  height: ${value};\n`;
    cssContent += `}\n`;
})

for (const category in icons) {
    for (const icon of icons[category]) {
        const className = `.${classPrefix}.${classPrefix}-${icon.slug}.${icon.category}`;
        cssContent += `${className} {\n`;
        cssContent += `  mask-image: url('${icon.fullPath}');\n`;
        cssContent += `  -webkit-mask-image: url('${icon.fullPath}');\n`;
        cssContent += `}\n`;
    }
}

fs.writeFileSync(cssFilePath, cssContent);


// Generate HTML preview
let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="icons.css">
</head>
<body>
`;

for (const category in icons) {
    htmlContent += `<h2>${category}</h2>\n`;
    htmlContent += `<div class="row">\n`;
    for (const icon of icons[category]) {
        const className = `${classPrefix} ${classPrefix}-${icon.slug} ${icon.category}`;
        htmlContent += `<div class="col">\n`;
        htmlContent += `<div class="${className}"></div>\n`;
        htmlContent += `<p>${className}</p>\n`;
        htmlContent += `</div>\n`;
    }
    htmlContent += `</div>\n`;
}

htmlContent += `
</body>
</html>
`;

// Write HTML content to a file
fs.writeFileSync(path.join(distPath, 'preview.html'), htmlContent);