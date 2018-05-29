export function path (paths = '', obj) {
  paths = Array.isArray(paths) ? paths : paths.split('.')
  let val = obj
  let idx = 0
  while (idx < paths.length) {
    if (val == null) {
      return
    }
    val = val[paths[idx]]
    idx += 1
  }
  return val
}

export function set (paths, value, obj) {
  var schema = obj
  var pList = Array.isArray(paths) ? paths : paths.split('.')
  var len = pList.length
  for (var i = 0; i < len - 1; i++) {
    var elem = pList[i]
    if (!schema[elem]) schema[elem] = {}
    schema = schema[elem]
  }

  schema[pList[len - 1]] = value
}
