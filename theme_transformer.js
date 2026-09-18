const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // 1. Core Backgrounds (Dark -> Light)
            content = content.replace(/bg-\[\#0b0a10\]/g, 'bg-surface-muted');
            content = content.replace(/bg-dark-bg/g, 'bg-white');
            content = content.replace(/bg-white\/5/g, 'bg-surface-muted hover:bg-secondary/20');
            content = content.replace(/bg-white\/10/g, 'bg-secondary/30');
            
            // 2. Borders
            content = content.replace(/border-dark-bg/g, 'border-surface-border');
            content = content.replace(/border-\[\#08566E\]/g, 'border-secondary/50');
            content = content.replace(/border-white\/10/g, 'border-surface-border');
            content = content.replace(/border-white\/5/g, 'border-surface-border');
            
            // 3. Text & Typography
            content = content.replace(/text-\[\#B4DBDC\]/g, 'text-slate-600');
            content = content.replace(/text-white/g, 'text-primary'); // Most text-white in dark mode should be dark now, EXCEPT in buttons. We'll fix buttons separately.
            
            // Restore text-white on primary buttons (bg-primary)
            content = content.replace(/bg-primary(.*?)text-primary/g, 'bg-primary$1text-white');
            content = content.replace(/from-primary(.*?)text-primary/g, 'from-primary$1text-white');
            
            // 4. Overhaul specific components visually
            // Drop shadows instead of glow
            content = content.replace(/shadow-glow-[a-z]+/g, 'shadow-md shadow-primary/10');
            content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm shadow-primary/5');
            content = content.replace(/blur-xl/g, 'blur-none');
            content = content.replace(/blur-2xl/g, 'blur-none');
            
            // 5. Replace specific dark mode hexes that might still linger
            content = content.replace(/#0b0a10/g, '#f8fafc');
            content = content.replace(/#15121e/g, '#ffffff');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Transformed: ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log("Theme transformation completed.");
