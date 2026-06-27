const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
const replacement = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256">
                                <circle cx="128" cy="128" r="96" fill="white" />
                                <path fill="var(--accent-green)"
                                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z">
                                </path>
                            </svg>`;
const regex1 = /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="20" height="20" fill="var\(--accent-(blue|orange)\)"\s*viewBox="0 0 256 256">\s*<path\s*d="M128,24A104.*?11\.32Z">\s*<\/path>\s*<\/svg>/g;
html = html.replace(regex1, replacement);
fs.writeFileSync('index.html', html);
console.log('Done!');
