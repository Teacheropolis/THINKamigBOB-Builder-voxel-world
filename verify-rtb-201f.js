#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const defaultSourcePath = path.join(__dirname, "index.html");
const negativeValidationRequested = process.argv.includes("--negative-self-test");

function readSource(sourcePath) {
  try {
    return fs.readFileSync(sourcePath, "utf8");
  } catch (error) {
    console.error(`NOT FOUND — index.html source — expected readable file — ${sourcePath}`);
    console.error("RTB-201F STATIC VERIFICATION FAIL");
    process.exit(1);
  }
}

function createScanner(source, sourcePath) {
  function lineOf(index) {
    if (index < 0) return null;
    return source.slice(0, index).split(/\r?\n/).length;
  }

  function locationFor(start, end = start) {
    if (start < 0) return sourcePath;
    const first = lineOf(start);
    const last = lineOf(Math.max(start, end));
    return first === last ? `${sourcePath}:${first}` : `${sourcePath}:${first}-${last}`;
  }

  function skipSpace(index, limit = source.length) {
    while (index < limit) {
      if (/\s/.test(source[index])) {
        index += 1;
        continue;
      }
      if (source[index] === "/" && source[index + 1] === "/") {
        const newline = source.indexOf("\n", index + 2);
        return newline < 0 || newline >= limit ? limit : skipSpace(newline + 1, limit);
      }
      if (source[index] === "/" && source[index + 1] === "*") {
        const close = source.indexOf("*/", index + 2);
        return close < 0 || close + 2 >= limit ? limit : skipSpace(close + 2, limit);
      }
      break;
    }
    return index;
  }

  function matchingDelimiter(openIndex, openChar, closeChar, limit = source.length) {
    if (source[openIndex] !== openChar) return -1;
    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let index = openIndex; index < limit; index += 1) {
      const char = source[index];
      const next = source[index + 1];
      if (lineComment) {
        if (char === "\n") lineComment = false;
        continue;
      }
      if (blockComment) {
        if (char === "*" && next === "/") {
          blockComment = false;
          index += 1;
        }
        continue;
      }
      if (quote) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === "/" && next === "/") {
        lineComment = true;
        index += 1;
        continue;
      }
      if (char === "/" && next === "*") {
        blockComment = true;
        index += 1;
        continue;
      }
      if (char === "'" || char === '"' || char === "`") {
        quote = char;
        continue;
      }
      if (char === openChar) depth += 1;
      if (char === closeChar) {
        depth -= 1;
        if (depth === 0) return index;
      }
    }
    return -1;
  }

  function blockFromBrace(openIndex, label, start = openIndex) {
    const close = matchingDelimiter(openIndex, "{", "}");
    if (close < 0) return null;
    return {
      label,
      text: source.slice(openIndex + 1, close),
      fullText: source.slice(start, close + 1),
      start,
      bodyStart: openIndex + 1,
      bodyEnd: close,
      end: close,
    };
  }

  function callbackAt(argumentStart, label, limit = source.length) {
    let index = skipSpace(argumentStart, limit);
    const start = index;
    if (source.startsWith("async", index) && !/[$\w]/.test(source[index + 5] || "")) {
      index = skipSpace(index + 5, limit);
    }
    if (source.startsWith("function", index) && !/[$\w]/.test(source[index + 8] || "")) {
      index = skipSpace(index + 8, limit);
      if (/[$A-Z_a-z]/.test(source[index] || "")) {
        while (/[$\w]/.test(source[index] || "")) index += 1;
        index = skipSpace(index, limit);
      }
      if (source[index] !== "(") return null;
      const paramsEnd = matchingDelimiter(index, "(", ")", limit);
      if (paramsEnd < 0) return null;
      const brace = skipSpace(paramsEnd + 1, limit);
      return source[brace] === "{" ? blockFromBrace(brace, label, start) : null;
    }

    if (source[index] === "(") {
      const paramsEnd = matchingDelimiter(index, "(", ")", limit);
      if (paramsEnd < 0) return null;
      index = skipSpace(paramsEnd + 1, limit);
    } else {
      while (/[$\w]/.test(source[index] || "")) index += 1;
      index = skipSpace(index, limit);
    }
    if (!source.startsWith("=>", index)) return null;
    index = skipSpace(index + 2, limit);
    if (source[index] === "{") return blockFromBrace(index, label, start);

    let end = index;
    let parentheses = 0;
    let brackets = 0;
    while (end < limit) {
      const char = source[end];
      if (char === "(") parentheses += 1;
      else if (char === ")") {
        if (parentheses === 0 && brackets === 0) break;
        parentheses -= 1;
      } else if (char === "[") brackets += 1;
      else if (char === "]") brackets -= 1;
      else if (char === "," && parentheses === 0 && brackets === 0) break;
      end += 1;
    }
    return {
      label,
      text: source.slice(index, end),
      fullText: source.slice(start, end),
      start,
      bodyStart: index,
      bodyEnd: end,
      end,
    };
  }

  function namedFunction(name, within = null) {
    const rangeStart = within ? within.bodyStart : 0;
    const rangeEnd = within ? within.bodyEnd : source.length;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`\\b(?:async\\s+)?function\\s+${escaped}\\s*\\(`, "g"),
      new RegExp(`\\b(?:window\\s*\\.\\s*)?${escaped}\\s*=\\s*`, "g"),
      new RegExp(`\\b(?:var|let|const)\\s+${escaped}\\s*=\\s*`, "g"),
    ];
    for (const pattern of patterns) {
      pattern.lastIndex = rangeStart;
      let match;
      while ((match = pattern.exec(source)) && match.index < rangeEnd) {
        if (pattern === patterns[0]) {
          const params = source.indexOf("(", match.index);
          const paramsEnd = matchingDelimiter(params, "(", ")", rangeEnd);
          const brace = paramsEnd >= 0 ? skipSpace(paramsEnd + 1, rangeEnd) : -1;
          if (brace >= 0 && source[brace] === "{") {
            const block = blockFromBrace(brace, name, match.index);
            if (block && block.end <= rangeEnd) return block;
          }
        } else {
          const block = callbackAt(match.index + match[0].length, name, rangeEnd);
          if (block && block.end <= rangeEnd) return block;
        }
        pattern.lastIndex = match.index + match[0].length;
      }
    }
    return null;
  }

  function callCallbacks(callee, within = null) {
    const rangeStart = within ? within.bodyStart : 0;
    const rangeEnd = within ? within.bodyEnd : source.length;
    const escaped = callee.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`${escaped}\\s*\\(`, "g");
    pattern.lastIndex = rangeStart;
    const callbacks = [];
    let match;
    while ((match = pattern.exec(source)) && match.index < rangeEnd) {
      const open = source.indexOf("(", match.index);
      const close = matchingDelimiter(open, "(", ")", rangeEnd);
      if (close < 0) break;
      const block = callbackAt(open + 1, `${callee} callback`, close);
      if (block) callbacks.push(block);
      pattern.lastIndex = close + 1;
    }
    return callbacks;
  }

  function assignedCallback(property, within) {
    if (!within) return null;
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\.${escaped}\\s*=\\s*`, "g");
    pattern.lastIndex = within.bodyStart;
    let match;
    while ((match = pattern.exec(source)) && match.index < within.bodyEnd) {
      const block = callbackAt(match.index + match[0].length, `${property} callback`, within.bodyEnd);
      if (block && block.end <= within.bodyEnd) return block;
      pattern.lastIndex = match.index + match[0].length;
    }
    return null;
  }

  function eventListeners(target, eventName) {
    const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedEvent = eventName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `${escapedTarget}\\s*\\.\\s*addEventListener\\s*\\(\\s*["']${escapedEvent}["']\\s*,`,
      "g"
    );
    const blocks = [];
    let match;
    while ((match = pattern.exec(source))) {
      const callOpen = source.indexOf("(", match.index);
      const callClose = matchingDelimiter(callOpen, "(", ")");
      if (callClose < 0) break;
      const comma = source.indexOf(",", callOpen + 1);
      if (comma < 0 || comma >= callClose) {
        pattern.lastIndex = callClose + 1;
        continue;
      }
      const callback = callbackAt(comma + 1, `${target} ${eventName} listener`, callClose);
      if (callback) {
        const afterCallback = source.slice(callback.end + 1, callClose);
        callback.capture = /,\s*true\b/.test(afterCallback) ||
          /,\s*\{[^}]*\bcapture\s*:\s*true\b/.test(afterCallback);
        callback.callEnd = callClose;
        blocks.push(callback);
      }
      pattern.lastIndex = callClose + 1;
    }
    return blocks;
  }

  function listenerByPurpose(target, eventName, purposePatterns) {
    return eventListeners(target, eventName).find((block) =>
      purposePatterns.every((pattern) => pattern.test(block.text))
    ) || null;
  }

  return {
    assignedCallback,
    callCallbacks,
    eventListeners,
    listenerByPurpose,
    locationFor,
    namedFunction,
  };
}

