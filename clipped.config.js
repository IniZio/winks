const path = require('path')
const {rollup, watch} = require('rollup')
const replace = require('rollup-plugin-replace')
const flow = require('rollup-plugin-flow')
const babel = require('rollup-plugin-babel')
const minify = require('rollup-plugin-babel-minify')
const buble = require('rollup-plugin-buble')
const alias = require('rollup-plugin-alias')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const {resolve} = path

const {NODE_ENV} = process.env

const packages = {
  'winks': ['browser-runtime-dev', 'browser-runtime-prod']
}

const flavours = {
  'browser-runtime-dev': {
    env: 'development',
    format: 'umd',
    plugins: [nodeResolve({main: true, jsnext: true}), commonjs({include: 'node_modules/**'})]
  },
  'browser-runtime-prod': {
    env: 'production',
    format: 'umd',
    plugins: [nodeResolve({main: true, jsnext: true}), commonjs({include: 'node_modules/**'})]
  }
}

const formats = {
  cjs: 'common',
  es: 'es',
  amd: 'amd',
  iife: 'iife',
  umd: null
}

const entry = ({package}) => resolve.apply(null, ['packages/', package, 'src/index.js'].filter(Boolean))

const dest = ({package, env, format, optimize = false}) =>
  resolve.apply(null, ['packages/', package, 'dist/', [package, formats[format], env === 'production' && 'min', 'js'].filter(Boolean).join('.')].filter(Boolean))

const genBuilds = builds => builds.map(genConfig)

const genConfig = build => {
  // NOTE: diffhtml presets uses NODE_ENV for format detection
  process.env.NODE_ENV = build.format

  const config = {
    input: entry(build),
    external: build.external,
    plugins: [
      flow(),
      babel({...build.babel}),
      minify({comments: build.env !== 'production'}),
      alias({...build.alias}),
      replace({
        'process.env.NODE_ENV': JSON.stringify(build.env)
      }),
      ...build.plugins
    ].filter(Boolean),
    output: {
      file: dest(build),
      format: build.format,
      banner: build.banner,
      name: build.moduleName || 'Winks'
    },
    watch: {}
  }
  return config
}

module.exports = clipped => {
  // clipped.config.winks = genBuilds(Object.keys(builds))
  clipped.config.winks = Object.keys(packages)
    // For each package name
    .reduce((configs, package) =>
    // For each flavour of the package
      [
        ...configs,
        ...(
          packages[package]
            .reduce((configs, flavour) => [...configs, genConfig({...flavours[flavour], package})], [])
        )
      ]
    , [])

  clipped.hook('build')
    .add('default', async clipped => {
        await Promise.all(
          clipped.config.winks.map(
            async config => {
              const bundle = await rollup(config.toJSON())
              await bundle.write(config.toJSON().output)
            }
          )
        )
    })

  clipped.hook('watch')
    .add('default', async clipped => {
        await Promise.all(
          clipped.config.winks.map(
            async config => {
              const watcher = await watch(config.toJSON())
              watcher.on('event', event => {
                const handlers = {
                  START () {
                    clipped.print('Rebundling...')
                  },
                  END () {
                    clipped.print('Finished bundling')
                  }
                }
                handlers[event.code] && handlers[event.code]()
              })
            }
          )
        )
    })
}
