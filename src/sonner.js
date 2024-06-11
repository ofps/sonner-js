////////////////////////
// Sonner
////////////////////////

////////////////////////
// Constants
////////////////////////
const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = "32px";
const TOAST_LIFETIME = 4000;
const TOAST_WIDTH = 356;
const GAP = 14;
const SWIPE_THRESHOLD = 20;
const TIME_BEFORE_UNMOUNT = 200;

////////////////////////
// Sonner
// The Sonner object is a singleton that provides methods to show different types of toasts.
////////////////////////
window.Sonner = {
  /**
   * Initializes the toasters in the DOM.
   * The function creates a new section element and an ordered list element inside it.
   * @param {Object} options - An object with the following properties:
   * @param {boolean} options.closeButton - A boolean to control the visibility of the close button on the toasts.
   * @param {boolean} options.richColors - A boolean to control the use of rich colors for the toasts.
   * @param {string} options.position - A string to control the position of the toasts. The string is a combination of two values: the vertical position (top or bottom) and the horizontal position (left or right).
   * @returns {void}
   * @example
   * Sonner.init({ closeButton: true, richColors: true, position: "bottom-right" });
   */
  init({
    closeButton = false,
    richColors = false,
    position = "bottom-right",
  } = {}) {
    if (reinitializeToaster()) {
      return;
    }

    renderToaster({ closeButton, richColors, position });
    // loadSonnerStyles();

    const ol = document.getElementById("sonner-toaster-list");
    registerMouseOver(ol);
    registerKeyboardShortcuts(ol);
  },
  /**
   * Shows a new success toast with a specific message.
   * @param {string} msg - The message to display in the toast.
   * @returns {void}
   */
  success(msg, opts = {}) {
    return Sonner.show(msg, { icon: 'success', type: "success", ...opts });
  },
  /**
   * Shows a new error toast with a specific message.
   * @param {string} msg - The message to display in the toast.
   * @returns {void}
   */
  error(msg, opts = {}) {
    return Sonner.show(msg, { icon: 'error', type: "error", ...opts });
  },
  /**
   * Shows a new info toast with a specific message.
   * @param {string} msg - The message to display in the toast.
   * @returns {void}
   */
  info(msg, opts = {}) {
    return Sonner.show(msg, { icon: 'info', type: "info", ...opts });
  },
  /**
   * Shows a new warning toast with a specific message.
   * @param {string} msg - The message to display in the toast.
   * @returns {void}
   */
  warning(msg, opts = {}) {
    return Sonner.show(msg, { icon: 'warning', type: "warning", ...opts });
  },
  /**
   * Shows a promise loading toast
   * @template T promise data type
   * @param {Promise<T>} promise 
   * @param {Object} opts options
   * @param {string} opts.loading message to display while loading
   * @param {string|(data : T) => string} opts.success function callback / message to show when loaded
   * @param {string|(data : Error) => string} opts.success function callback / message to show when errored
   */
  promise(promise, opts = {}) {
    const toast = Sonner.show(opts.loading ?? 'Loading...', {
      icon: 'loading',
      type: 'loading',
      ...opts,
      duration: -1,
    });

    promise
      .then(result => {
        // Update the message and start the timeout
        const msg = typeof opts.success === 'string' ? opts.success : opts.success(result);
        toast.setTitle(msg).setIcon('success').setDuration(opts.duration ?? TOAST_LIFETIME);
        return result;
      })
      .catch(err => {      
        const msg = typeof opts.error === 'string' ? opts.error : opts.error(err);
        toast.setTitle(msg).setIcon('error').setDuration(opts.duration ?? TOAST_LIFETIME);
        throw err;
      });

    return toast;
  },

  /**
   * Shows a new toast with a specific message, description, and type.
   * @param {string} msg - The message to display in the toast.
   * @param {Object} options - An object with the following properties:
   * @param {string} options.type - The type of the toast. The type can be one of the following values: "success", "error", "info", "warning", or "neutral".
   * @param {string} options.description - The description to display in the toast.
   * @returns {void}
   */
  show(msg, opts = {}) {
    const list = document.getElementById("sonner-toaster-list");
    const { toast, id } = renderToast(list, msg, opts);

    // Wait for the toast to be mounted before registering swipe events
    window.setTimeout(function () {
      const el = list.children[0];
      const height = el.getBoundingClientRect().height;

      el.setAttribute("data-mounted", "true");
      el.setAttribute("data-initial-height", height);
      el.style.setProperty("--initial-height", `${height}px`);
      list.style.setProperty("--front-toast-height", `${height}px`);

      registerSwipe(id);
      refreshProperties();
      registerRemoveTimeout(el, opts.duration ?? TOAST_LIFETIME);
    }, 16);
    return toast;
  },
  /**
   * Removes an element with a specific id from the DOM after a delay.
   * The element is marked as removed and any previous unmount timeout is cleared.
   * A new timeout is set to remove the element from its parent.
   * The timeout ensures that all CSS transitions complete before the element is removed.
   *
   * @param {string} id - The data-id attribute of the element to remove.
   */
  remove(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (!el) return;
    el.setAttribute("data-removed", "true");
    refreshProperties();

    const previousTid = el.getAttribute("data-unmount-tid");
    if (previousTid) window.clearTimeout(previousTid);

    const tid = window.setTimeout(function () {
      el.parentElement?.removeChild(el);
    }, TIME_BEFORE_UNMOUNT);
    el.setAttribute("data-unmount-tid", tid);
  },
};

