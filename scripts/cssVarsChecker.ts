import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import postcssValueParser from 'postcss-value-parser'
import { Plugin } from 'vite'

function extractDefinedVars(css: string): Set<string> {
  const vars = new Set<string>()
  postcss.parse(css).walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      vars.add(decl.prop)
    }
  })
  return vars
}

function extractUsedVars(css: string): Set<string> {
  const vars = new Set<string>()
  postcss.parse(css).walkDecls((decl) => {
    const parsed = postcssValueParser(decl.value)
    parsed.walk((node) => {
      if (node.type === 'function' && node.value === 'var') {
        const name = node.nodes[0]?.value
        if (name?.startsWith('--')) {
          vars.add(name)
        }
      }
    })
  })
  return vars
}

function extractStyleBlocksFromVue(source: string): string[] {
  const styles: string[] = []
  const styleRE = /<style[^>]*>([\s\S]*?)<\/style>/gi

  let match: RegExpExecArray | null
  while ((match = styleRE.exec(source))) {
    const styleContent = match[1]
    if (styleContent !== undefined) {
      styles.push(styleContent)
    }
  }

  return styles
}

export function checkCssVarsPlugin(options: { tokensPath: string }): Plugin {
  return {
    name: 'check-css-vars',
    apply: 'build',
    buildStart() {
      const tokensCss = fs.readFileSync(options.tokensPath, 'utf-8')
      const defined = extractDefinedVars(tokensCss)

      const used = new Set<string>()

      const walk = (dir: string) => {
        for (const file of fs.readdirSync(dir)) {
          const full = path.join(dir, file)
          if (fs.statSync(full).isDirectory()) {
            walk(full)
          } else if (full.endsWith('.css')) {
            const content = fs.readFileSync(full, 'utf-8')
            extractUsedVars(content).forEach((v) => used.add(v))
          } else if (full.endsWith('.vue')) {
            const content = fs.readFileSync(full, 'utf-8')
            const styles = extractStyleBlocksFromVue(content)

            for (const css of styles) {
              extractUsedVars(css).forEach((v) => used.add(v))
            }
          }
        }
      }

      walk(path.resolve('src'))

      const undefinedVars = [...used].filter((v) => !defined.has(v))

      if (undefinedVars.length > 0) {
        this.error(`Undefined CSS variables detected:\n` + undefinedVars.map((v) => `  ${v}`).join('\n'))
      }
    },
  }
}
