// ===== Tab Switching =====
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.toggle('active', c.id === tabId);
    });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
});

// ===== Theme =====
function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function setThemeToggleIcon() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('devtools-theme', next); } catch (e) {}
    setThemeToggleIcon();
}

setThemeToggleIcon();

// ===== Shared Helpers =====
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function flashBox(el) {
    if (!el) return;
    el.classList.remove('flash-success');
    void el.offsetWidth; // restart animation
    el.classList.add('flash-success');
    setTimeout(() => el.classList.remove('flash-success'), 700);
}

function flashBoxError(el) {
    if (!el) return;
    el.classList.remove('flash-error');
    void el.offsetWidth;
    el.classList.add('flash-error');
    setTimeout(() => el.classList.remove('flash-error'), 700);
}

function copyToClipboard(text, statusEl, successMsg) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        setStatus(statusEl, '복사에 실패했습니다', 'error');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        setStatus(statusEl, successMsg, 'success');
    }).catch(() => {
        setStatus(statusEl, '복사에 실패했습니다', 'error');
    });
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

function buildShareUrl(key, value) {
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set(key, b64EncodeUnicode(value));
    return url.toString();
}

function setupCounter(textareaId, counterId) {
    const ta = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    if (!ta || !counter) return;
    const update = () => {
        const val = ta.value;
        const chars = val.length;
        const lines = val === '' ? 0 : val.split('\n').length;
        counter.textContent = `${chars}자 · ${lines}줄`;
    };
    ta.addEventListener('input', update);
    update();
}

setupCounter('json-input', 'json-counter');
setupCounter('yaml-input', 'yaml-counter');
setupCounter('regex-text', 'regex-counter');

// ===== Status helper =====
function setStatus(statusEl, message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
    statusEl.onclick = null;
}

function setErrorStatusWithJump(statusEl, message, textareaId, position) {
    if (!statusEl) return;
    const hasPosition = typeof position === 'number' && !isNaN(position);
    statusEl.textContent = message + (hasPosition ? ' (클릭하여 이동)' : '');
    statusEl.className = 'status error' + (hasPosition ? ' clickable' : '');
    statusEl.onclick = hasPosition ? () => jumpToError(textareaId, position) : null;
}

// ===== Error position jump =====
function extractJSONErrorPosition(message) {
    const match = /position (\d+)/.exec(message);
    return match ? parseInt(match[1], 10) : null;
}

function scrollTextareaToPosition(ta, position) {
    const before = ta.value.slice(0, position);
    const line = before.split('\n').length - 1;
    const style = getComputedStyle(ta);
    let lineHeight = parseFloat(style.lineHeight);
    if (isNaN(lineHeight)) lineHeight = parseFloat(style.fontSize) * 1.55;
    ta.scrollTop = Math.max(0, lineHeight * line - ta.clientHeight / 2);
}

function jumpToError(textareaId, position) {
    const ta = document.getElementById(textareaId);
    if (!ta) return;
    const tabId = textareaId.startsWith('yaml') ? 'yaml' : 'json';
    switchTab(tabId);
    const clamped = Math.max(0, Math.min(position, ta.value.length));
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(clamped, Math.min(clamped + 1, ta.value.length));
    scrollTextareaToPosition(ta, clamped);
    flashBoxError(ta);
}

// ===== File Upload Helpers =====
function readFileIntoTextarea(file, textareaId, filenameId, onLoaded) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const ta = document.getElementById(textareaId);
        ta.value = reader.result;
        ta.dispatchEvent(new Event('input'));
        const filenameEl = document.getElementById(filenameId);
        if (filenameEl) filenameEl.textContent = file.name;
        if (onLoaded) onLoaded();
    };
    reader.onerror = () => {
        const filenameEl = document.getElementById(filenameId);
        if (filenameEl) filenameEl.textContent = '파일을 읽지 못했습니다';
    };
    reader.readAsText(file);
}

