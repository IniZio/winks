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

const {genBabel} = require('./scripts/babel')

const {resolve} = path

const {NODE_ENV} = process.env

const packages = {
  'winks': ['browser-runtime-dev', 'browser-runtime-prod', 'browser-runtime-cjs']
}

const flavours = {
  'browser-runtime-dev': {
    env: 'development',
    format: 'umd'
  },
  'browser-runtime-prod': {
    env: 'production',
    format: 'umd'
  },
  'browser-runtime-cjs': {
    env: 'production',
    format: 'cjs'
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

const dest = ({package, env, format}) =>
  resolve.apply(null, ['packages/', package, 'dist/', [package, formats[format], env === 'production' && 'min', 'js'].filter(Boolean).join('.')].filter(Boolean))

const genBuilds = builds => builds.map(genConfig)

const genConfig = build => {
  const config = {
    input: entry(build),
    external: build.external,
    plugins: [
      flow(),
      babel({
        exclude: 'node_modules/**',
        ...genBabel(build),
        ...build.babel
      }),
      minify({comments: build.env !== 'production'}),
      alias({...build.alias}),
      replace({
        'process.env.NODE_ENV': JSON.stringify(build.env)
      }),
      nodeResolve({main: true, jsnext: true}),
      commonjs({include: 'node_modules/**'}),
      ...build.plugins || []
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
              const watcher = watch(config.toJSON())
              watcher.on('event', event => {
                const handlers = {
                  START () {
                    clipped.print('Rebundling...')
                  },
                  END () {
                    clipped.print('Finished bundling')
                  },
                  ERROR () {
                    clipped.print('error')
                    clipped.print(event)
                  },
                  FATAL (e) {
                    clipped.print('fatality')
                    clipped.print(event)
                  }
                }
                handlers[event.code] && handlers[event.code]()
              })
            }
          )
        )
    })
}
