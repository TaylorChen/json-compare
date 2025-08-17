<template>
  <div :class="['jso-wrapper', themeClass]">
    <div class="jso-toolbar">
      <div class="jso-group">
        <button class="jso-btn" @click="newLeft">新建(左)</button>
        <button class="jso-btn" @click="newRight">新建(右)</button>
        <button class="jso-btn" @click="swapEditors">交换</button>
        <button class="jso-btn" @click="copyLeftToRight">左→右</button>
        <button class="jso-btn" @click="copyRightToLeft">右→左</button>
      </div>
      <div class="jso-group">
        <label>模式(左)
          <select v-model="leftMode" @change="recreateLeft">
            <option value="tree">树</option>
            <option value="code">代码</option>
            <option value="text">文本</option>
          </select>
        </label>
        <label>模式(右)
          <select v-model="rightMode" @change="recreateRight">
            <option value="tree">树</option>
            <option value="code">代码</option>
            <option value="text">文本</option>
          </select>
        </label>
      </div>
      <div class="jso-group">
        <button class="jso-btn" @click="formatLeft">格式化(左)</button>
        <button class="jso-btn" @click="minifyLeft">压缩(左)</button>
        <button class="jso-btn" @click="sortLeft">排序(左)</button>
        <button class="jso-btn" @click="formatRight">格式化(右)</button>
        <button class="jso-btn" @click="minifyRight">压缩(右)</button>
        <button class="jso-btn" @click="sortRight">排序(右)</button>
      </div>
      <div class="jso-group">
        <button class="jso-btn" @click="escapeLeft">转义(左)</button>
        <button class="jso-btn" @click="unescapeLeft">去转义(左)</button>
        <button class="jso-btn" @click="repairLeft">修复(左)</button>
        <button class="jso-btn" @click="escapeRight">转义(右)</button>
        <button class="jso-btn" @click="unescapeRight">去转义(右)</button>
        <button class="jso-btn" @click="repairRight">修复(右)</button>
      </div>
      <div class="jso-group">
        <button class="jso-btn" @click="expandAll">全部展开</button>
        <button class="jso-btn" @click="collapseAll">全部折叠</button>
        <label>缩进
          <select v-model.number="indent">
            <option :value="2">2</option>
            <option :value="4">4</option>
          </select>
        </label>
        <label>
          <input type="checkbox" v-model="syncScroll"/>
          同步滚动
        </label>
        <label>
          <input type="checkbox" v-model="isDark" @change="toggleTheme"/>
          深色
        </label>
      </div>
      <div class="jso-group">
        <button class="jso-btn" @click="openFile('left')">打开(左)</button>
        <button class="jso-btn" @click="saveFile('left')">下载(左)</button>
        <button class="jso-btn" @click="openFile('right')">打开(右)</button>
        <button class="jso-btn" @click="saveFile('right')">下载(右)</button>
        <button class="jso-btn primary" @click="compare">对比</button>
        <button class="jso-btn" @click="shareUrl">分享链接</button>
      </div>
      <div class="jso-group">
        <label>JMESPath
          <input v-model="jmesExpr" placeholder="例如：items[?price>10]" class="jso-input"/>
        </label>
        <button class="jso-btn" @click="applyJmes('left')">应用到左</button>
        <button class="jso-btn" @click="applyJmes('right')">应用到右</button>
      </div>
    </div>

    <div class="jso-editors">
      <div class="jso-editor" ref="leftContainer"></div>
      <div class="jso-editor" ref="rightContainer"></div>
    </div>

    <div v-if="diffHtml" class="jso-diff" v-html="diffHtml"></div>

    <input ref="fileInputLeft" type="file" accept="application/json,.json,.txt" style="display:none" @change="onPickFile('left', $event)"/>
    <input ref="fileInputRight" type="file" accept="application/json,.json,.txt" style="display:none" @change="onPickFile('right', $event)"/>
  </div>
  
</template>

