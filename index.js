#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const argv = require('minimist')(process.argv.slice(2))

async function init() {
  const targetDir = argv._[0] || '.'
  const cwd = process.cwd()
  const root = path.join(cwd, targetDir)
  await fs.ensureDir(root)
  
  console.log(`Preparing landing in ${root}...`)

  const existing = await fs.readdir(root)
  if (existing.length) {
    console.error(`Error: target directory is not empty`)
    process.exit(1)
  }

  const template = path.join(__dirname, `template`)

  const copy = async (file) => {
    const source = path.join(template, file)
    const target = path.join(root, file)
    await fs.copy(source, target)
  }

  const write = async(file, content) => {
    const target = path.join(root, file)
    await fs.writeFile(target, content)
  }

  const files = await fs.readdir(template)
  for (let file of files.filter(f => f !== `package.json`)) { await copy(file) }

  const pkg = require(path.join(template, `package.json`))
  pkg.name = path.basename(root)
  await write(`package.json`, JSON.stringify(pkg, null, 2))

  console.log(`\nDone. Now run:\n`)
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`)
  }
  console.log(`  npm install`)
  console.log(`  npm run dev`)
  console.log()
}

init().catch(e => {
  console.error(e)
})