function setupFileInput(inputId, textareaId, filenameId, onLoaded) {
    const input = document.getElementById(inputId);
    const textarea = document.getElementById(textareaId);

    input.addEventListener('change', () => {
        readFileIntoTextarea(input.files[0], textareaId, filenameId, onLoaded);
        input.value = '';
    });

    textarea.addEventListener('dragover', (e) => {
        e.preventDefault();
        textarea.classList.add('drag-over');
    });

    textarea.addEventListener('dragleave', () => {
        textarea.classList.remove('drag-over');
    });

    textarea.addEventListener('drop', (e) => {
        e.preventDefault();
        textarea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        readFileIntoTextarea(file, textareaId, filenameId, onLoaded);
    });
}

setupFileInput('json-file', 'json-input', 'json-filename', formatJSON);
setupFileInput('yaml-file', 'yaml-input', 'yaml-filename', formatYAML);

// ===== Sample Data =====
const SAMPLE_JSON = JSON.stringify({
    name: "홍길동",
    age: 29,
    active: true,
    tags: ["developer", "designer"],
    address: { city: "Seoul", zip: "04524" }
}, null, 2);

const SAMPLE_YAML = `name: 홍길동
age: 29
active: true
tags:
  - developer
  - designer
address:
  city: Seoul
  zip: "04524"
`;

function loadSampleJSON() {
    const input = document.getElementById('json-input');
    if (input.value.trim()) return;
    input.value = SAMPLE_JSON;
    input.dispatchEvent(new Event('input'));
    formatJSON();
}

function loadSampleYAML() {
    const input = document.getElementById('yaml-input');
    if (input.value.trim()) return;
    input.value = SAMPLE_YAML;
    input.dispatchEvent(new Event('input'));
    formatYAML();
}

function setupSampleButton(textareaId, buttonId) {
    const ta = document.getElementById(textareaId);
    const btn = document.getElementById(buttonId);
    if (!ta || !btn) return;
    const update = () => {
        btn.style.display = ta.value.trim() ? 'none' : '';
    };
    ta.addEventListener('input', update);
    update();
}

setupSampleButton('json-input', 'json-sample-btn');
setupSampleButton('yaml-input', 'yaml-sample-btn');

