dev-build:
  npm run dev:watchAndBuild

[working-directory: 'docs']
dev-serve:
  jekyll serve

[parallel]
dev: dev-build dev-serve

build:
  npm run clean
  npm run build:js
  npm run build:builder
  npm run build:cleaner
  npm run build:jekyll
  npm run build:css
