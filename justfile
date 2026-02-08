dev-build:
  npm run dev:watchAndBuild

[working-directory: 'docs']
dev-serve:
  jekyll serve

[parallel]
dev: dev-build dev-serve

build:
  fennel src/clm-stats.fnl
  npm run build:css