// ===== Export Helper =====
function downloadText(content, filename, mimeType) {
    if (!content) return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== JSON: state =====
let jsonCurrentData = null;
let jsonOutputText = '';
let jsonSchemaText = '';
let jsonViewMode = 'text';

// ===== JSON: tree view =====
function jsonTypeLabel(value) {
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (value !== null && typeof value === 'object') return `Object(${Object.keys(value).length})`;
    return typeof value;
}

function buildTreeNode(key, value) {
    const isContainer = value !== null && typeof value === 'object';

    if (isContainer) {
        const entries = Array.isArray(value)
            ? value.map((v, i) => [i, v])
            : Object.entries(value);
        const childrenHtml = entries.map(([k, v]) => buildTreeNode(k, v)).join('');
        const label = key === null ? '' : `<span class="tree-key">${escapeHtml(key)}</span>`;
        return `<details class="tree-node" open><summary>${label}<span class="tree-type">${jsonTypeLabel(value)}</span></summary><div class="tree-children">${childrenHtml}</div></details>`;
    }

    const displayValue = typeof value === 'string' ? `"${escapeHtml(value)}"` : escapeHtml(String(value));
    return `<div class="tree-leaf"><span class="tree-key">${escapeHtml(key)}</span><span class="tree-value">${displayValue}</span></div>`;
}

function renderTree(data) {
    return `<div class="tree-root">${buildTreeNode(null, data)}</div>`;
}

// ===== JSON: schema inference =====
function inferSchema(value) {
    if (Array.isArray(value)) {
        return {
            type: 'array',
            items: value.length ? inferSchema(value[0]) : {}
        };
    }
    if (value === null) return { type: 'null' };
    if (typeof value === 'object') {
        const properties = {};
        const required = [];
        for (const [k, v] of Object.entries(value)) {
            properties[k] = inferSchema(v);
            required.push(k);
        }
        return { type: 'object', properties, required };
    }
    if (typeof value === 'number') {
        return { type: Number.isInteger(value) ? 'integer' : 'number' };
    }
    return { type: typeof value };
}

function computeSchemaText(data) {
    try {
        return JSON.stringify(inferSchema(data), null, 2);
    } catch (e) {
        return '';
    }
}

function setJSONView(mode, btnEl) {
    jsonViewMode = mode;
    document.querySelectorAll('#json .view-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderJSONOutput();
}

function renderJSONOutput() {
    const output = document.getElementById('json-output');
    if (jsonCurrentData === null && !jsonOutputText) return;

    if (jsonViewMode === 'tree' && jsonCurrentData !== null) {
        output.innerHTML = renderTree(jsonCurrentData);
    } else if (jsonViewMode === 'schema') {
        output.textContent = jsonSchemaText;
    } else {
        output.textContent = jsonOutputText;
    }
}

// ===== JSON: stats =====
function countKeys(value) {
    if (Array.isArray(value)) return value.reduce((sum, v) => sum + countKeys(v), 0);
    if (value !== null && typeof value === 'object') {
        return Object.keys(value).length + Object.values(value).reduce((sum, v) => sum + countKeys(v), 0);
    }
    return 0;
}

function getDepth(value) {
    if (Array.isArray(value)) {
        return value.length ? 1 + Math.max(...value.map(getDepth)) : 1;
    }
    if (value !== null && typeof value === 'object') {
        const vals = Object.values(value);
        return vals.length ? 1 + Math.max(...vals.map(getDepth)) : 1;
    }
    return 0;
}

function updateJSONStats(data, text) {
    const statsEl = document.getElementById('json-stats');
    if (!statsEl) return;
    if (data === null || data === undefined) {
        statsEl.textContent = '';
        return;
    }
    const keyCount = countKeys(data);
    const depth = getDepth(data);
    const bytes = new TextEncoder().encode(text).length;
    const sizeLabel = bytes < 1024 ? `${bytes}B` : `${(bytes / 1024).toFixed(1)}KB`;
    statsEl.textContent = `키 ${keyCount}개 · 깊이 ${depth}단계 · ${sizeLabel}`;
}

// ===== JSON Functions =====
function formatJSON() {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');
    const status = document.getElementById('json-status');

    try {
        const parsed = JSON.parse(input);
        jsonCurrentData = parsed;
        jsonOutputText = JSON.stringify(parsed, null, 2);
        jsonSchemaText = computeSchemaText(parsed);
        renderJSONOutput();
        updateJSONStats(parsed, jsonOutputText);
        flashBox(output);
        setStatus(status, '유효한 JSON입니다', 'success');
    } catch (e) {
        jsonCurrentData = null;
        jsonOutputText = '';
        jsonSchemaText = '';
        output.textContent = '';
        updateJSONStats(null, '');
        setErrorStatusWithJump(status, 'JSON 오류: ' + e.message, 'json-input', extractJSONErrorPosition(e.message));
    }
}

function minifyJSON() {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');
    const status = document.getElementById('json-status');

    try {
        const parsed = JSON.parse(input);
        jsonCurrentData = parsed;
        jsonOutputText = JSON.stringify(parsed);
        jsonSchemaText = computeSchemaText(parsed);
        renderJSONOutput();
        updateJSONStats(parsed, jsonOutputText);
        flashBox(output);
        setStatus(status, '압축 완료', 'success');
    } catch (e) {
        jsonCurrentData = null;
        jsonOutputText = '';
        jsonSchemaText = '';
        output.textContent = '';
        updateJSONStats(null, '');
        setErrorStatusWithJump(status, 'JSON 오류: ' + e.message, 'json-input', extractJSONErrorPosition(e.message));
    }
}

function clearJSON() {
    const input = document.getElementById('json-input');
    input.value = '';
    input.dispatchEvent(new Event('input'));

    jsonCurrentData = null;
    jsonOutputText = '';
    jsonSchemaText = '';
    jsonViewMode = 'text';
    document.querySelectorAll('#json .view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'text'));

    document.getElementById('json-output').textContent = '';
    setStatus(document.getElementById('json-status'), '', '');
    document.getElementById('json-filename').textContent = '';
    document.getElementById('json-stats').textContent = '';
}

function exportJSON() {
    const status = document.getElementById('json-status');
    const content = jsonOutputText || document.getElementById('json-input').value;

    if (!content.trim()) {
        setStatus(status, '내보낼 내용이 없습니다', 'error');
        return;
    }

    downloadText(content, 'data.json', 'application/json');
}

function copyJSON() {
    const status = document.getElementById('json-status');
    const content = jsonOutputText || document.getElementById('json-input').value;

    if (!content.trim()) {
        setStatus(status, '복사할 내용이 없습니다', 'error');
        return;
    }

    copyToClipboard(content, status, '복사되었습니다');
}

function shareJSON() {
    const input = document.getElementById('json-input').value;
    const status = document.getElementById('json-status');

    if (!input.trim()) {
        setStatus(status, '공유할 내용이 없습니다', 'error');
        return;
    }

    copyToClipboard(buildShareUrl('json', input), status, '공유 링크가 복사되었습니다');
}

function convertJSONtoYAML() {
    const input = document.getElementById('json-input').value;
    const status = document.getElementById('json-status');

    if (!input.trim()) {
        setStatus(status, 'JSON을 입력하세요', 'error');
        return;
    }

    try {
        const parsed = JSON.parse(input);
        const yamlText = jsyaml.dump(parsed, { indent: 2, lineWidth: -1 });
        const yamlInput = document.getElementById('yaml-input');
        yamlInput.value = yamlText;
        yamlInput.dispatchEvent(new Event('input'));
        switchTab('yaml');
        formatYAML();
    } catch (e) {
        setErrorStatusWithJump(status, 'JSON 오류: ' + e.message, 'json-input', extractJSONErrorPosition(e.message));
    }
}

// ===== YAML: state =====
let yamlOutputText = '';

// ===== YAML Functions =====
function formatYAML() {
    const input = document.getElementById('yaml-input').value;
    const output = document.getElementById('yaml-output');
    const status = document.getElementById('yaml-status');

    if (!input.trim()) {
        yamlOutputText = '';
        output.textContent = '';
        setStatus(status, 'YAML을 입력하세요', 'error');
        return;
    }

    try {
        const parsed = jsyaml.load(input);
        const formatted = jsyaml.dump(parsed, { indent: 2, lineWidth: -1 });
        yamlOutputText = formatted;
        output.textContent = formatted;
        flashBox(output);
        setStatus(status, '유효한 YAML입니다', 'success');
    } catch (e) {
        yamlOutputText = '';
        output.textContent = '';
        const position = e.mark && typeof e.mark.position === 'number' ? e.mark.position : null;
        setErrorStatusWithJump(status, 'YAML 오류: ' + e.message, 'yaml-input', position);
    }
}

function clearYAML() {
    const input = document.getElementById('yaml-input');
    input.value = '';
    input.dispatchEvent(new Event('input'));

    yamlOutputText = '';
    document.getElementById('yaml-output').textContent = '';
    setStatus(document.getElementById('yaml-status'), '', '');
    document.getElementById('yaml-filename').textContent = '';
}

function exportYAML() {
    const status = document.getElementById('yaml-status');
    const content = yamlOutputText || document.getElementById('yaml-input').value;

    if (!content.trim()) {
        setStatus(status, '내보낼 내용이 없습니다', 'error');
        return;
    }

    downloadText(content, 'data.yaml', 'text/yaml');
}

function copyYAML() {
    const status = document.getElementById('yaml-status');
    const content = yamlOutputText || document.getElementById('yaml-input').value;

    if (!content.trim()) {
        setStatus(status, '복사할 내용이 없습니다', 'error');
        return;
    }

    copyToClipboard(content, status, '복사되었습니다');
}

function shareYAML() {
    const input = document.getElementById('yaml-input').value;
    const status = document.getElementById('yaml-status');

    if (!input.trim()) {
        setStatus(status, '공유할 내용이 없습니다', 'error');
        return;
    }

    copyToClipboard(buildShareUrl('yaml', input), status, '공유 링크가 복사되었습니다');
}

function convertYAMLtoJSON() {
    const input = document.getElementById('yaml-input').value;
    const status = document.getElementById('yaml-status');

    if (!input.trim()) {
        setStatus(status, 'YAML을 입력하세요', 'error');
        return;
    }

    try {
        const parsed = jsyaml.load(input);
        const jsonText = JSON.stringify(parsed, null, 2);
        const jsonInput = document.getElementById('json-input');
        jsonInput.value = jsonText;
        jsonInput.dispatchEvent(new Event('input'));
        switchTab('json');
        formatJSON();
    } catch (e) {
        const position = e.mark && typeof e.mark.position === 'number' ? e.mark.position : null;
        setErrorStatusWithJump(status, 'YAML 오류: ' + e.message, 'yaml-input', position);
    }
}

// ===== Regex: presets =====
const REGEX_PRESETS = {
    email: { pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', flags: 'g' },
    url: { pattern: 'https?:\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})+(?:[\\/?#][^\\s]*)?', flags: 'g' },
    phone: { pattern: '01[016789]-?\\d{3,4}-?\\d{4}', flags: 'g' },
    date: { pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' }
};

function getActiveFlags() {
    return [...document.querySelectorAll('.flag-btn.active')].map(b => b.dataset.flag).join('');
}

function setActiveFlags(flagsStr) {
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.classList.toggle('active', flagsStr.includes(btn.dataset.flag));
    });
}

function applyRegexPreset(key, btnEl) {
    const preset = REGEX_PRESETS[key];
    if (!preset) return;
    document.getElementById('regex-pattern').value = preset.pattern;
    setActiveFlags(preset.flags);
    document.querySelectorAll('.chip-btn[data-preset]').forEach(b => b.classList.toggle('active', b === btnEl));
    testRegex();
}

document.querySelectorAll('.chip-btn[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => applyRegexPreset(btn.dataset.preset, btn));
});

document.querySelectorAll('.flag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        testRegex();
    });
});

