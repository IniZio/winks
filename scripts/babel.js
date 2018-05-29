const PresetEnv = require('babel-preset-env')
const ObjectRestSpread = require('babel-plugin-transform-object-rest-spread')
const ClassProperties = require('babel-plugin-transform-class-properties')
const TransformElementClasses = require('babel-plugin-transform-custom-element-classes')
const ModulesCommonJS = require('babel-plugin-transform-es2015-modules-commonjs')
const AddModuleExports = require('babel-plugin-add-module-exports')
const TransformClasses = require('babel-plugin-transform-es2015-classes')
const ExternalHelpers = require('babel-plugin-external-helpers')

module.exports.genBabel = ({format}) => {
  let presets = [], plugins = [
    ExternalHelpers
  ]

  switch (format) {
    case 'umd':
      presets = [
        ...presets,
        [PresetEnv, {modules: false}]
      ]
      plugins = [
        ...plugins,
        ObjectRestSpread,
        ClassProperties,
        TransformElementClasses,
        TransformClasses
      ]
      break
    case 'cjs':
      plugins = [
        ...plugins,
        // AddModuleExports,
        // ModulesCommonJS,
        ObjectRestSpread,
        ClassProperties,
        TransformElementClasses,
        TransformClasses
      ]
  }

  return {presets, plugins}
}
