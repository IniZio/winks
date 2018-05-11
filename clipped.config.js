const path = require('path')
const rollup = require('rollup')
const replace = require('rollup-plugin-replace')
const flow = require('rollup-plugin-flow')
const babel = require('rollup-plugin-babel')
const buble = require('rollup-plugin-buble')
const alias = require('rollup-plugin-alias')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const {resolve} = path

const {NODE_ENV} = process.env;

const builds = {
  'core-runtime-dev': {
    entry: resolve('packages/winks/index.js'),
    dest: resolve('dist/winks.min.js'),
    env: 'development',
    format: 'umd',
    plugins: [nodeResolve({main: true, jsnext: true}), commonjs({include: 'node_modules/**'})]
  }
}

const genBuilds = builds => builds.map(genConfig)

const genConfig = build => {
  // NOTE: diffhtml presets uses NODE_ENV for format detection
  process.env.NODE_ENV = build.format

  const config = {
    input: build.entry,
    external: build.external,
    plugins: [
      flow(),
      babel({...build.babel}),
      alias({...build.alias}),
      replace({
        'process.env.NODE_ENV': JSON.stringify(build.env)
      }),
      ...build.plugins
    ].filter(Boolean),
    output: {
      file: build.dest,
      format: build.format,
      banner: build.banner,
      name: build.moduleName || 'Winks'
    }
  }
  return config
}

module.exports = clipped => {
  clipped.config.winks = genBuilds(Object.values(builds))

  // console.log(clipped.config.winks.toJSON())

  clipped.hook('build')
    .add('default', async clipped => {
        await Promise.all(
          clipped.config.winks.map(
            async config => {
              const bundle = await rollup.rollup(config.toJSON())
              await bundle.write(config.toJSON().output)
            }
          )
        )
    })
}