// ===== Regex: state =====
let regexOutputText = '';

// ===== Regex Functions =====
function buildHighlightedHtml(text, regex) {
    let lastIndex = 0;
    const parts = [];

    for (const match of text.matchAll(regex)) {
        const start = match.index;
        const end = start + match[0].length;
        parts.push(escapeHtml(text.slice(lastIndex, start)));
        parts.push(`<mark>${escapeHtml(match[0])}</mark>`);
        lastIndex = end;
    }
    parts.push(escapeHtml(text.slice(lastIndex)));
    return parts.join('');
}

function testRegex() {
    const pattern = document.getElementById('regex-pattern').value;
    const flags = getActiveFlags();
    const text = document.getElementById('regex-text').value;
    const output = document.getElementById('regex-output');
    const status = document.getElementById('regex-status');

    if (!pattern || !text) {
        output.textContent = '';
        setStatus(status, '', '');
        regexOutputText = '';
        return;
    }

    try {
        const internalFlags = flags.includes('g') ? flags : flags + 'g';
        const regex = new RegExp(pattern, internalFlags);
        const matches = [...text.matchAll(regex)];

        if (matches.length === 0) {
            output.textContent = '매칭 없음';
            setStatus(status, '매칭된 결과가 없습니다', 'error');
            regexOutputText = '';
            return;
        }

        output.innerHTML = `<div class="regex-highlight">${buildHighlightedHtml(text, regex)}</div>`;

        regexOutputText = matches.map((m, idx) => {
            let line = `#${idx + 1}: ${m[0]}`;
            if (m.length > 1) {
                const groups = m.slice(1).map((g, gi) => `그룹${gi + 1}=${g}`).join(', ');
                line += ` (${groups})`;
            }
            return line;
        }).join('\n');

        setStatus(status, `${matches.length}개 매칭됨`, 'success');
    } catch (e) {
        output.textContent = '';
        regexOutputText = '';
        setStatus(status, '정규식 오류: ' + e.message, 'error');
    }
}

