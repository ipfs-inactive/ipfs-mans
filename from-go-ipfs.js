// vim: set sw=2 ts=2 expandtab:
data = require('./docs')
fs = require('fs')
function work(path, obj) {
  try {
    fs.mkdirSync('src/' + path.slice(0, -1).join('/'))
  } catch (e) {}
  let ws = fs.createWriteStream('src/' + path.join('/') + '.yaml') 
  let w = function (ind, prefix, value) {
    ind = ' '.repeat(ind)
    prefix = prefix + ': ' 
    if (value == null || value == undefined) {
      if (arguments.length == 3) {
        value = 'null'
      } else {
        value = ''
      }
    }
    if (Array.isArray(value)) {
      value = '[ ' + value.join(', ') + ' ]';
    }
    if (typeof value === 'string') {
      value = value.trim()
      if ((value.match(/\n/) || []).length > 0) {
        // multiline
        prefix = prefix + '|\n'
        value = ind + '  ' + value.replace(/\n/g, '\n' + ind + '  ')
      }
      if (value.startsWith('\'') && !value.endsWith('\'')) {
        value = '\\' + value
      }
    }

    ws.write(ind + (prefix + value).trim() + '\n')
  }

  w(0, 'name', path[path.length-1])
  w(0, 'command', path.join(' '))

  if (obj.Options != undefined) {
    w(0, 'options')
    for (let i = obj.Options.length - 1; i >= 0; i--) {
      let opt = obj.Options[i];
      w(2, '- name', opt.Names[0])
      let alias = opt.Names.slice(1)
      if (alias.length = 1 && alias[0] != null) {
        w(4, 'alias', alias[0])
      } else if (alias.length > 1) {
        w(4, 'alias', alias)
      }
      w(4, 'type', opt.Type)
      if (opt.DefaultVal != false && opt.DefaultVal != null) {
        w(4, 'default', opt.DefaultVal)
      }
      w(4, 'description', opt.Description)
    }
  }

  if (obj.Arguments !== null) {
    w(0, 'arguments')
    for (let i = obj.Arguments.length - 1; i >= 0; i--) {
      let arg = obj.Arguments[i];
      w(2, '- name', arg.Name)
      let type = 'string'
      if (arg.Type == 1) {
        if (arg.Recursive === true) {
          type = 'file-recursive'
        } else {
          type = 'file'
        }
      }

      w(4, 'type', type)
      w(4, 'required', arg.Required)
      if (arg.Variadic === true) {
        w(4, 'variadic', true)
      }
      if (arg.Type == 1 && arg.SupportsStdin === true) {
        w(4, 'stdin', true)
      }
      w(4, 'description', arg.Description)
    }
  }

  w(0, 'help')
  w(2, 'tagline', obj.Helptext.Tagline)
  w(2, 'short', obj.Helptext.ShortDescription)
  w(2, 'long', obj.Helptext.LongDescription)


  ws.end()

  for (let i in obj.Subcommands) {
    work(path.concat(i), obj.Subcommands[i])
  }	
}

work(["ipfs"], data)
