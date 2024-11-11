<template>
  <div class="json-diff-container">
    <h2>JSON 对比工具</h2>
    <div class="editor-container">
      <div>
        <h3>原始 JSON</h3>
        <textarea ref="editor1" class="editor"></textarea>
      </div>
      <div>
        <h3>对比 JSON</h3>
        <textarea ref="editor2" class="editor"></textarea>
      </div>
    </div>
    <button @click="compareJson">比较</button>
    <div v-html="diffResult" class="diff-output"></div>
  </div>
</template>

<script>
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript.js';
// import { DiffMatchPatch } from 'diff-match-patch';
import DiffMatchPatch from 'diff-match-patch';

export default {
  data() {
    return {
      editor1: null,
      editor2: null,
      diffResult: '',
    };
  },
  mounted() {
    this.editor1 = CodeMirror.fromTextArea(this.$refs.editor1, {
      mode: 'application/json',
      lineNumbers: true,
      lineWrapping: true,
    });

    this.editor2 = CodeMirror.fromTextArea(this.$refs.editor2, {
      mode: 'application/json',
      lineNumbers: true,
      lineWrapping: true,
    });
  },
  methods: {
    compareJson() {
      const json1 = this.editor1.getValue();
      const json2 = this.editor2.getValue();
      try {
        const parsedJson1 = JSON.stringify(JSON.parse(json1), null, 2);
        const parsedJson2 = JSON.stringify(JSON.parse(json2), null, 2);
        const dmp = new DiffMatchPatch.diff_match_patch();
        const diff = dmp.diff_main(parsedJson1, parsedJson2);
        dmp.diff_cleanupSemantic(diff);
        this.diffResult = dmp.diff_prettyHtml(diff);
      } catch (e) {
        console.log(e)
        this.diffResult = '<p style="color: red;">JSON 格式不正确</p>';
      }
    },
  },
};
</script>

<style>
.json-diff-container {
  max-width: 800px;
  margin: 0 auto;
}
.editor-container {
  display: flex;
  gap: 20px;
}
.editor {
  width: 100%;
  height: 300px;
}
.diff-output {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
}
.diff-output ins {
  background-color: #e6ffe6;
  text-decoration: none;
}
.diff-output del {
  background-color: #ffe6e6;
  text-decoration: none;
}
</style>