function clearRegex() {
    document.getElementById('regex-pattern').value = '';
    setActiveFlags('');
    document.querySelectorAll('.chip-btn[data-preset]').forEach(b => b.classList.remove('active'));
    const text = document.getElementById('regex-text');
    text.value = '';
    text.dispatchEvent(new Event('input'));
    document.getElementById('regex-output').textContent = '';
    setStatus(document.getElementById('regex-status'), '', '');
    regexOutputText = '';
}

function copyRegex() {
    const status = document.getElementById('regex-status');

    if (!regexOutputText.trim()) {
        setStatus(status, '복사할 내용이 없습니다', 'error');
        return;
    }

    copyToClipboard(regexOutputText, status, '복사되었습니다');
}

// ===== JSON Diff =====
function diffValues(a, b, path, results) {
    const isObjA = a !== null && typeof a === 'object';
    const isObjB = b !== null && typeof b === 'object';

    if (isObjA && isObjB && Array.isArray(a) === Array.isArray(b)) {
        if (Array.isArray(a)) {
            const maxLen = Math.max(a.length, b.length);
            for (let i = 0; i < maxLen; i++) {
                const p = `${path}[${i}]`;
                if (i >= a.length) results.push({ type: 'added', path: p, value: b[i] });
                else if (i >= b.length) results.push({ type: 'removed', path: p, value: a[i] });
                else diffValues(a[i], b[i], p, results);
            }
        } else {
            const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
            for (const key of keys) {
                const p = path ? `${path}.${key}` : key;
                if (!(key in a)) results.push({ type: 'added', path: p, value: b[key] });
                else if (!(key in b)) results.push({ type: 'removed', path: p, value: a[key] });
                else diffValues(a[key], b[key], p, results);
            }
        }
        return;
    }

    if (JSON.stringify(a) !== JSON.stringify(b)) {
        results.push({ type: 'changed', path: path || '(root)', from: a, to: b });
    }
}

