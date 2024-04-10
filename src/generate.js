const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const {JSDOM} = require('jsdom');
const xmlSerializer = new (require('xmldom').XMLSerializer)();

// get the path to the icons folder
const iconsPath = path.join(__dirname, './../icons/SVG');
const distPath = path.join(__dirname, './../dist');
const cssFilePath = path.join(distPath, 'icons.css');

const classPrefix = 'sa';

const getIconsFromDir = (dir, category) => {
    let icons = [];
    const files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
        const fullPath = path.join(dir, files[i]);
        if (fs.lstatSync(fullPath).isDirectory()) {
            icons = icons.concat(getIconsFromDir(fullPath, category));
        } else if (files[i].endsWith('.svg')) {
            const svgString = fs.readFileSync(fullPath, 'utf-8');
            const dom = new JSDOM(svgString, {contentType: 'image/svg+xml'});
            const svgDoc = dom.window.document;
            const paths = svgDoc.querySelectorAll('path');
            paths.forEach(path => {
                let fill;
                if (path.hasAttribute('fill')) {
                    if (path.hasAttribute('opacity')) {
                        const opacity = parseFloat(path.getAttribute('opacity'));
                        const grayValue = Math.floor(opacity * 255).toString(16).padStart(2, '0');
                        fill = `#${grayValue}${grayValue}${grayValue}`;
                    } else {
                        fill = '#000000';
                    }
                    path.setAttribute('fill', fill);
                }
            });
            const modifiedSvgString = xmlSerializer.serializeToString(svgDoc);
            const distSvgPath = path.join(distPath, "icons" ,path.relative(iconsPath, fullPath));
            fs.mkdirSync(path.dirname(distSvgPath), {recursive: true});
            fs.writeFileSync(distSvgPath, modifiedSvgString);

            const fileName = files[i].replace('.svg', '');
            const relativePath = path.relative(path.dirname(cssFilePath), distSvgPath);
            icons.push({
                fullPath: relativePath,
                fileName,
                slug: slugify(fileName, {lower: true, strict : true, remove: /[*+~.()'"!:@]/g}),
                category: category.toLowerCase()
            });
        }
    }
    return icons;
}

const iconsIterator = (dir) => {
    let icons = {};
    const files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
        const fullPath = path.join(dir, files[i]);
        if (fs.lstatSync(fullPath).isDirectory()) {
            icons[files[i]] = getIconsFromDir(fullPath, files[i]);
        }
    }
    return icons;
}

// list all icons in the first layer of directories in the iconsPath folder
const icons = iconsIterator(iconsPath);

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



cssContent += `--icon-color: #000000;\n`;


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
    <link rel="stylesheet" type="text/css" href="icons.css">
</head>
<body>
`;

for (const category in icons) {
    for (const icon of icons[category]) {
        const className = `${classPrefix} ${icon.slug} ${icon.category}`;
        htmlContent += `<div class="${className}"></div>\n`;
    }
}

htmlContent += `
</body>
</html>
`;

// Write HTML content to a file
fs.writeFileSync(path.join(distPath, 'preview.html'), htmlContent);