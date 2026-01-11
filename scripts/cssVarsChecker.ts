/**
 * # Vue SFC's cssVarsChecker
 *
 * A Vite plugin for detecting undefined CSS variables in Vue SFC scoped styles.

 * > NOTE: The CSS file that can be used as the source of defined variables is only one.
 * >       Of course, it is better to avoid defining multiple files.
 *
 * ## Usage
 *
 * ``` vite.config.ts
 * import vue from '@vitejs/plugin-vue'
 * import { defineConfig } from 'vite'
 * import vueDevTools from 'vite-plugin-vue-devtools'
 *
 * import { checkCssVarsPlugin } from './scripts/cssVarsChecker'
 *
 * export default defineConfig({
 *   plugins: [
 *     vue(),
 *     vueDevTools(),
 *     checkCssVarsPlugin({
 *       style: 'src/assets/main.css',
 *     }),
 *   ],
 * })
 * ```
 *
 * ## Run
 *
 * ```bash
 * $ vite build
 *
 * (node:22878) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
 * (Use `node --trace-deprecation ...` to show where the warning was created)
 * vite v7.3.1 building record environment for production...
 * ✓ 0 modules transformed.
 * ✗ Build failed in 18ms
 * error during build:
 * [check-css-vars] [plugin check-css-vars] Undefined CSS variables detected:
 *
 * --neutral-600
 *   at /Path/to:24:5
 * ```
 *
 **/

import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import postcssValueParser from 'postcss-value-parser'
import { Plugin } from 'vite'

type Usage = {
  file: string
  line: number
  column: number
}

function extractDefinedVars(css: string): Set<string> {
  const vars = new Set<string>()
  postcss.parse(css).walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      vars.add(decl.prop)
    }
  })
  return vars
}

function extractUsedVars(css: string, file: string): Map<string, Usage[]> {
  const result = new Map<string, Usage[]>()
  const root = postcss.parse(css, { from: file })

  root.walkDecls((decl) => {
    const parsed = postcssValueParser(decl.value)

    parsed.walk((node) => {
      if (node.type !== 'function' || node.value !== 'var') return

      const name = node.nodes[0]?.value
      if (!name?.startsWith('--')) return

      const pos = decl.source?.start
      if (!pos) return

      const list = result.get(name) ?? []
      list.push({
        file,
        line: pos.line,
        column: pos.column,
      })
      result.set(name, list)
    })
  })

  return result
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

export function checkCssVarsPlugin(options: { style: string }): Plugin {
  return {
    name: 'check-css-vars',
    apply: 'build',

    buildStart() {
      const tokensCss = fs.readFileSync(options.style, 'utf-8')
      const defined = extractDefinedVars(tokensCss)

      const used = new Map<string, Usage[]>()

      const merge = (from: Map<string, Usage[]>) => {
        for (const [name, usages] of from) {
          const list = used.get(name) ?? []
          list.push(...usages)
          used.set(name, list)
        }
      }

      const walk = (dir: string) => {
        for (const file of fs.readdirSync(dir)) {
          const full = path.join(dir, file)

          if (fs.statSync(full).isDirectory()) {
            walk(full)
            continue
          }

          if (full.endsWith('.css')) {
            const content = fs.readFileSync(full, 'utf-8')
            merge(extractUsedVars(content, full))
          }

          if (full.endsWith('.vue')) {
            const content = fs.readFileSync(full, 'utf-8')
            for (const css of extractStyleBlocksFromVue(content)) {
              merge(extractUsedVars(css, full))
            }
          }
        }
      }

      walk(path.resolve('src'))

      const errors: string[] = []

      for (const [name, usages] of used) {
        if (defined.has(name)) continue

        errors.push(`\n${name}`)
        for (const u of usages) {
          errors.push(`  at ${u.file}:${u.line}:${u.column}`)
        }
      }

      if (errors.length > 0) {
        this.error({
          message: `Undefined CSS variables detected:\n` + errors.join('\n'),
          stack: '',
        })
      }
    },
  }
}
