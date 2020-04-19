try {
  const { writeFileSync, write } = require('fs')
  const patches = require('./deps-patch.json')
  const packageJSON = require('./package.json')
  packageJSON.dependencies = { ...packageJSON.dependencies, ...patches }
  writeFileSync('./package.json', JSON.stringify(packageJSON, null, 2), 'utf8')
  console.log('npm patch done for', Object.values(patches).join(', '))
} catch (err) {
  console.log('skipping npm patch')
}