<script>
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'
import 'ace-builds/src-min-noconflict/ace'
import 'ace-builds/src-min-noconflict/mode-json'
import 'ace-builds/src-min-noconflict/ext-searchbox'
import 'ace-builds/src-min-noconflict/theme-textmate'
import 'ace-builds/src-min-noconflict/theme-tomorrow_night'
import { saveAs } from 'file-saver'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { cloneDeep } from 'lodash'
import { diff as jsondiff } from 'jsondiffpatch'
import { format as formatHtml } from 'jsondiffpatch/formatters/html'
import { jsonrepair } from 'jsonrepair'
import jmespath from 'jmespath'
import '@/assets/jsondiffpatch-html.css'

export default {
  data() {
    return {
      left: null,
      right: null,
      leftMode: 'tree',
      rightMode: 'tree',
      indent: 2,
      isDark: false,
      syncScroll: true,
      diffHtml: '',
      lastScrollLeft: 0,
      lastScrollTop: 0,
      jmesExpr: '',
    }
  },
  computed: {
    themeClass() {
      return this.isDark ? 'jso-dark' : 'jso-light'
    }
  },
  mounted() {
    this.createEditors()
    this.restoreFromHash()
    this.bindSyncScroll()
    window.addEventListener('hashchange', this.restoreFromHash)
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.restoreFromHash)
  },
  methods: {
    createEditors() {
      if (this.left) {
        try { this.left.destroy() } catch (e) { void e }
      }
      if (this.right) {
        try { this.right.destroy() } catch (e) { void e }
      }
      const common = {
        modes: ['tree','code','text'],
        mode: 'tree',
        onChange: () => {
          this.diffHtml = ''
          this.persistToHashThrottled()
        },
        ace: window.ace,
        mainMenuBar: true,
        navigationBar: true,
        statusBar: true,
      }
      this.left = new JSONEditor(this.$refs.leftContainer, { ...common, mode: this.leftMode })
      this.right = new JSONEditor(this.$refs.rightContainer, { ...common, mode: this.rightMode })
      try {
        this.left.set({})
        this.right.set({})
      } catch (e) { void e }
      this.applyAceTheme()
    },
    recreateLeft() {
      const value = this.safeGet(this.left)
      this.createEditors()
      try { this.left.set(value) } catch (e) { void e }
    },
    recreateRight() {
      const value = this.safeGet(this.right)
      this.createEditors()
      try { this.right.set(value) } catch (e) { void e }
    },
    safeGet(editor) {
      try {
        return editor.get()
      } catch (e) {
        try {
          return JSON.parse(editor.getText())
        } catch (err) {
          return editor.getText()
        }
      }
    },
    formatLeft() { this.formatEditor(this.left) },
    formatRight() { this.formatEditor(this.right) },
    minifyLeft() { this.minifyEditor(this.left) },
    minifyRight() { this.minifyEditor(this.right) },
    sortLeft() { this.sortEditor(this.left) },
    sortRight() { this.sortEditor(this.right) },
    escapeLeft() { this.escapeEditor(this.left) },
    escapeRight() { this.escapeEditor(this.right) },
    unescapeLeft() { this.unescapeEditor(this.left) },
    unescapeRight() { this.unescapeEditor(this.right) },
    repairLeft() { this.repairEditor(this.left) },
    repairRight() { this.repairEditor(this.right) },
    applyJmes(side) {
      if (!this.jmesExpr) return
      const target = side === 'left' ? this.left : this.right
      try {
        const value = this.safeGet(target)
        const result = jmespath.search(value, this.jmesExpr)
        if (target.getMode() === 'code' || target.getMode() === 'text') target.setText(JSON.stringify(result, null, this.indent))
        else target.set(result)
      } catch (e) { void e }
    },
    formatEditor(editor) {
      const value = this.safeGet(editor)
      try {
        const json = typeof value === 'string' ? JSON.parse(value) : value
        editor.update(json)
      } catch (e) { void e }
    },
    escapeEditor(editor) {
      try {
        const txt = editor.getText()
        const escaped = JSON.stringify(txt)
        if (editor.getMode() === 'code' || editor.getMode() === 'text') {
          editor.setText(escaped)
        } else {
          // 在树模式中，放入字符串值，便于继续编辑
          editor.set(JSON.parse(escaped))
        }
      } catch (e) { void e }
    },
    unescapeEditor(editor) {
      try {
        const txt = editor.getText()
        const unescaped = JSON.parse(txt)
        if (typeof unescaped === 'string') {
          // 尝试进一步解析为 JSON（智能去转义）
          try {
            const asJson = JSON.parse(unescaped)
            if (editor.getMode() === 'code' || editor.getMode() === 'text') editor.setText(JSON.stringify(asJson, null, this.indent))
            else editor.set(asJson)
          } catch (_) {
            if (editor.getMode() === 'code' || editor.getMode() === 'text') editor.setText(unescaped)
            else editor.set(unescaped)
          }
        }
      } catch (e) { void e }
    },
    repairEditor(editor) {
      try {
        const txt = editor.getText()
        const repaired = jsonrepair(txt)
        if (editor.getMode() === 'code' || editor.getMode() === 'text') {
          editor.setText(repaired)
        } else {
          editor.set(JSON.parse(repaired))
        }
      } catch (e) { void e }
    },
    minifyEditor(editor) {
      const value = this.safeGet(editor)
      try {
        const json = typeof value === 'string' ? JSON.parse(value) : value
        const text = JSON.stringify(json)
        if (editor.getMode() === 'code' || editor.getMode() === 'text') {
          editor.setText(text)
        } else {
          editor.update(JSON.parse(text))
        }
      } catch (e) { void e }
    },
    sortEditor(editor) {
      const value = this.safeGet(editor)
      const sorted = this.sortDeep(value)
      try { editor.update(sorted) } catch (e) { void e }
    },
    sortDeep(value) {
      if (Array.isArray(value)) {
        return value.map(v => this.sortDeep(v))
      } else if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort()
        const out = {}
        keys.forEach(k => { out[k] = this.sortDeep(value[k]) })
        return out
      }
      return value
    },
    expandAll() {
      try { this.left.expandAll() } catch (e) { void e }
      try { this.right.expandAll() } catch (e) { void e }
    },
    collapseAll() {
      try { this.left.collapseAll() } catch (e) { void e }
      try { this.right.collapseAll() } catch (e) { void e }
    },
    newLeft() { try { this.left.set({}) } catch (e) { this.left.setText('{}') } },
    newRight() { try { this.right.set({}) } catch (e) { this.right.setText('{}') } },
    copyLeftToRight() {
      try { this.right.set(cloneDeep(this.safeGet(this.left))) } catch (e) { void e }
    },
    copyRightToLeft() {
      try { this.left.set(cloneDeep(this.safeGet(this.right))) } catch (e) { void e }
    },
    swapEditors() {
      const l = this.safeGet(this.left)
      const r = this.safeGet(this.right)
      try { this.left.set(r) } catch (e) { void e }
      try { this.right.set(l) } catch (e) { void e }
    },
    compare() {
      let leftValue = this.safeGet(this.left)
      let rightValue = this.safeGet(this.right)
      try {
        const delta = jsondiff(leftValue, rightValue)
        if (!delta) {
          this.diffHtml = '<div class="jso-diff-ok">两侧内容一致</div>'
          return
        }
        const html = formatHtml(delta, leftValue)
        this.diffHtml = html
      } catch (e) {
        this.diffHtml = '<div class="jso-diff-error">对比失败：请确认两侧均为合法 JSON</div>'
      }
    },
    openFile(side) {
      if (side === 'left') this.$refs.fileInputLeft.click()
      else this.$refs.fileInputRight.click()
    },
    onPickFile(side, ev) {
      const file = ev.target.files && ev.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || '')
        try {
          const json = JSON.parse(text)
          side === 'left' ? this.left.set(json) : this.right.set(json)
        } catch (e) {
          side === 'left' ? this.left.setText(text) : this.right.setText(text)
        }
        ev.target.value = ''
      }
      reader.readAsText(file)
    },
    saveFile(side) {
      const value = side === 'left' ? this.safeGet(this.left) : this.safeGet(this.right)
      const blob = new Blob([JSON.stringify(value, null, this.indent)], { type: 'application/json;charset=utf-8' })
      saveAs(blob, side === 'left' ? 'left.json' : 'right.json')
    },
    toggleTheme() {
      this.applyAceTheme()
    },
    applyAceTheme() {
      const theme = this.isDark ? 'ace/theme/tomorrow_night' : 'ace/theme/textmate'
      try { this.left.aceEditor && this.left.aceEditor.setTheme(theme) } catch (e) { void e }
      try { this.right.aceEditor && this.right.aceEditor.setTheme(theme) } catch (e) { void e }
    },
    bindSyncScroll() {
      const attach = (el, onScroll) => { el && el.addEventListener('scroll', onScroll, { passive: true }) }
      const leftEl = this.$refs.leftContainer
      const rightEl = this.$refs.rightContainer
      const handlerLeft = () => {
        if (!this.syncScroll) return
        const s = leftEl.querySelector('.jsoneditor')
        const t = rightEl.querySelector('.jsoneditor')
        if (!s || !t) return
        t.scrollTop = s.scrollTop
        t.scrollLeft = s.scrollLeft
      }
      const handlerRight = () => {
        if (!this.syncScroll) return
        const s = rightEl.querySelector('.jsoneditor')
        const t = leftEl.querySelector('.jsoneditor')
        if (!s || !t) return
        t.scrollTop = s.scrollTop
        t.scrollLeft = s.scrollLeft
      }
      this.$nextTick(() => {
        const l = leftEl.querySelector('.jsoneditor')
        const r = rightEl.querySelector('.jsoneditor')
        attach(l, handlerLeft)
        attach(r, handlerRight)
      })
    },
    persistToHashThrottled: (() => {
      let ticking = false
      return function() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(() => { this.persistToHash(); ticking = false })
      }
    })(),
    persistToHash() {
      try {
        const state = {
          l: this.safeGet(this.left),
          r: this.safeGet(this.right),
          lm: this.leftMode,
          rm: this.rightMode,
          i: this.indent,
          d: this.isDark ? 1 : 0,
        }
        const payload = compressToEncodedURIComponent(JSON.stringify(state))
        window.location.hash = `#state=${payload}`
      } catch (e) { void e }
    },
    restoreFromHash() {
      const m = location.hash.match(/state=([^&]+)/)
      if (!m) return
      try {
        const json = JSON.parse(decompressFromEncodedURIComponent(m[1]))
        if (json.l !== undefined) try { this.left.set(json.l) } catch (e) { this.left.setText(JSON.stringify(json.l)); void e }
        if (json.r !== undefined) try { this.right.set(json.r) } catch (e) { this.right.setText(JSON.stringify(json.r)); void e }
        if (json.lm) this.leftMode = json.lm
        if (json.rm) this.rightMode = json.rm
        if (json.i) this.indent = json.i
        this.isDark = !!json.d
        this.createEditors()
        try { this.left.set(json.l) } catch (e) { void e }
        try { this.right.set(json.r) } catch (e) { void e }
      } catch (e) { void e }
    },
    shareUrl() {
      this.persistToHash()
      try {
        const url = location.href
        navigator.clipboard && navigator.clipboard.writeText(url)
      } catch (e) { void e }
      alert('已生成并复制链接到剪贴板（若未授权，请手动复制地址栏链接）')
    }
  }
}
</script>

