(function () {
  var obsidian = {};

  try {
    if (typeof require !== "undefined") {
      obsidian = require("obsidian") || {};
    }
  } catch (e) {
    obsidian = {};
  }

  var PluginBase = obsidian.Plugin || class {
    async loadData() { return {}; }
    async saveData() {}
    addCommand() {}
    addRibbonIcon() {}
    addSettingTab() {}
    registerMarkdownCodeBlockProcessor() {}
    registerView() {}
  };

  var ItemViewBase = obsidian.ItemView || class {
    constructor(leaf) {
      this.leaf = leaf;
      this.containerEl = typeof document !== "undefined" ? document.createElement("div") : null;
    }
  };

  var PluginSettingTabBase = obsidian.PluginSettingTab || class {
    constructor(app, plugin) {
      this.app = app;
      this.plugin = plugin;
      this.containerEl = typeof document !== "undefined" ? document.createElement("div") : null;
    }
  };

  var SettingCtor = obsidian.Setting || class {
    constructor() {}
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addTextArea() { return this; }
    addToggle() { return this; }
    addDropdown() { return this; }
    addButton() { return this; }
  };

  var NoticeCtor = obsidian.Notice || function (message) {
    if (typeof console !== "undefined") console.log(message);
  };

  var VIEW_TYPE_DIGITAL_GARDEN = "digital-garden-visualizer-view";

  var DEFAULT_SETTINGS = {
    folderPath: "",
    filterField: "dg-publish",
    filterValue: true,
    iconField: "dg-note-icon",
    titleField: "title",
    iconPathPrefix: "60 🌠 AETHER/🍊 TANGERINE/img",
    defaultIcon: "stone",
    includeWithoutIcon: false,
    sortMode: "random",
    cellSize: 18,
    cellGap: 0,
    iconScale: 0.85,
    showLegend: true,
    openInNewPane: false,
    iconMap: {}
  };

  var BUILTIN_ICONS = {
    "tree-1": {
      label: "种子",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#79b84a" d="M32 6 14 34h36L32 6Z"/><path fill="#5f9239" d="M32 18 8 50h48L32 18Z"/><path fill="#8b5a2b" d="M27 46h10v14H27z"/></svg>'
    },
    "tree-2": {
      label: "树苗",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#4f9d4a" d="M32 4 14 30h36L32 4Z"/><path fill="#3f813d" d="M32 18 9 48h46L32 18Z"/><path fill="#2f6f34" d="M32 31 17 56h30L32 31Z"/><path fill="#8b5a2b" d="M27 48h10v13H27z"/></svg>'
    },
    "tree-3": {
      label: "成树",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#2f7f43" d="M32 3 12 28h40L32 3Z"/><path fill="#286f3b" d="M32 15 8 43h48L32 15Z"/><path fill="#1f5f34" d="M32 29 12 58h40L32 29Z"/><path fill="#8b5a2b" d="M26 48h12v13H26z"/></svg>'
    },
    withered: {
      label: "枯枝",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="none" stroke="#8f6b45" stroke-width="6" stroke-linecap="round" d="M31 59c1-15 3-29 1-45M32 30c-7-7-13-9-21-9M33 37c8-8 12-11 20-12M30 45c-7 0-12 3-17 8"/><path fill="#a57d50" d="M26 52h12v9H26z"/></svg>'
    },
    signpost: {
      label: "路标",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#8b5a2b" d="M29 10h6v50h-6z"/><path fill="#d9a441" d="M13 13h35l7 7-7 7H13z"/><path fill="#c58c33" d="M16 34h35l-7 7 7 7H16z"/></svg>'
    },
    stone: {
      label: "置石",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#8d969e" d="M10 50c2-17 11-30 25-31 12-1 20 10 19 31H10Z"/><path fill="#aab1b8" d="M22 31c4-5 9-8 16-8 5 0 9 3 11 8H22Z"/></svg>'
    }
  };

  function svgDataUri(svg) {
    return "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  }

  Object.keys(BUILTIN_ICONS).forEach(function (key) {
    BUILTIN_ICONS[key].src = svgDataUri(BUILTIN_ICONS[key].svg);
  });

  function normalizeSettings(raw) {
    var settings = Object.assign({}, DEFAULT_SETTINGS, raw || {});
    settings.folderPath = String(settings.folderPath || "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    settings.filterField = String(settings.filterField || "").trim();
    if (typeof settings.filterValue === "undefined" || settings.filterValue === null) settings.filterValue = "";
    settings.iconField = String(settings.iconField || DEFAULT_SETTINGS.iconField).trim();
    settings.titleField = String(settings.titleField || DEFAULT_SETTINGS.titleField).trim();
    settings.iconPathPrefix = String(settings.iconPathPrefix || "").trim();
    settings.defaultIcon = String(settings.defaultIcon || DEFAULT_SETTINGS.defaultIcon).trim();
    settings.includeWithoutIcon = Boolean(settings.includeWithoutIcon);
    settings.sortMode = String(settings.sortMode || DEFAULT_SETTINGS.sortMode);
    settings.cellSize = normalizeNumber(settings.cellSize, DEFAULT_SETTINGS.cellSize, 12, 40);
    settings.cellGap = normalizeNumber(settings.cellGap, DEFAULT_SETTINGS.cellGap, 0, 12);
    settings.iconScale = normalizeNumber(settings.iconScale, DEFAULT_SETTINGS.iconScale, 0.5, 2);
    settings.showLegend = settings.showLegend !== false;
    settings.openInNewPane = Boolean(settings.openInNewPane);
    settings.iconMap = parseIconMap(settings.iconMap);
    return settings;
  }

  function parseIconMap(value) {
    if (!value) return {};
    if (typeof value === "string") {
      try {
        var parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
      } catch (e) {
        return {};
      }
    }
    return typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function normalizeNumber(value, fallback, min, max) {
    var parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
  }

  function clearElement(el) {
    if (!el) return;
    if (typeof el.empty === "function") {
      el.empty();
      return;
    }
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function appendEl(parent, tagName, options) {
    var el = document.createElement(tagName);
    options = options || {};

    if (options.cls) {
      String(options.cls).split(/\s+/).filter(Boolean).forEach(function (cls) {
        el.classList.add(cls);
      });
    }

    if (typeof options.text !== "undefined") {
      el.textContent = String(options.text);
    }

    if (options.attr) {
      Object.keys(options.attr).forEach(function (key) {
        var value = options.attr[key];
        if (value !== null && typeof value !== "undefined") {
          el.setAttribute(key, String(value));
        }
      });
    }

    parent.appendChild(el);
    return el;
  }

  function readFrontmatterValue(frontmatter, key) {
    if (!frontmatter || !key) return undefined;
    if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
      return frontmatter[key];
    }

    var parts = String(key).split(".");
    var current = frontmatter;
    for (var i = 0; i < parts.length; i++) {
      if (!current || typeof current !== "object") return undefined;
      current = current[parts[i]];
    }
    return current;
  }

  function valueToText(value) {
    if (value === null || typeof value === "undefined") return "";
    if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(", ");
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  }

  function hasValue(value) {
    if (value === null || typeof value === "undefined") return false;
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim().length > 0;
  }

  function titleCase(value) {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
  }

  function isUrlLike(value) {
    return /^(https?:|app:|file:|data:|obsidian:|\/|\.\/|\.\.\/)/i.test(value) || /\.(svg|png|jpg|jpeg|webp|gif)$/i.test(value);
  }

  function joinIconPath(prefix, iconKey) {
    if (!prefix) return "";
    var key = String(iconKey || "").replace(/\.(svg|png|jpg|jpeg|webp|gif)$/i, "");
    var separator = /[\/\\]$/.test(prefix) ? "" : "/";
    return prefix + separator + key + ".svg";
  }

  function resolveResourcePath(app, source) {
    if (!source || !app || !app.vault) return source;
    if (/^(https?:|app:|file:|data:|obsidian:)/i.test(source)) return source;

    var vaultPath = String(source).replace(/^\/+/, "");
    var file = app.vault.getAbstractFileByPath ? app.vault.getAbstractFileByPath(vaultPath) : null;

    if (file && typeof app.vault.getResourcePath === "function") {
      return app.vault.getResourcePath(file);
    }

    return source;
  }

  function parseIconValue(rawIcon, settings) {
    var rawText = valueToText(rawIcon).trim();
    var height = 2;
    var iconKey = rawText || settings.defaultIcon;

    if (/^\d+$/.test(rawText)) {
      var level = parseInt(rawText, 10);
      height = Math.max(1, Math.min(level, 6));
      iconKey = "tree-" + Math.max(1, Math.min(level, 3));
    }

    return { iconKey: iconKey, height: height, rawText: rawText };
  }

  function resolveIcon(iconKey, rawIcon, settings, app) {
    var iconMap = settings.iconMap || {};
    var lookupKeys = [valueToText(rawIcon).trim(), iconKey].filter(Boolean);
    var mapped = null;

    for (var i = 0; i < lookupKeys.length; i++) {
      if (Object.prototype.hasOwnProperty.call(iconMap, lookupKeys[i])) {
        mapped = iconMap[lookupKeys[i]];
        break;
      }
    }

    var resolvedKey = iconKey || settings.defaultIcon;
    var label = BUILTIN_ICONS[resolvedKey] ? BUILTIN_ICONS[resolvedKey].label : titleCase(resolvedKey);
    var src = "";

    if (typeof mapped === "string") {
      if (isUrlLike(mapped)) {
        src = mapped;
      } else {
        resolvedKey = mapped;
        label = BUILTIN_ICONS[resolvedKey] ? BUILTIN_ICONS[resolvedKey].label : titleCase(resolvedKey);
      }
    } else if (mapped && typeof mapped === "object") {
      if (mapped.icon) resolvedKey = String(mapped.icon);
      if (mapped.label) label = String(mapped.label);
      if (mapped.src || mapped.path || mapped.url) src = String(mapped.src || mapped.path || mapped.url);
    }

    if (!src && settings.iconPathPrefix) {
      src = joinIconPath(settings.iconPathPrefix, resolvedKey);
    }

    if (!src && BUILTIN_ICONS[resolvedKey]) {
      src = BUILTIN_ICONS[resolvedKey].src;
      if (!label) label = BUILTIN_ICONS[resolvedKey].label;
    }

    if (!src) {
      resolvedKey = settings.defaultIcon || "stone";
      src = BUILTIN_ICONS[resolvedKey] ? BUILTIN_ICONS[resolvedKey].src : BUILTIN_ICONS.stone.src;
      label = BUILTIN_ICONS[resolvedKey] ? BUILTIN_ICONS[resolvedKey].label : "置石";
    }

    return {
      key: resolvedKey,
      label: label || titleCase(resolvedKey),
      src: resolveResourcePath(app, src)
    };
  }

  function normalizeNote(file, frontmatter, settings, app) {
    var rawIcon = readFrontmatterValue(frontmatter, settings.iconField);
    var parsedIcon = parseIconValue(rawIcon, settings);
    var icon = resolveIcon(parsedIcon.iconKey, rawIcon, settings, app);
    var title = valueToText(readFrontmatterValue(frontmatter, settings.titleField)).trim();

    return {
      path: file.path,
      basename: file.basename || file.name || file.path,
      title: title || file.basename || file.name || file.path,
      iconKey: icon.key,
      iconLabel: icon.label,
      iconSrc: icon.src,
      rawIcon: rawIcon,
      rawIconText: parsedIcon.rawText,
      height: parsedIcon.height,
      hasIcon: hasValue(rawIcon),
      frontmatter: frontmatter || {}
    };
  }

  function matchesFilter(note, filterField, filterValue) {
    if (!filterField) return true;
    var value = readFrontmatterValue(note.frontmatter, filterField);
    if (!hasValue(filterValue)) return hasValue(value);

    var expected = valueToText(filterValue).toLowerCase();
    if (Array.isArray(value)) {
      return value.some(function (item) {
        return valueToText(item).toLowerCase() === expected;
      });
    }

    return valueToText(value).toLowerCase() === expected;
  }

  function matchesSearch(note, search) {
    if (!search) return true;
    var needle = String(search).trim().toLowerCase();
    if (!needle) return true;
    return [note.title, note.path, note.iconLabel, note.iconKey, note.rawIconText].some(function (value) {
      return String(value || "").toLowerCase().indexOf(needle) !== -1;
    });
  }

  function shuffle(items) {
    var result = items.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = result[i];
      result[i] = result[j];
      result[j] = tmp;
    }
    return result;
  }

  function sortNotes(notes, sortMode) {
    var result = notes.slice();
    if (sortMode === "random") return shuffle(result);

    result.sort(function (a, b) {
      if (sortMode === "icon") {
        var iconCompare = String(a.iconLabel).localeCompare(String(b.iconLabel));
        if (iconCompare !== 0) return iconCompare;
      }

      if (sortMode === "path") {
        return String(a.path).localeCompare(String(b.path));
      }

      return String(a.title).localeCompare(String(b.title));
    });

    return result;
  }

  function sliceIntoChunks(items, chunkSize) {
    var rows = [];
    for (var i = 0; i < items.length; i += chunkSize) {
      rows.push(items.slice(i, i + chunkSize));
    }
    return rows;
  }

  function getPositions(notes) {
    if (!notes.length) return [];
    var rowSize = Math.ceil(Math.sqrt(notes.length));
    var targetLength = Math.pow(rowSize, 2);
    var padded = notes.concat(Array(targetLength - notes.length).fill(null));
    return sliceIntoChunks(padded, rowSize);
  }

  function collectForestData(app, settings, options) {
    options = options || {};
    var files = app && app.vault && app.vault.getMarkdownFiles ? app.vault.getMarkdownFiles() : [];
    var includeWithoutIcon = typeof options.includeWithoutIcon === "boolean" ? options.includeWithoutIcon : settings.includeWithoutIcon;
    var sortMode = options.sortMode || settings.sortMode || "random";
    var folderPath = typeof options.folderPath === "string" ? options.folderPath : settings.folderPath;
    folderPath = String(folderPath || "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    var filterField = typeof options.filterField === "string" ? options.filterField : settings.filterField;
    var filterValue = typeof options.filterValue === "undefined" ? settings.filterValue : options.filterValue;
    var search = options.search || "";

    var notes = files.map(function (file) {
      var cache = app.metadataCache && app.metadataCache.getFileCache ? app.metadataCache.getFileCache(file) : null;
      return normalizeNote(file, cache && cache.frontmatter ? cache.frontmatter : {}, settings, app);
    }).filter(function (note) {
      return !folderPath || note.path === folderPath || note.path.indexOf(folderPath + "/") === 0;
    }).filter(function (note) {
      return includeWithoutIcon || note.hasIcon;
    }).filter(function (note) {
      return matchesFilter(note, filterField, filterValue);
    }).filter(function (note) {
      return matchesSearch(note, search);
    });

    notes = sortNotes(notes, sortMode);

    var legendIndex = {};
    notes.forEach(function (note) {
      if (!legendIndex[note.iconKey]) {
        legendIndex[note.iconKey] = {
          key: note.iconKey,
          label: note.iconLabel,
          icon: note.iconKey,
          src: note.iconSrc,
          count: 0
        };
      }
      legendIndex[note.iconKey].count++;
    });

    var legends = Object.keys(legendIndex).map(function (key) {
      return legendIndex[key];
    }).sort(function (a, b) {
      return b.count - a.count || a.label.localeCompare(b.label);
    });

    return {
      notes: notes,
      trees: getPositions(notes),
      legends: legends,
      totalFiles: files.length,
      shownFiles: notes.length
    };
  }

  function parseCodeBlockOptions(source) {
    var body = String(source || "").trim();
    if (!body) return {};

    try {
      return JSON.parse(body);
    } catch (e) {
      return { error: "代码块配置不是有效的 JSON：" + e.message };
    }
  }

  function createControl(parent, labelText, input) {
    var label = appendEl(parent, "label", { cls: "dgv-control" });
    appendEl(label, "span", { text: labelText });
    label.appendChild(input);
    return label;
  }

  function createTextInput(value, placeholder) {
    var input = document.createElement("input");
    input.type = "text";
    input.value = value || "";
    input.placeholder = placeholder || "";
    return input;
  }

  function createNumberInput(value, placeholder, min, max, step) {
    var input = document.createElement("input");
    input.type = "number";
    input.value = String(value || "");
    input.placeholder = placeholder || "";
    if (typeof min !== "undefined") input.min = String(min);
    if (typeof max !== "undefined") input.max = String(max);
    input.step = String(step || 1);
    return input;
  }

  function createSelect(value, options) {
    var select = document.createElement("select");
    options.forEach(function (option) {
      var el = document.createElement("option");
      el.value = option.value;
      el.textContent = option.label;
      select.appendChild(el);
    });
    select.value = value;
    return select;
  }

  function renderGraph(parent, forest, plugin, options) {
    options = options || {};
    var wrapper = appendEl(parent, "div", { cls: "digital-garden-wrapper" });
    var settings = options.settings || plugin.settings || DEFAULT_SETTINGS;
    var cellSize = normalizeNumber(settings.cellSize, DEFAULT_SETTINGS.cellSize, 12, 40);
    var cellGap = normalizeNumber(settings.cellGap, DEFAULT_SETTINGS.cellGap, 0, 12);
    var iconScale = normalizeNumber(settings.iconScale, DEFAULT_SETTINGS.iconScale, 0.5, 2);

    wrapper.style.setProperty("--dgv-cell-size", String(cellSize) + "px");
    wrapper.style.setProperty("--dgv-cell-gap", String(cellGap) + "px");
    wrapper.style.setProperty("--dgv-icon-scale", String(iconScale));
    wrapper.style.setProperty("--dgv-icon-max-width", String(Math.max(28, cellSize * 2.4)) + "px");
    wrapper.style.setProperty("--dgv-icon-max-height", String(Math.max(42, cellSize * 3.2)) + "px");

    if (!forest.notes.length) {
      appendEl(wrapper, "div", {
        cls: "dgv-empty",
        text: "没有找到符合当前花园规则的笔记。"
      });
      return;
    }

    var body = appendEl(wrapper, "div", { cls: "forest-body" });
    forest.trees.forEach(function (row) {
      var rowEl = appendEl(body, "div", { cls: "forest-row" });
      row.forEach(function (note) {
        if (!note) {
          appendEl(rowEl, "span", { cls: "tree plane", attr: { "aria-hidden": "true" } });
          return;
        }

        var link = appendEl(rowEl, "a", {
          cls: "tree",
          attr: {
            href: "#",
            title: note.title + "\n" + note.path,
            "data-icon": note.iconKey
          }
        });

        var image = appendEl(link, "img", {
          attr: {
            src: note.iconSrc,
            alt: note.iconLabel
          }
        });
        image.style.height = String((5 + 10 * note.height) * iconScale) + "px";

        link.addEventListener("click", function (event) {
          event.preventDefault();
          plugin.openNote(note.path, event);
        });
      });
    });

    if (options.showLegend !== false && forest.legends.length) {
      var legends = appendEl(wrapper, "div", { cls: "forest-legends" });
      forest.legends.forEach(function (count) {
        var stat = appendEl(legends, "div", { cls: "stat" });
        appendEl(stat, "img", {
          attr: {
            src: count.src,
            alt: count.label
          }
        });
        appendEl(stat, "span", {
          text: String(count.count) + " 个" + count.label
        });
      });
    }
  }

  function makeViewState(settings) {
    return {
      folderPath: settings.folderPath || "",
      iconField: settings.iconField,
      titleField: settings.titleField,
      filterField: settings.filterField || "",
      filterValue: valueToText(settings.filterValue),
      search: "",
      includeWithoutIcon: settings.includeWithoutIcon,
      sortMode: settings.sortMode || "random",
      cellSize: settings.cellSize || DEFAULT_SETTINGS.cellSize,
      cellGap: settings.cellGap || DEFAULT_SETTINGS.cellGap,
      iconScale: settings.iconScale || DEFAULT_SETTINGS.iconScale
    };
  }

  class DigitalGardenView extends ItemViewBase {
    constructor(leaf, plugin) {
      super(leaf);
      this.plugin = plugin;
      this.state = makeViewState(plugin.settings);
    }

    getViewType() {
      return VIEW_TYPE_DIGITAL_GARDEN;
    }

    getDisplayText() {
      return "digital-garden-visualizer";
    }

    getIcon() {
      return "sprout";
    }

    syncStateFromSettings() {
      this.state = makeViewState(this.plugin.settings);
    }

    async onOpen() {
      this.render();
    }

    async onClose() {}

    getContentEl() {
      if (!this.containerEl) return null;
      return this.containerEl.children && this.containerEl.children.length > 1 ? this.containerEl.children[1] : this.containerEl;
    }

    render() {
      var contentEl = this.getContentEl();
      if (!contentEl) return;
      clearElement(contentEl);

      var root = appendEl(contentEl, "div", { cls: "dgv-view" });
      var header = appendEl(root, "div", { cls: "dgv-header" });
      appendEl(header, "div", { cls: "dgv-title", text: "digital-garden-visualizer" });

      var toolbar = appendEl(root, "div", { cls: "dgv-toolbar" });
      var graphHost = appendEl(root, "div", { cls: "dgv-graph-host" });
      var summaryHost = appendEl(root, "div", { cls: "dgv-summary" });

      var folderPathInput = createTextInput(this.state.folderPath, "60 🌠 AETHER/🍊 TANGERINE");
      var iconFieldInput = createTextInput(this.state.iconField, "dg-note-icon");
      var titleFieldInput = createTextInput(this.state.titleField, "title");
      var filterFieldInput = createTextInput(this.state.filterField, "dg-publish");
      var filterValueInput = createTextInput(this.state.filterValue, "true");
      var searchInput = createTextInput(this.state.search, "搜索笔记");
      var cellSizeInput = createNumberInput(this.state.cellSize, "18", 12, 40, 1);
      var cellGapInput = createNumberInput(this.state.cellGap, "0", 0, 12, 1);
      var iconScaleInput = createNumberInput(this.state.iconScale, "0.85", 0.5, 2, 0.05);
      var sortSelect = createSelect(this.state.sortMode, [
        { value: "random", label: "随机" },
        { value: "title", label: "标题" },
        { value: "path", label: "路径" },
        { value: "icon", label: "图标" }
      ]);

      var includeInput = document.createElement("input");
      includeInput.type = "checkbox";
      includeInput.checked = this.state.includeWithoutIcon;

      createControl(toolbar, "笔记范围", folderPathInput);
      createControl(toolbar, "成熟度字段", iconFieldInput);
      createControl(toolbar, "标题字段", titleFieldInput);
      createControl(toolbar, "筛选字段", filterFieldInput);
      createControl(toolbar, "筛选值", filterValueInput);
      createControl(toolbar, "搜索", searchInput);
      createControl(toolbar, "格子大小", cellSizeInput);
      createControl(toolbar, "节点间距", cellGapInput);
      createControl(toolbar, "图标缩放", iconScaleInput);
      createControl(toolbar, "排序", sortSelect);

      var includeLabel = appendEl(toolbar, "label", { cls: "dgv-control dgv-checkbox" });
      includeLabel.appendChild(includeInput);
      appendEl(includeLabel, "span", { text: "包含未标记成熟度的笔记" });

      var actions = appendEl(toolbar, "div", { cls: "dgv-actions" });
      var refreshButton = appendEl(actions, "button", { text: "刷新" });
      refreshButton.type = "button";
      var shuffleButton = appendEl(actions, "button", { text: "重新随机" });
      shuffleButton.type = "button";
      var saveButton = appendEl(actions, "button", { text: "保存为默认" });
      saveButton.type = "button";

      var renderCurrent = function () {
        this.state.folderPath = folderPathInput.value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
        this.state.iconField = iconFieldInput.value.trim() || DEFAULT_SETTINGS.iconField;
        this.state.titleField = titleFieldInput.value.trim() || DEFAULT_SETTINGS.titleField;
        this.state.filterField = filterFieldInput.value.trim();
        this.state.filterValue = filterValueInput.value.trim();
        this.state.search = searchInput.value.trim();
        this.state.sortMode = sortSelect.value;
        this.state.cellSize = normalizeNumber(cellSizeInput.value, DEFAULT_SETTINGS.cellSize, 12, 40);
        this.state.cellGap = normalizeNumber(cellGapInput.value, DEFAULT_SETTINGS.cellGap, 0, 12);
        this.state.iconScale = normalizeNumber(iconScaleInput.value, DEFAULT_SETTINGS.iconScale, 0.5, 2);
        this.state.includeWithoutIcon = includeInput.checked;

        var mergedSettings = normalizeSettings(Object.assign({}, this.plugin.settings, {
          folderPath: this.state.folderPath,
          filterField: this.state.filterField,
          filterValue: this.state.filterValue,
          iconField: this.state.iconField,
          titleField: this.state.titleField,
          includeWithoutIcon: this.state.includeWithoutIcon,
          sortMode: this.state.sortMode,
          cellSize: this.state.cellSize,
          cellGap: this.state.cellGap,
          iconScale: this.state.iconScale
        }));

        var forest = collectForestData(this.plugin.app, mergedSettings, this.state);
        clearElement(graphHost);
        clearElement(summaryHost);
        renderGraph(graphHost, forest, this.plugin, { settings: mergedSettings, showLegend: this.plugin.settings.showLegend });
        summaryHost.textContent = "已显示 " + String(forest.shownFiles) + " / " + String(forest.totalFiles) + " 篇 Markdown 笔记";
      }.bind(this);

      [folderPathInput, iconFieldInput, titleFieldInput, filterFieldInput, filterValueInput, searchInput, cellSizeInput, cellGapInput, iconScaleInput].forEach(function (input) {
        input.addEventListener("input", renderCurrent);
      });
      sortSelect.addEventListener("change", renderCurrent);
      includeInput.addEventListener("change", renderCurrent);
      refreshButton.addEventListener("click", renderCurrent);
      shuffleButton.addEventListener("click", function () {
        sortSelect.value = "random";
        renderCurrent();
      });
      saveButton.addEventListener("click", async function () {
        this.plugin.settings = normalizeSettings(Object.assign({}, this.plugin.settings, {
          folderPath: folderPathInput.value.trim(),
          filterField: filterFieldInput.value.trim(),
          filterValue: filterValueInput.value.trim(),
          iconField: iconFieldInput.value.trim() || DEFAULT_SETTINGS.iconField,
          titleField: titleFieldInput.value.trim() || DEFAULT_SETTINGS.titleField,
          includeWithoutIcon: includeInput.checked,
          sortMode: sortSelect.value,
          cellSize: cellSizeInput.value,
          cellGap: cellGapInput.value,
          iconScale: iconScaleInput.value
        }));
        await this.plugin.saveSettings();
        new NoticeCtor("数字花园森林默认设置已保存。");
      }.bind(this));

      renderCurrent();
    }
  }

  class GardenSettingTab extends PluginSettingTabBase {
    constructor(app, plugin) {
      super(app, plugin);
      this.plugin = plugin;
    }

    display() {
      var containerEl = this.containerEl;
      clearElement(containerEl);

      appendEl(containerEl, "h2", { text: "digital-garden-visualizer" });

      new SettingCtor(containerEl)
        .setName("笔记范围")
        .setDesc("只显示这个文件夹下的笔记。路径要写 Obsidian 库内相对路径。")
        .addText(function (text) {
          text
            .setPlaceholder("60 🌠 AETHER/🍊 TANGERINE")
            .setValue(this.plugin.settings.folderPath || "")
            .onChange(async function (value) {
              this.plugin.settings.folderPath = value.trim();
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("发布筛选字段")
        .setDesc("用于判断笔记是否进入花园，与你的发布 YAML 保持一致。")
        .addText(function (text) {
          text
            .setPlaceholder("dg-publish")
            .setValue(this.plugin.settings.filterField || "")
            .onChange(async function (value) {
              this.plugin.settings.filterField = value.trim();
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("发布筛选值")
        .setDesc("默认只显示 dg-publish 为 true 的笔记。")
        .addText(function (text) {
          text
            .setPlaceholder("true")
            .setValue(valueToText(this.plugin.settings.filterValue))
            .onChange(async function (value) {
              this.plugin.settings.filterValue = value.trim();
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("成熟度字段")
        .setDesc("读取每篇笔记成熟度或图标类型的 YAML 字段。")
        .addText(function (text) {
          text
            .setPlaceholder("dg-note-icon")
            .setValue(this.plugin.settings.iconField)
            .onChange(async function (value) {
              this.plugin.settings.iconField = value.trim() || DEFAULT_SETTINGS.iconField;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("标题字段")
        .setDesc("用于节点悬浮标题的 YAML 字段。没有这个字段时会使用文件名。")
        .addText(function (text) {
          text
            .setPlaceholder("title")
            .setValue(this.plugin.settings.titleField)
            .onChange(async function (value) {
              this.plugin.settings.titleField = value.trim() || DEFAULT_SETTINGS.titleField;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("图标路径前缀")
        .setDesc("你的图标目录。这里要写 Obsidian 库内相对路径，不要写 Windows 绝对路径。")
        .addText(function (text) {
          text
            .setPlaceholder("60 🌠 AETHER/🍊 TANGERINE/img")
            .setValue(this.plugin.settings.iconPathPrefix)
            .onChange(async function (value) {
              this.plugin.settings.iconPathPrefix = value.trim();
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("默认图标")
        .setDesc("当选择包含未标记成熟度的笔记时，这些笔记会使用默认图标。")
        .addDropdown(function (dropdown) {
          Object.keys(BUILTIN_ICONS).forEach(function (key) {
            dropdown.addOption(key, BUILTIN_ICONS[key].label);
          });
          dropdown
            .setValue(this.plugin.settings.defaultIcon)
            .onChange(async function (value) {
              this.plugin.settings.defaultIcon = value || DEFAULT_SETTINGS.defaultIcon;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("包含未标记成熟度的笔记")
        .setDesc("开启后，没有 dg-note-icon 的笔记也会显示出来。")
        .addToggle(function (toggle) {
          toggle
            .setValue(this.plugin.settings.includeWithoutIcon)
            .onChange(async function (value) {
              this.plugin.settings.includeWithoutIcon = value;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("在新面板打开笔记")
        .setDesc("开启后，点击森林节点会在新面板打开对应笔记。")
        .addToggle(function (toggle) {
          toggle
            .setValue(this.plugin.settings.openInNewPane)
            .onChange(async function (value) {
              this.plugin.settings.openInNewPane = value;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("显示图例")
        .setDesc("在森林图下方显示各类图标数量。")
        .addToggle(function (toggle) {
          toggle
            .setValue(this.plugin.settings.showLegend)
            .onChange(async function (value) {
              this.plugin.settings.showLegend = value;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("默认排序")
        .setDesc("交互视图初次打开时使用的排序方式。")
        .addDropdown(function (dropdown) {
          [
            ["random", "随机"],
            ["title", "标题"],
            ["path", "路径"],
            ["icon", "图标"]
          ].forEach(function (item) {
            dropdown.addOption(item[0], item[1]);
          });
          dropdown
            .setValue(this.plugin.settings.sortMode)
            .onChange(async function (value) {
              this.plugin.settings.sortMode = value || DEFAULT_SETTINGS.sortMode;
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("格子大小")
        .setDesc("控制每个节点占据的网格尺寸。数值越小，森林越紧凑。")
        .addText(function (text) {
          text
            .setPlaceholder("18")
            .setValue(String(this.plugin.settings.cellSize || DEFAULT_SETTINGS.cellSize))
            .onChange(async function (value) {
              this.plugin.settings.cellSize = normalizeNumber(value, DEFAULT_SETTINGS.cellSize, 12, 40);
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("节点间距")
        .setDesc("控制节点之间的空隙。设置为 0 会更接近紧密花园效果。")
        .addText(function (text) {
          text
            .setPlaceholder("0")
            .setValue(String(this.plugin.settings.cellGap || DEFAULT_SETTINGS.cellGap))
            .onChange(async function (value) {
              this.plugin.settings.cellGap = normalizeNumber(value, DEFAULT_SETTINGS.cellGap, 0, 12);
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("图标缩放")
        .setDesc("单独控制图标大小。小于 1 会更清爽，大于 1 会更醒目。")
        .addText(function (text) {
          text
            .setPlaceholder("0.85")
            .setValue(String(this.plugin.settings.iconScale || DEFAULT_SETTINGS.iconScale))
            .onChange(async function (value) {
              this.plugin.settings.iconScale = normalizeNumber(value, DEFAULT_SETTINGS.iconScale, 0.5, 2);
              await this.plugin.saveSettings();
            }.bind(this));
        }.bind(this));

      new SettingCtor(containerEl)
        .setName("图标映射")
        .setDesc("用 JSON 自定义别名、图例名称或图标文件。")
        .addTextArea(function (text) {
          text
            .setPlaceholder('{"idea":{"icon":"signpost","label":"灵感"},"book":{"src":"60 🌠 AETHER/🍊 TANGERINE/img/book.svg","label":"书籍"}}')
            .setValue(JSON.stringify(this.plugin.settings.iconMap || {}, null, 2))
            .onChange(async function (value) {
              try {
                this.plugin.settings.iconMap = JSON.parse(value || "{}");
                await this.plugin.saveSettings();
              } catch (e) {
                new NoticeCtor("图标映射必须是有效的 JSON。");
              }
            }.bind(this));
          if (text.inputEl) text.inputEl.rows = 8;
        }.bind(this));
    }
  }

  class DigitalGardenPlugin extends PluginBase {
    async onload() {
      await this.loadSettings();

      this.registerView(VIEW_TYPE_DIGITAL_GARDEN, function (leaf) {
        return new DigitalGardenView(leaf, this);
      }.bind(this));

      if (typeof this.addRibbonIcon === "function") {
        this.addRibbonIcon("sprout", "打开 digital-garden-visualizer", function () {
          this.activateView();
        }.bind(this));
      }

      this.addCommand({
        id: "open-digital-garden-visualizer",
        name: "打开 digital-garden-visualizer",
        callback: function () {
          this.activateView();
        }.bind(this)
      });

      this.addCommand({
        id: "shuffle-digital-garden-visualizer",
        name: "重新随机 digital-garden-visualizer",
        callback: function () {
          this.refreshOpenViews();
        }.bind(this)
      });

      this.registerMarkdownCodeBlockProcessor("digital-garden", function (source, el) {
        this.renderMarkdownBlock(source, el);
      }.bind(this));

      this.addSettingTab(new GardenSettingTab(this.app, this));
    }

    async onunload() {
      if (this.app && this.app.workspace && this.app.workspace.detachLeavesOfType) {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIGITAL_GARDEN);
      }
    }

    async loadSettings() {
      var data = {};
      try {
        data = await this.loadData();
      } catch (e) {
        data = {};
      }
      if (data && data.defaultSettings) data = data.defaultSettings;
      this.settings = normalizeSettings(Object.assign({}, DEFAULT_SETTINGS, data || {}));
    }

    async saveSettings() {
      this.settings = normalizeSettings(this.settings);
      await this.saveData(this.settings);
      this.refreshOpenViews();
    }

    async activateView() {
      var workspace = this.app && this.app.workspace;
      if (!workspace) return;

      var leaves = workspace.getLeavesOfType ? workspace.getLeavesOfType(VIEW_TYPE_DIGITAL_GARDEN) : [];
      var leaf = leaves && leaves.length ? leaves[0] : workspace.getLeaf(true);

      await leaf.setViewState({
        type: VIEW_TYPE_DIGITAL_GARDEN,
        active: true
      });

      if (workspace.revealLeaf) {
        workspace.revealLeaf(leaf);
      }
    }

    refreshOpenViews() {
      var workspace = this.app && this.app.workspace;
      if (!workspace || !workspace.getLeavesOfType) return;

      workspace.getLeavesOfType(VIEW_TYPE_DIGITAL_GARDEN).forEach(function (leaf) {
        if (leaf.view && typeof leaf.view.syncStateFromSettings === "function") {
          leaf.view.syncStateFromSettings();
        }
        if (leaf.view && typeof leaf.view.render === "function") {
          leaf.view.render();
        }
      });
    }

    renderMarkdownBlock(source, el) {
      clearElement(el);
      var options = parseCodeBlockOptions(source);

      if (options.error) {
        appendEl(el, "div", { cls: "dgv-error", text: options.error });
        return;
      }

      var settings = normalizeSettings(Object.assign({}, this.settings, options || {}));
      var forest = collectForestData(this.app, settings, options || {});
      renderGraph(el, forest, this, {
        settings: settings,
        showLegend: typeof options.showLegend === "boolean" ? options.showLegend : settings.showLegend
      });
    }

    async openNote(path, event) {
      if (!this.app || !this.app.vault || !this.app.workspace || !path) return;
      var file = this.app.vault.getAbstractFileByPath ? this.app.vault.getAbstractFileByPath(path) : null;
      if (!file) return;

      var openInNewPane = this.settings.openInNewPane || (event && (event.ctrlKey || event.metaKey));
      var leaf = this.app.workspace.getLeaf(openInNewPane);
      await leaf.openFile(file);
    }
  }

  if (typeof module !== "undefined") {
    module.exports = DigitalGardenPlugin;
  }
})();