function compareJSON() {
    const aText = document.getElementById('diff-a').value;
    const bText = document.getElementById('diff-b').value;
    const output = document.getElementById('diff-output');
    const status = document.getElementById('diff-status');

    if (!aText.trim() || !bText.trim()) {
        output.innerHTML = '';
        setStatus(status, '비교할 JSON을 모두 입력하세요', 'error');
        return;
    }

    let a, b;
    try {
        a = JSON.parse(aText);
    } catch (e) {
        output.innerHTML = '';
        setStatus(status, 'A JSON 오류: ' + e.message, 'error');
        return;
    }
    try {
        b = JSON.parse(bText);
    } catch (e) {
        output.innerHTML = '';
        setStatus(status, 'B JSON 오류: ' + e.message, 'error');
        return;
    }

    const results = [];
    diffValues(a, b, '', results);

    if (results.length === 0) {
        output.innerHTML = '<div class="diff-line diff-same">차이가 없습니다</div>';
        setStatus(status, '두 JSON이 동일합니다', 'success');
        return;
    }

    output.innerHTML = results.map(r => {
        if (r.type === 'added') {
            return `<div class="diff-line diff-added">+ ${escapeHtml(r.path)}: ${escapeHtml(JSON.stringify(r.value))}</div>`;
        }
        if (r.type === 'removed') {
            return `<div class="diff-line diff-removed">- ${escapeHtml(r.path)}: ${escapeHtml(JSON.stringify(r.value))}</div>`;
        }
        return `<div class="diff-line diff-changed">~ ${escapeHtml(r.path)}: ${escapeHtml(JSON.stringify(r.from))} → ${escapeHtml(JSON.stringify(r.to))}</div>`;
    }).join('');

    setStatus(status, `${results.length}개 차이 발견`, 'info');
}

function clearDiff() {
    document.getElementById('diff-a').value = '';
    document.getElementById('diff-b').value = '';
    document.getElementById('diff-output').innerHTML = '';
    setStatus(document.getElementById('diff-status'), '', '');
}

// ===== Restore from shared URL =====
(function restoreFromUrl() {
    const params = new URLSearchParams(location.search);

    if (params.has('json')) {
        try {
            const jsonInput = document.getElementById('json-input');
            jsonInput.value = b64DecodeUnicode(params.get('json'));
            jsonInput.dispatchEvent(new Event('input'));
            switchTab('json');
            formatJSON();
        } catch (e) { /* ignore malformed share link */ }
    } else if (params.has('yaml')) {
        try {
            const yamlInput = document.getElementById('yaml-input');
            yamlInput.value = b64DecodeUnicode(params.get('yaml'));
            yamlInput.dispatchEvent(new Event('input'));
            switchTab('yaml');
            formatYAML();
        } catch (e) { /* ignore malformed share link */ }
    }
})();
