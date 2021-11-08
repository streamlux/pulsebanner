# Remotion

An express app that uses Remotion to render images.

## Development

If you add a dependency, make sure to add it to the package.json in ./config.

## Building for production

The script [./scripts/build.ts](./scripts/build.ts) just copies the src files for this project into dist. Including the package.json and tsconfig.json from ./config.

This app actually uses a package called ts-node to run. Meaning it just runs the TypeScript files without bundling/compiling first. It then bundles the React code on the fly at startup, and we can even re-bundle it while the app is running. I setup an endpoint `/bundle` that handles GET/POST requests and upon request, it re-bundles the React code.
