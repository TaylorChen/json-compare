import JsonDiff from './components/JsonDiff.vue'

// Vue plugin install function
function install(app, options = {}) {
  const componentName = options.name || 'JsonDiff'
  app.component(componentName, JsonDiff)
}

export { JsonDiff }
export default { install }


