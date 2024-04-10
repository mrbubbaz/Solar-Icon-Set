const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const {JSDOM} = require('jsdom');
const xmlSerializer = new (require('xmldom').XMLSerializer)();
const cliProgress = require('cli-progress');

// crea una nuova barra di avanzamento
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

// get the path to the icons folder
const iconsPath = path.join(__dirname, './../icons/SVG');
const distPath = path.join(__dirname, './../dist');
const cssFilePath = path.join(distPath, 'icons.css');





// inizia la barra di avanzamento
progressBar.start(100, 0);


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
            // aggiorna la barra di avanzamento
            progressBar.update((i / files.length) * 100);
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
    progressBar.stop();
    return icons;
}

// list all icons in the first layer of directories in the iconsPath folder
const icons = iconsIterator(iconsPath);

fs.writeFileSync(path.join(__dirname, 'list.json'), JSON.stringify(icons, null, 2));