function runChecks(source, sourcePath) {
  const scanner = createScanner(source, sourcePath);
  const results = [];

  function directCheck(condition, pattern, expected) {
    const match = pattern.exec(source);
    results.push({
      status: match ? "PASS" : "NOT FOUND",
      condition,
      expected,
      location: match ? scanner.locationFor(match.index) : sourcePath,
    });
  }

  function relationshipCheck(condition, block, patterns, expected) {
    if (!block) {
      results.push({ status: "NOT FOUND", condition, expected, location: sourcePath });
      return;
    }
    const missing = patterns.filter((pattern) => !pattern.test(block.text));
    results.push({
      status: missing.length ? "FAIL" : "PASS",
      condition,
      expected,
      location: scanner.locationFor(block.start, block.end),
    });
  }

  function orderedCheck(condition, block, firstPattern, secondPattern, expected) {
    if (!block) {
      results.push({ status: "NOT FOUND", condition, expected, location: sourcePath });
      return;
    }
    const first = block.text.search(firstPattern);
    const second = block.text.search(secondPattern);
    results.push({
      status: first >= 0 && second > first ? "PASS" : "FAIL",
      condition,
      expected,
      location: scanner.locationFor(block.start, block.end),
    });
  }

  function captureListenerCheck(condition, block, patterns, expected) {
    relationshipCheck(condition, block, patterns, expected);
    if (block && results[results.length - 1].status === "PASS" && !block.capture) {
      results[results.length - 1].status = "FAIL";
      results[results.length - 1].expected += " with capture enabled";
    }
  }

  const declaration = String.raw`\b(?:var|let|const)\s+`;
  directCheck("Builder event gate function", /\bfunction\s+readToBobBlocksBuilderEvent\s*\(/, "readToBobBlocksBuilderEvent(event)");
  directCheck("Modal interaction blocker API", /window\s*\.\s*isReadToBobModalInteractionBlocked\s*=/, "window.isReadToBobModalInteractionBlocked");
  directCheck("Reader interaction blocker API", /window\s*\.\s*isReadToBobReaderInteraction\s*=/, "window.isReadToBobReaderInteraction");
  directCheck("Modal interaction ownership state", new RegExp(`${declaration}readToBobModalInteractionOwned\\s*=\\s*false\\b`), "readToBobModalInteractionOwned state variable");
  directCheck("Cancel click-in-flight state", new RegExp(`${declaration}readToBobCancelClickInFlight\\s*=\\s*false\\b`), "readToBobCancelClickInFlight state variable");
  relationshipCheck(
    "Builder gate combines modal and reader protection",
    scanner.namedFunction("readToBobBlocksBuilderEvent"),
    [/window\s*\.\s*isReadToBobModalInteractionBlocked\s*\(/, /window\s*\.\s*isReadToBobReaderInteraction\s*\(\s*event\s*\)/],
    "readToBobBlocksBuilderEvent(event) must independently consult both blocker APIs"
  );

  const builderPaths = [
    {
      condition: "View-cube click gate",
      target: "viewCubeCanvas",
      event: "click",
      purpose: [/viewDiceMoved/, /viewDiceRaycaster/],
      behavior: [/viewDiceRaycaster\s*\.\s*intersectObject/, /setView\s*\(/],
    },
    {
      condition: "View-cube double-click gate",
      target: "viewCubeCanvas",
      event: "dblclick",
      purpose: [/setView\s*\(\s*["']home["']\s*\)/],
      behavior: [/setView\s*\(\s*["']home["']\s*\)/],
    },
    {
      condition: "View-cube drag gate",
      target: "viewCubeCanvas",
      event: "mousedown",
      purpose: [/viewDiceDragging/, /viewDiceLastX/],
      behavior: [/viewDiceDragging\s*=\s*true/, /viewDiceLastX\s*=\s*event\s*\.\s*clientX/],
    },
    {
      condition: "Primary camera drag gate",
      target: "document",
      event: "mousedown",
      purpose: [/\bisDragging\b/, /previousMouseX/],
      behavior: [/isDragging\s*=\s*true/, /previousMouseX\s*=\s*event\s*\.\s*clientX/],
    },
    {
      condition: "Keyboard shortcut gate",
      target: "document",
      event: "keydown",
      purpose: [/(?:ctrlKey|metaKey)/, /undoLast\s*\(/],
      behavior: [/(?:ctrlKey|metaKey)/, /undoLast\s*\(/],
    },
    {
      condition: "Wheel or zoom gate",
      target: "document",
      event: "wheel",
      purpose: [/cameraDistance/, /deltaY/],
      behavior: [/cameraDistance\s*[+-]=/, /updateCamera\s*\(/],
    },
    {
      condition: "Arrow-key camera gate",
      target: "document",
      event: "keydown",
      purpose: [/ArrowLeft/, /ArrowRight/, /ArrowUp/, /ArrowDown/],
      behavior: [/ArrowLeft/, /ArrowRight/, /ArrowUp/, /ArrowDown/, /updateCamera\s*\(/],
    },
    {
      condition: "World click and placement or selection gate",
      target: "document",
      event: "click",
      purpose: [/raycaster\s*\.\s*intersectObjects/, /(?:selectConnectedBlocks|createStudentShape)/],
      behavior: [/raycaster\s*\.\s*intersectObjects/, /(?:selectConnectedBlocks|createStudentShape)/],
    },
    {
      condition: "Context-menu and deletion gate",
      target: "document",
      event: "contextmenu",
      purpose: [/scene\s*\.\s*remove/, /blocks\s*\.\s*splice/],
      behavior: [/scene\s*\.\s*remove/, /blocks\s*\.\s*splice/],
    },
  ];

  builderPaths.forEach((pathCheck) => {
    const listener = scanner.listenerByPurpose(pathCheck.target, pathCheck.event, pathCheck.purpose);
    relationshipCheck(
      pathCheck.condition,
      listener,
      [/readToBobBlocksBuilderEvent\s*\(\s*event\s*\)/, ...pathCheck.behavior],
      `the exact ${pathCheck.target} ${pathCheck.event} callback must contain its Builder behavior and readToBobBlocksBuilderEvent(event)`
    );
  });

  const modalListenerSpecs = [
    ["Pointer event capture interception", "pointerdown", [/isReadToBobCountdownPopupVisible\s*\(/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/]],
    ["Touch event capture interception", "touchstart", [/isReadToBobCountdownPopupVisible\s*\(/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/]],
    ["Mouse event capture interception", "mousedown", [/isReadToBobCountdownPopupVisible\s*\(/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/]],
    ["Click event capture interception", "click", [/(?:isReadToBobCountdownPopupVisible\s*\(|popup\s*&&\s*!\s*popup\s*\.\s*hidden)/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/]],
    ["Context-menu event capture interception", "contextmenu", [/isReadToBobCountdownPopupVisible\s*\(/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/]],
    ["Keyboard event capture interception", "keydown", [/isReadToBobCountdownPopupVisible\s*\(/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/]],
  ];
  modalListenerSpecs.forEach(([condition, eventName, purpose]) => {
    const listener = scanner.listenerByPurpose("window", eventName, purpose);
    captureListenerCheck(
      condition,
      listener,
      purpose,
      `the exact capture-phase ${eventName} callback must intercept modal-owned input`
    );
  });

  relationshipCheck(
    "Modal-owned input stops before Builder handlers",
    scanner.namedFunction("blockReadToBobModalEvent"),
    [/event\s*\.\s*stopPropagation\s*\(\s*\)/, /event\s*\.\s*stopImmediatePropagation\s*\(\s*\)/],
    "blockReadToBobModalEvent(event) must call stopPropagation and stopImmediatePropagation"
  );

  directCheck("Trailing compatibility-click suppression state", new RegExp(`${declaration}suppressReadToBobTrailingClick\\s*=\\s*false\\b`), "suppressReadToBobTrailingClick state variable");
  relationshipCheck(
    "Compatibility-event cleanup",
    scanner.namedFunction("clearReadToBobCompatibilitySuppression"),
    [/suppressReadToBobTrailingClick\s*=\s*false/, /clearTimeout\s*\(\s*suppressReadToBobTrailingClickTimer\s*\)/, /suppressReadToBobTrailingClickTimer\s*=\s*null/],
    "cleanup must clear the suppression flag and its timer"
  );

  const modalClick = scanner.listenerByPurpose("window", "click", [/readToBobCancelClickInFlight/, /suppressReadToBobTrailingClick/]);
  relationshipCheck(
    "Cancel click-in-flight ownership",
    modalClick,
    [/readToBobCancelClickInFlight\s*=\s*true/, /readToBobCancelClickInFlight\s*=\s*false/],
    "the exact modal click callback must establish and clear readToBobCancelClickInFlight"
  );
  orderedCheck(
    "Cancel ownership lasts through current click dispatch",
    modalClick,
    /readToBobCancelClickInFlight\s*=\s*true/,
    /(?:window\s*\.\s*)?setTimeout\s*\(/,
    "Cancel ownership must be established before asynchronous clearing is scheduled"
  );
  relationshipCheck(
    "Trailing compatibility click is suppressed",
    modalClick,
    [/suppressReadToBobTrailingClick/, /clearReadToBobCompatibilitySuppression\s*\(\s*\)/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/],
    "the exact modal click callback must consume an armed trailing compatibility click"
  );
  relationshipCheck(
    "New Builder pointerdown clears obsolete suppression",
    scanner.listenerByPurpose("window", "pointerdown", [/isReadToBobCountdownPopupVisible/, /resetReadToBobModalInteractionOwnership/]),
    [/!\s*popupVisible/, /resetReadToBobModalInteractionOwnership\s*\(\s*\)/, /\breturn\b/],
    "the exact modal pointerdown callback must reset ownership for genuinely new Builder input"
  );

  directCheck("Asynchronous attempt token state", new RegExp(`${declaration}readToBobAttemptToken\\s*=\\s*0\\b`), "readToBobAttemptToken state variable");
  const cancellation = scanner.namedFunction("cancelReadToBobStartup");
  relationshipCheck(
    "Attempt token invalidation during cancellation",
    cancellation,
    [/(?:\+\+\s*readToBobAttemptToken|readToBobAttemptToken\s*\+\+|readToBobAttemptToken\s*\+=\s*1)/],
    "cancelReadToBobStartup must increment readToBobAttemptToken"
  );

  const microphone = scanner.namedFunction("prepareReadToBobMicrophone");
  const microphoneThen = scanner.callCallbacks(".then", microphone)[0] || null;
  const microphoneCatch = scanner.callCallbacks(".catch", microphone)[0] || null;
  const microphoneFinally = scanner.callCallbacks(".finally", microphone)[0] || null;
  relationshipCheck(
    "Token check in microphone-permission resolve callback",
    microphoneThen,
    [/attemptToken\s*!==\s*readToBobAttemptToken/],
    "the isolated getUserMedia resolve callback must reject a stale attempt token"
  );
  relationshipCheck(
    "Token check in microphone-permission rejection callback",
    microphoneCatch,
    [/attemptToken\s*!==\s*readToBobAttemptToken/],
    "the isolated getUserMedia rejection callback must reject a stale attempt token"
  );
  relationshipCheck(
    "Token check in microphone-permission finalizer",
    microphoneFinally,
    [/attemptToken\s*===\s*readToBobAttemptToken/],
    "the isolated getUserMedia finalizer must update state only for the current token"
  );
  relationshipCheck(
    "Stale microphone stream rejection and cleanup",
    microphoneThen,
    [/attemptToken\s*!==\s*readToBobAttemptToken/, /stream\s*\.\s*getTracks\s*\(\s*\)/, /track\s*\.\s*stop\s*\(\s*\)/, /return\s+false/],
    "the isolated permission resolve callback must stop all tracks and reject a stale stream"
  );

  const countdown = scanner.namedFunction("beginReadToBobCountdown");
  const countDownCallback = scanner.namedFunction("countDown", countdown);
  const timeoutCallbacks = scanner.callCallbacks("setTimeout", countdown);
  const listeningTimeout = timeoutCallbacks.find((block) => /beginReadToBobListening\s*\(/.test(block.text)) || null;
  relationshipCheck(
    "Token check in countdown step callback",
    countDownCallback,
    [/attemptToken\s*!==\s*readToBobAttemptToken/, /!\s*countingDown/],
    "the isolated countDown callback must reject a stale token or canceled countdown"
  );
  relationshipCheck(
    "Token check in countdown completion callback",
    listeningTimeout,
    [/attemptToken\s*!==\s*readToBobAttemptToken/, /!\s*countingDown/, /beginReadToBobListening\s*\(\s*attemptToken\s*\)/],
    "the isolated countdown completion callback must validate its token before starting recognition"
  );

  const recognition = scanner.namedFunction("beginReadToBobListening");
  ["onstart", "onresult", "onerror", "onend"].forEach((property) => {
    relationshipCheck(
      `Token check in recognition ${property} callback`,
      scanner.assignedCallback(property, recognition),
      [/attemptToken\s*!==\s*readToBobAttemptToken/],
      `the isolated recognition ${property} callback must reject a stale attempt token`
    );
  });

  directCheck("Microphone release function", /\bfunction\s+releaseReadToBobMicrophone\s*\(/, "releaseReadToBobMicrophone()");
  relationshipCheck(
    "All acquired media tracks are stopped",
    scanner.namedFunction("releaseReadToBobMicrophone"),
    [/readingMicrophoneStream\s*\.\s*getTracks\s*\(\s*\)/, /track\s*\.\s*stop\s*\(\s*\)/, /readingMicrophoneStream\s*=\s*null/],
    "releaseReadToBobMicrophone must stop every acquired track and clear the stream reference"
  );
  relationshipCheck(
    "Countdown timer clearing",
    cancellation,
    [/clearTimeout\s*\(\s*countdownTimer\s*\)/, /countdownTimer\s*=\s*null/],
    "the isolated cancellation function must clear and null countdownTimer"
  );
  relationshipCheck(
    "Recognition abort or stop during cancellation",
    cancellation,
    [/activeRecognition\s*\.\s*(?:abort|stop)\s*\(\s*\)/],
    "the isolated cancellation function must abort or stop its active recognition instance"
  );

  const stop = scanner.namedFunction("stopReadToBobListening");
  relationshipCheck(
    "Cleanup during Stop startup branch",
    stop,
    [/cancelReadToBobStartup\s*\(/, /abortRecognition\s*:\s*true/, /releaseMicrophone\s*:\s*true/],
    "the isolated Stop function must cancel startup with recognition and microphone cleanup"
  );
  relationshipCheck(
    "Cleanup during Stop active-recognition branch",
    stop,
    [/recognition\s*\.\s*stop\s*\(\s*\)/, /releaseReadToBobMicrophone\s*\(\s*\)/],
    "the isolated Stop function must stop active recognition and release the microphone"
  );

  const panelReset = scanner.namedFunction("resetReadToBobPractice");
  relationshipCheck(
    "Cleanup during panel closure",
    panelReset,
    [/cancelReadToBobStartup\s*\(/, /abortRecognition\s*:\s*true/, /releaseMicrophone\s*:\s*true/, /cancelReadToBobSpeech\s*\(\s*\)/],
    "the isolated panel reset function must cancel recognition, microphone, and speech"
  );
  relationshipCheck(
    "Modal ownership reset during closure",
    scanner.namedFunction("toggleReadToBobPractice"),
    [/resetReadToBobPractice\s*\(\s*\)/, /resetReadToBobModalInteractionOwnership\s*\(\s*\)/],
    "the isolated panel toggle function must reset practice and modal ownership during closure"
  );

  relationshipCheck(
    "Cleanup on window blur",
    scanner.listenerByPurpose("window", "blur", [/resetReadToBobModalInteractionOwnership/, /resetReadToBobPanelInteraction/]),
    [/resetReadToBobModalInteractionOwnership\s*\(\s*\)/, /resetReadToBobPanelInteraction\s*\(\s*\)/, /readToBobCancelClickInFlight\s*=\s*false/],
    "the isolated window blur callback must reset modal, panel, and cancel ownership"
  );
  relationshipCheck(
    "Cleanup on document visibility loss",
    scanner.listenerByPurpose("document", "visibilitychange", [/document\s*\.\s*hidden/, /resetReadToBobModalInteractionOwnership/]),
    [/document\s*\.\s*hidden/, /resetReadToBobModalInteractionOwnership\s*\(\s*\)/, /resetReadToBobPanelInteraction\s*\(\s*\)/, /readToBobCancelClickInFlight\s*=\s*false/],
    "the isolated visibility callback must reset modal, panel, and cancel ownership when hidden"
  );

  relationshipCheck(
    "Previous-focus capture",
    scanner.namedFunction("captureReadToBobCountdownFocus"),
    [/document\s*\.\s*activeElement/, /readToBobCountdownReturnFocus\s*=\s*active/],
    "captureReadToBobCountdownFocus must save the active focus target outside the popup"
  );
  relationshipCheck(
    "Focus moves to Cancel when countdown opens",
    scanner.namedFunction("setReadToBobCountdown"),
    [/value\s*&&\s*popupWasHidden/, /readToBobCountdownCancelButton/, /cancelButton\s*\.\s*focus\s*\(\s*\)/],
    "the isolated countdown display function must focus Cancel when the popup opens"
  );
  relationshipCheck(
    "Tab trapping while modal owns interaction",
    scanner.listenerByPurpose("window", "keydown", [/event\s*\.\s*key\s*===\s*["']Tab["']/, /readToBobCountdownCancelButton/]),
    [/isReadToBobCountdownPopupVisible\s*\(\s*\)/, /blockReadToBobModalEvent\s*\(\s*event\s*\)/, /cancel\s*\.\s*focus\s*\(\s*\)/],
    "the isolated modal keydown callback must stop Tab and return focus to Cancel"
  );
  relationshipCheck(
    "Focus restoration after cancellation or closure",
    cancellation,
    [/restoreReadToBobCountdownFocus\s*\(\s*\)/],
    "the isolated cancellation function must restore countdown focus"
  );
  relationshipCheck(
    "Stop, Start, and Close fallback focus targets",
    scanner.namedFunction("restoreReadToBobCountdownFocus"),
    [/readToBobStopButton/, /readToBobListenButton/, /readToBobCloseButton/, /target\s*\.\s*focus\s*\(\s*\)/],
    "focus restoration must provide Stop, Start, and Close fallbacks"
  );

  return results;
}

function printResults(results) {
  let failed = false;
  results.forEach((result) => {
    if (result.status !== "PASS") failed = true;
    let output = `${result.status} — ${result.condition}`;
    if (result.status !== "PASS") {
      output += ` — missing condition: ${result.condition}; expected: ${result.expected}`;
    }
    output += ` — examined: ${result.location}`;
    console.log(output);
  });
  console.log(failed ? "RTB-201F STATIC VERIFICATION FAIL" : "RTB-201F STATIC VERIFICATION PASS");
  return !failed;
}

function removeFirstWithin(source, anchor, fragment) {
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex < 0) return null;
  const fragmentIndex = source.indexOf(fragment, anchorIndex);
  if (fragmentIndex < 0) return null;
  return source.slice(0, fragmentIndex) + source.slice(fragmentIndex + fragment.length);
}

function replaceFirstWithin(source, anchor, fragment, replacement) {
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex < 0) return null;
  const fragmentIndex = source.indexOf(fragment, anchorIndex);
  if (fragmentIndex < 0) return null;
  return source.slice(0, fragmentIndex) + replacement +
    source.slice(fragmentIndex + fragment.length);
}

function runNegativeValidation(source) {
  const mutations = [
    {
      name: "view-cube click gate",
      expected: "View-cube click gate",
      mutate: (value) => removeFirstWithin(value, 'viewCubeCanvas.addEventListener("click"', "if(readToBobBlocksBuilderEvent(event)) return;"),
    },
    {
      name: "world-click gate",
      expected: "World click and placement or selection gate",
      mutate: (value) => removeFirstWithin(value, "document.addEventListener('click', (event)=>", "if(readToBobBlocksBuilderEvent(event)) return;"),
    },
    {
      name: "microphone-permission token check",
      expected: "Token check in microphone-permission resolve callback",
      mutate: (value) => replaceFirstWithin(
        value,
        "function prepareReadToBobMicrophone",
        "if(attemptToken !== readToBobAttemptToken){",
        "if(false){"
      ),
    },
    {
      name: "countdown token check",
      expected: "Token check in countdown completion callback",
      mutate: (value) => removeFirstWithin(value, "countdownTimer=window.setTimeout(function(){", "if(attemptToken !== readToBobAttemptToken || !countingDown) return;"),
    },
    {
      name: "recognition callback token check",
      expected: "Token check in recognition onresult callback",
      mutate: (value) => removeFirstWithin(value, "activeRecognition.onresult=function(event){", "if(attemptToken !== readToBobAttemptToken || recognition !== activeRecognition) return;"),
    },
    {
      name: "Cancel click-in-flight ownership",
      expected: "Cancel click-in-flight ownership",
      mutate: (value) => removeFirstWithin(value, 'window.addEventListener("click",function(event){', "readToBobCancelClickInFlight=true;"),
    },
    {
      name: "microphone cleanup",
      expected: "All acquired media tracks are stopped",
      mutate: (value) => removeFirstWithin(value, "function releaseReadToBobMicrophone", "track.stop();"),
    },
    {
      name: "focus restoration",
      expected: "Focus restoration after cancellation or closure",
      mutate: (value) => removeFirstWithin(value, "function cancelReadToBobStartup", "restoreReadToBobCountdownFocus();"),
    },
  ];

  let passed = true;
  mutations.forEach((mutation) => {
    const mutated = mutation.mutate(source);
    if (mutated === null) {
      passed = false;
      console.log(`FAIL — negative mutation: ${mutation.name} — mutation target was not found`);
      return;
    }
    const results = runChecks(mutated, `${defaultSourcePath} [in-memory ${mutation.name} mutation]`);
    const expectedResult = results.find((result) => result.condition === mutation.expected);
    const otherResultsEvaluated = results.length > 1 && results.some((result) => result.condition !== mutation.expected);
    const detected = expectedResult && expectedResult.status !== "PASS" && otherResultsEvaluated;
    if (!detected) passed = false;
    console.log(
      `${detected ? "PASS" : "FAIL"} — negative mutation: ${mutation.name}` +
      ` — corresponding check: ${expectedResult ? expectedResult.status : "NOT FOUND"}` +
      " — unrelated checks independently evaluated"
    );
  });
  console.log(passed ? "NEGATIVE STATIC VALIDATION PASS" : "NEGATIVE STATIC VALIDATION FAIL");
  return passed;
}

const source = readSource(defaultSourcePath);
if (negativeValidationRequested) {
  process.exit(runNegativeValidation(source) ? 0 : 1);
}

process.exit(printResults(runChecks(source, defaultSourcePath)) ? 0 : 1);