////////////////////////
// Assets
////////////////////////

const getIcon = (type) => {
  switch (type) {
    case "success":
      return SuccessIcon;

    case "info":
      return InfoIcon;

    case "warning":
      return WarningIcon;

    case "error":
      return ErrorIcon;

    case 'loading':
      return Loader;

    default:
      return undefined;
  }
};

const bars = Array(12).fill(0);

const Loader = `
  <div class="sonner-loading-wrapper" data-visible='${true}'>
    <div class="sonner-spinner">
      ${bars.map((_, i) => `<div class="sonner-loading-bar" key="spinner-bar-${i}"></div>`).join('\n')}
    </div>
  </div>
`;


const SuccessIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20">
    <path
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clip-rule="evenodd"
    />
  </svg>`;

const WarningIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fill-rule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
      clip-rule="evenodd"
    />
  </svg>`;

const InfoIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      clip-rule="evenodd"
    />
  </svg>`;

const ErrorIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewbox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
      clip-rule="evenodd"
    />
  </svg>`;

////////////////////////
// Auxiliary functions
////////////////////////

/**
 * Generates a unique id for a toast.
 * The function generates a unique id by combining the current timestamp with a random string.
 * The function returns the unique id as a string.
 * @returns {string} - The unique id.
 * @example
 * const id = genid();
 */
function genid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 12).padStart(12, 0)
  );
}

/**
 * Creates a new toast element and returns it along with its id.
 * The function creates a new list item element and sets its outerHTML to a string containing the toast structure.
 * The function also generates a unique id for the toast and returns it along with the toast element.
 * @param {Element} list - The list element to append the toast to.
 * @param {string} msg - The message to display in the toast.
 * @param {Object} options - An object with the following properties:
 * @param {string} options.type - The type of the toast. The type can be one of the following values: "success", "error", "info", "warning", or "neutral".
 * @param {string} options.description - The description to display in the toast.
 * @returns {Object} - An object with the following properties:
 * @returns {Element} toast - The toast element.
 * @returns {string} id - The unique id of the toast.
 */
function renderToast(list, msg, opts = {}) {
  const toast = document.createElement("div");
  list.prepend(toast);
  const id = genid();
  const count = list.children.length;
  const asset = getIcon(opts.icon) ?? opts.icon;
  

  toast.outerHTML = `<li
  aria-live="polite"
  aria-atomic="true"
  role="status"
  tabindex="0"
  data-id="${id}"
  data-type="${opts.type}"
  data-sonner-toast=""
  data-mounted="false"
  data-styled="true"
  data-promise="false"
  data-removed="false"
  data-visible="true"
  data-y-position="${list.getAttribute("data-y-position")}"
  data-x-position="${list.getAttribute("data-x-position")}"
  data-index="${0}"
  data-front="true"
  data-swiping="false"
  data-dismissible="true"
  data-swipe-out="false"
  data-expanded="false"
  style="--index: 0; --toasts-before: ${0}; --z-index: ${count}; --offset: 0px; --initial-height: 0px;"
    >
      ${list.getAttribute("data-close-button") === "true"
      ? `<button
          aria-label="Close"
          data-disabled=""
          class="absolute top-0.5 right-0.5 border border-neutral-800 text-neutral-800 bg-neutral-100 rounded-sm"
          onclick="Sonner.remove('${id}')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
      : ""
    }
      ${asset
      ? `<div data-icon="" class="">${asset}</div>`
      : `<div data-icon="" class=""></div>`
    }
    <div 
          data-content="" 
          class="">
      <div data-title="" class="">
        ${msg}
      </div>
      ${opts.description
      ? `<div data-description="" class="">${opts.description}</div>`
      : ""
    }
    </div>
