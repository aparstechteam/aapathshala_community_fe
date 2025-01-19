/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
const properties = [
    "direction", 
    "boxSizing",
    "width", 
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderStyle",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
    "MozTabSize",
  ] as const;
  
  const isBrowser = typeof window !== "undefined";
  const isFirefox = isBrowser && (window as any).mozInnerScreenX != null;
  
  export function getCaretPosition(element: HTMLTextAreaElement) {
    return {
      caretStartIndex: element.selectionStart || 0,
      caretEndIndex: element.selectionEnd || 0,
    };
  }
  
  export function getCurrentWord(element: HTMLTextAreaElement) {
    const text = element.value;
    const { caretStartIndex } = getCaretPosition(element);
  
    let start = caretStartIndex;
    while (start > 0 && /\S/.test(text[start - 1])) {
      start--;
    }
  
    let end = caretStartIndex;
    while (end < text.length && /\S/.test(text[end])) {
      end++;
    }
  
    return text.substring(start, end);
  }
  
  export function replaceWord(element: HTMLTextAreaElement, value: string) {
    const text = element.value;
    const caretPos = element.selectionStart!;
    const wordRegex = /[\w@#]+/g;
    let match;
    let startIndex: number | undefined;
    let endIndex: number | undefined;
  
    while ((match = wordRegex.exec(text)) !== null) {
      startIndex = match.index;
      endIndex = startIndex + match[0].length;
      if (caretPos >= startIndex && caretPos <= endIndex) break;
    }
  
    if (startIndex !== undefined && endIndex !== undefined) {
      const selectionStart = element.selectionStart!;
      const selectionEnd = element.selectionEnd!;
      element.setSelectionRange(startIndex, endIndex);
      document.execCommand("insertText", false, value);
      element.setSelectionRange(
        selectionStart - (endIndex - startIndex) + value.length,
        selectionEnd - (endIndex - startIndex) + value.length
      );
    }
    return ''
  }
  
  export function getCaretCoordinates(
    element: HTMLTextAreaElement,
    position: number,
    options?: { debug: boolean }
  ) {
    if (!isBrowser) {
      throw new Error(
        "textarea-caret-position#getCaretCoordinates should only be called in a browser"
      );
    }
  
    const debug = (options && options.debug) || false;
    if (debug) {
      const el = document.querySelector("#input-textarea-caret-position-mirror-div");
      if (el) el.parentNode?.removeChild(el);
    }
  
    const div = document.createElement("div");
    div.id = "input-textarea-caret-position-mirror-div";
    document.body.appendChild(div);
  
    const style = div.style;
    const computed = window.getComputedStyle(element);
    const isInput = element.nodeName === "INPUT";
  
    style.whiteSpace = "pre-wrap";
    if (!isInput) style.wordWrap = "break-word";
  
    style.position = "absolute";
    if (!debug) style.visibility = "hidden";
  
    properties.forEach((prop) => {
      // @ts-ignore
      style[prop] = computed[prop];
    });
  
    if (isFirefox) {
      if (element.scrollHeight > parseInt(computed.height)) {
        style.overflowY = "scroll";
      }
    } else {
      style.overflow = "hidden";
    }
  
    div.textContent = element.value.substring(0, position);
    if (isInput) div.textContent = div.textContent.replace(/\s/g, "\u00a0");
  
    const span = document.createElement("span");
    span.textContent = element.value.substring(position) || "";
    div.appendChild(span);
  
    const coordinates = {
      top: span.offsetTop + parseInt(computed.borderTopWidth),
      left: span.offsetLeft + parseInt(computed.borderLeftWidth),
      height: parseInt(computed.lineHeight),
    };
  
    if (debug) {
      span.style.backgroundColor = "#aaa";
    } else {
      document.body.removeChild(div);
    }
  
    return coordinates;
  }
  