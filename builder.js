require("esbuild")
    .build({
        entryPoints: ["calculator.ts"],
        bundle: true,
        minify: true,
        sourcemap: true,
        target: "es2015",        
        outfile: "dist/calculator.min.js",                
    })
    .catch(() => process.exit(1))