</li>
   `;
   
  return { 
    id, 
    toast: {
      target: document.querySelector(`[data-id="${id}"]`),
      setTitle: function (msg, raw = false) {
        const title = document.querySelector(`[data-sonner-toast][data-id=${id}] [data-title]`);
        if (raw)  title.innerHTML = msg;
        else      title.textContent = msg;
        return this;
      },
      setIcon: function (icon) {
        const ico = getIcon(icon) ?? '';    
        document.querySelector(`[data-sonner-toast][data-id=${id}] [data-icon]`).innerHTML = ico;
        return this;
      },
      setDuration: function(duration) {
        registerRemoveTimeout(this.target, duration);
        return this;
      },
      dismiss: function() {
        Sonner.remove(this.target.getAttribute("data-id"))
        return this;
      }
    }
};
}

/**
 * Registers a new remove timeout for a specific element.
 * The function sets a new timeout to remove the element from its parent after a delay.
 * The timeout ensures that all CSS transitions complete before the element is removed.
 * @param {Element} el - The element to register the remove timeout for.
 * @param {number} lifetime - How long the toast will last for
 * @returns {void}
 */
function registerRemoveTimeout(el, lifetime = TOAST_LIFETIME) {
  if (lifetime < 0) return;
  if (!el.getAttribute("data-id")) 
    throw new Error('invalid target for removal');

  // Clear previous duration
  if (el.getAttribute("data-remove-tid"))
    window.clearTimeout(el.getAttribute("data-remove-tid"));

  // Set new timeout
  const tid = window.setTimeout(() => {
    Sonner.remove(el.getAttribute("data-id"));
  }, lifetime);
  el.setAttribute("data-remove-tid", tid);
}

/**
 * Reinitializes the toaster and its children in the DOM.
 * @returns {Element} - The ordered list element with the sonner-toaster-list id.
 */
function reinitializeToaster() {
  const ol = document.getElementById("sonner-toaster-list");
  if (!ol) return;
  for (let i = 0; i < ol.children.length; i++) {
    const el = ol.children[i];
    const id = el.getAttribute("data-id");
    registerSwipe(id);
    refreshProperties();
    registerRemoveTimeout(el);
  }
  return ol;
}

/**
 * Creates the toaster in the DOM.
 * @param {Object} options - An object with the following properties:
 * @param {boolean} options.closeButton - A boolean to control the visibility of the close button on the toasts.
 * @param {boolean} options.richColors - A boolean to control the use of rich colors for the toasts.
 * @param {string} options.position - A string to control the position of the toasts. The string is a combination of two values: the vertical position (top or bottom) and the horizontal position (left or right).
 * @returns {void}
 */
function renderToaster({ closeButton, richColors, position }) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  position = position.split("-");
  el.outerHTML = `
<section aria-label="Notifications alt+T" tabindex="-1">
  <ol
    dir="ltr"
    tabindex="-1"
    data-sonner-toaster="true"
    data-theme="light"
    data-close-button="${closeButton}"
    data-rich-colors="${richColors}"
    data-y-position="${position[0]}"
    data-x-position="${position[1]}"
    style="--front-toast-height: 0px; --offset: ${VIEWPORT_OFFSET}; --width: ${TOAST_WIDTH}px; --gap: ${GAP}px;"
    id="sonner-toaster-list"
  ></ol>