<style>
.jso-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.jso-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  padding: 12px 12px 8px;
  border-bottom: 1px solid var(--jso-border);
  background: var(--jso-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}
.jso-group { display: flex; align-items: center; gap: 8px; }
.jso-btn {
  padding: 6px 10px;
  border: 1px solid var(--jso-border);
  background: var(--jso-btn-bg);
  color: var(--jso-fg);
  border-radius: 4px;
  cursor: pointer;
}
.jso-btn.primary { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.jso-editors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  height: calc(100vh - 120px);
  box-sizing: border-box;
}
.jso-editor { border: 1px solid var(--jso-border); border-radius: 4px; overflow: hidden; }
.jso-editor .jsoneditor { height: 100%; }
.jso-diff { margin: 8px 12px 16px; border: 1px solid var(--jso-border); border-radius: 4px; padding: 10px; background: var(--jso-bg-soft); color: var(--jso-fg); }
.jso-diff-ok { color: #059669; }
.jso-diff-error { color: #dc2626; }

.jso-light { --jso-bg: #fafafa; --jso-bg-soft: #fff; --jso-fg: #111; --jso-border: #e5e7eb; --jso-btn-bg: #fff; }
.jso-dark  { --jso-bg: #0f172a; --jso-bg-soft: #0b1220; --jso-fg: #e5e7eb; --jso-border: #334155; --jso-btn-bg: #111827; }

html, body, #app { height: 100%; }
</style>
