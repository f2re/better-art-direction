export async function collectDomSignals(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0 && rect.width > 0 && rect.height > 0;
    };
    const selectorFor = (element) => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const parts = [];
      let current = element;
      while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
        let part = current.tagName.toLowerCase();
        const stableClass = [...current.classList].find((name) => !/[\d:[\]/]/.test(name));
        if (stableClass) part += `.${CSS.escape(stableClass)}`;
        const parent = current.parentElement;
        if (parent && [...parent.children].filter((child) => child.tagName === current.tagName).length > 1) {
          part += `:nth-of-type(${[...parent.children].filter((child) => child.tagName === current.tagName).indexOf(current) + 1})`;
        }
        parts.unshift(part);
        current = parent;
      }
      return parts.join(" > ");
    };
    const record = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        selector: selectorFor(element), tag: element.tagName.toLowerCase(),
        left: Math.round(rect.left), right: Math.round(rect.right), top: Math.round(rect.top), bottom: Math.round(rect.bottom),
        width: Math.round(rect.width), height: Math.round(rect.height), text: (element.innerText || element.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 120),
      };
    };
    const elements = [...document.querySelectorAll("body *")].filter(isVisible);
    const interactiveSelector = "button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=link],[role=checkbox],[role=radio],[role=switch],[role=tab]";
    const interactive = [...document.querySelectorAll(interactiveSelector)].filter(isVisible);
    const viewportWidth = document.documentElement.clientWidth;
    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0);
    const overflowElements = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > viewportWidth + 1 || rect.left < -1;
    }).slice(0, 20).map(record);
    const clippedText = elements.filter((element) => {
      if (!element.textContent?.trim() || element.children.length > 4) return false;
      const style = getComputedStyle(element);
      const clips = ["hidden", "clip"].includes(style.overflow) || ["hidden", "clip"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflowY) || style.textOverflow === "ellipsis";
      return clips && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
    }).slice(0, 20).map(record);
    const accessibleName = (element) => {
      const labelledBy = element.getAttribute("aria-labelledby");
      const labelledText = labelledBy ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ") : "";
      const label = element.id ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent : "";
      return [element.getAttribute("aria-label"), labelledText, label, element.getAttribute("alt"), element.getAttribute("title"), element.textContent, element.value].filter(Boolean).join(" ").trim();
    };
    const unnamedControls = interactive.filter((element) => !accessibleName(element)).slice(0, 20).map(record);
    const formControlsWithoutLabels = [...document.querySelectorAll("input:not([type=hidden]):not([type=button]):not([type=submit]),select,textarea")].filter(isVisible).filter((element) => {
      if (element.getAttribute("aria-label") || element.getAttribute("aria-labelledby")) return false;
      if (element.closest("label")) return false;
      return !(element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`));
    }).slice(0, 20).map(record);
    const imagesWithoutAlt = [...document.querySelectorAll("img:not([alt])")].filter(isVisible).slice(0, 20).map(record);
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id).filter(Boolean);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].slice(0, 20);
    const smallTargets = interactive.filter((element) => {
      if (element.matches("a") && element.closest("p,li") && getComputedStyle(element).display === "inline") return false;
      const rect = element.getBoundingClientRect();
      return rect.width < 24 || rect.height < 24;
    }).slice(0, 20).map(record);
    const viewportArea = Math.max(1, innerWidth * innerHeight);
    const fixedObstructions = elements.filter((element) => {
      const style = getComputedStyle(element);
      if (!["fixed", "sticky"].includes(style.position)) return false;
      const rect = element.getBoundingClientRect();
      return rect.width * rect.height / viewportArea > 0.3;
    }).slice(0, 12).map(record);
    return {
      title: document.title, lang: document.documentElement.lang,
      h1Count: document.querySelectorAll("h1").length, mainCount: document.querySelectorAll("main").length,
      overflow: { viewportWidth, documentWidth, overflowPixels: Math.max(0, documentWidth - viewportWidth) },
      overflowElements, clippedText, smallTargets, unnamedControls, formControlsWithoutLabels,
      imagesWithoutAlt, duplicateIds, fixedObstructions,
    };
  });
}

export async function collectReducedMotion(page) {
  return page.evaluate(() => document.getAnimations().filter((animation) => {
    const timing = animation.effect?.getComputedTiming?.();
    return animation.playState === "running" && (timing?.iterations === Infinity || (timing?.activeDuration || 0) > 1000);
  }).slice(0, 20).map((animation) => ({ playState: animation.playState, id: animation.id || "", target: animation.effect?.target?.tagName?.toLowerCase?.() || "unknown" })));
}