</section>
`;
}

/**
 * Loads the Sonner styles in the DOM.
 * @returns {void}
 */
function loadSonnerStyles() {
  var link = document.createElement("link");
  link.href = "./sonner.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  link.media = "screen";

  document.getElementsByTagName("head")[0].appendChild(link);
}

/**
 * Registers mouse over events on a specific ordered list element in the DOM.
 * @param {Element} ol - The ordered list element to register mouse over events on.
 * @returns {void}
 */
function registerMouseOver(ol) {
  ol.addEventListener("mouseenter", function () {
    for (let i = 0; i < ol.children.length; i++) {
      const el = ol.children[i];
      if (el.getAttribute("data-expanded") === "true") continue;
      el.setAttribute("data-expanded", "true");

      clearRemoveTimeout(el);
    }
  });
  ol.addEventListener("mouseleave", function () {
    for (let i = 0; i < ol.children.length; i++) {
      const el = ol.children[i];
      if (el.getAttribute("data-expanded") === "false") continue;
      el.setAttribute("data-expanded", "false");

      registerRemoveTimeout(el);
    }
  });
}

/**
 * Registers keyboard shortcuts for the ordered list element in the DOM.
 * The function listens for the Alt+T key combination to expand or collapse the toasts.
 * @param {Element} ol - The ordered list element to register keyboard shortcuts for.
 * @returns {void}
 */
function registerKeyboardShortcuts(ol) {
  window.addEventListener("keydown", function (e) {
    if (e.altKey && e.code === "KeyT") {
      if (ol.children.length === 0) return;
      const expanded = ol.children[0].getAttribute("data-expanded");
      const newExpanded = expanded === "true" ? "false" : "true";
      for (let i = 0; i < ol.children.length; i++) {
        ol.children[i].setAttribute("data-expanded", newExpanded);
      }
    }
  });
}

/**
 * Clears the remove timeout for a specific element.
 * @param {Element} el - The element to clear the remove timeout for.
 * @returns {void}
 */
function clearRemoveTimeout(el) {
  const tid = el.getAttribute("data-remove-tid");
  if (tid) window.clearTimeout(tid);
}

/**
 * Refreshes the properties of the children of a specific list element in the DOM.
 * The function iterates over each child of the list, skipping those marked as removed.
 * For each remaining child, it updates various data attributes and CSS properties related to its index, visibility, offset, and z-index.
 * The function also keeps track of the cumulative height of the elements processed so far to calculate the offset for each element.
 */
function refreshProperties() {
  const list = document.getElementById("sonner-toaster-list");
  let heightsBefore = 0;
  let removed = 0;
  for (let i = 0; i < list.children.length; i++) {
    const el = list.children[i];
    if (el.getAttribute("data-removed") === "true") {
      removed++;
      continue;
    }
    const idx = i - removed;
    el.setAttribute("data-index", idx);
    el.setAttribute("data-front", idx === 0 ? "true" : "false");
    el.setAttribute(
      "data-visible",
      idx < VISIBLE_TOASTS_AMOUNT ? "true" : "false",
    );
    el.style.setProperty("--index", idx);
    el.style.setProperty("--toasts-before", idx);
    el.style.setProperty("--offset", `${GAP * idx + heightsBefore}px`);
    el.style.setProperty("--z-index", list.children.length - i);
    heightsBefore += Number(el.getAttribute("data-initial-height"));
  }
}

/**
 * Registers swipe events on an element with a specific id.
 * The element is selected using the id and event listeners are added for pointerdown, pointerup, and pointermove events.
 * The swipe gesture is calculated based on the movement of the pointer and the time taken for the swipe.
 * If the swipe meets a certain threshold or velocity, the element is marked for removal.
 * If the swipe does not meet the threshold, the swipe is reset.
 * For more information on the swipe gesture, see the following article:
 * https://emilkowal.ski/ui/building-a-toast-component
 *
 * @param {string} id - The data-id attribute of the element to register swipe events on.
 */
function registerSwipe(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (!el) return;
  let dragStartTime = null;
  let pointerStart = null;
  const y = el.getAttribute("data-y-position");
  el.addEventListener("pointerdown", function (event) {
    dragStartTime = new Date();
    event.target.setPointerCapture(event.pointerId);
    if (event.target.tagName === "BUTTON") return;
    el.setAttribute("data-swiping", "true");
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  el.addEventListener("pointerup", function (event) {
    pointerStart = null;
    const swipeAmount = Number(
      el.style.getPropertyValue("--swipe-amount").replace("px", "") || 0,
    );
    const timeTaken = new Date().getTime() - dragStartTime.getTime();
    const velocity = Math.abs(swipeAmount) / timeTaken;

    // Remove only if threshold is met
    if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
      el.setAttribute("data-swipe-out", "true");
      Sonner.remove(id);
      return;
    }

    el.style.setProperty("--swipe-amount", "0px");
    el.setAttribute("data-swiping", "false");
  });

  el.addEventListener("pointermove", function (event) {
    if (!pointerStart) return;
    const yPosition = event.clientY - pointerStart.y;
    const xPosition = event.clientX - pointerStart.x;

    const clamp = y === "top" ? Math.min : Math.max;
    const clampedY = clamp(0, yPosition);
    const swipeStartThreshold = event.pointerType === "touch" ? 10 : 2;
    const isAllowedToSwipe = Math.abs(clampedY) > swipeStartThreshold;

    if (isAllowedToSwipe) {
      el.style.setProperty("--swipe-amount", `${yPosition}px`);
    } else if (Math.abs(xPosition) > swipeStartThreshold) {
      // User is swiping in wrong direction so we disable swipe gesture
      // for the current pointer down interaction
      pointerStart = null;
    }
  });
}
