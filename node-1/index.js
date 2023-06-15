const fs = require('fs')
const path = require('path')

function parseArgs() {
  let dir, depth
  for(let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]
    if (arg === '-d' || arg === '--depth') {
      depth = parseInt(process.argv[i+1]) - 1
      i++
    } else if (!dir) {
      dir = arg
    }
  }
  return [dir, depth]
}

function printTreeItem(p, currentDepth, isLast = false) {
  const parsed = path.parse(p)
  let prefix = Array(currentDepth-1).fill('│ ').join('')
  if (isLast) {
    prefix += '└──── '
  } else {
    prefix += '├──── '
  }
  console.log(`${prefix}${parsed.base}`)
}

function printTree(root, remainingDepth = 0, currentDepth = 1) {
    let counters = {files: 0, dirs: 0}
    const names = fs.readdirSync(root)
    const sortedPaths = names.map((n) => {
      const p = path.join(root, n)
      return { p, isDir: fs.lstatSync(p).isDirectory() }
    }).sort((a1, a2) => {
      if (a1.isDir === a2.isDir) return 0
      if (a1.isDir) return -1
      return 1
    })
    for(let i = 0, len = sortedPaths.length; i < len; i++) {
      printTreeItem(sortedPaths[i].p, currentDepth, i === len -1 )
      if (sortedPaths[i].isDir && remainingDepth > 0) {
        const treeCounters = printTree(sortedPaths[i].p, remainingDepth - 1, currentDepth + 1)
        counters.files += treeCounters.files
        counters.dirs += treeCounters.dirs
      }
      if (sortedPaths[i].isDir) {
        counters.dirs++
      } else {
        counters.files++
      }
    }
    return counters
}

const [ dir, depth ] = parseArgs()

if (!dir) {
  console.log('Dir path is required argument.')
} else if (!fs.existsSync(dir)) {
  console.log(`Wrong path "${dir}".`)
} else {
  console.log(dir)
  if (fs.lstatSync(dir).isDirectory()) {
    const counters = printTree(dir, depth)
    console.log(`${counters.dirs} directories, ${counters.files} files`)
  }
}

