export function hashRouter(routes, appId = "app") {
  const app = document.getElementById(appId);

  if (!app) {
    throw new Error(`Element with ID '${appId}' not found.`);
  }

  // 라우팅 함수
  const render = () => {
    const hash = window.location.hash.slice(1) || "/"; // `#` 제거
    const component = routes[hash] || routes["*"]; // 404 처리
    app.innerHTML = ""; // 기존 내용을 비움
    app.appendChild(component()); // 새 컴포넌트를 DOM에 추가
  };

  // hash 변경 이벤트 처리
  window.addEventListener("hashchange", render);

  render();

  // 초기 렌더링
  return render;
}

export function elem(tagName, options = {}, children) {
  if (typeof tagName !== "string" || !tagName.trim()) {
    throw new Error(
      `tagName은 비어 있지 않은 문자열이어야 합니다. 받은 값: ${tagName}`
    );
  }

  const element = document.createElement(tagName);

  // 옵션과 자식 처리 분리
  if (isChildren(options)) {
    children = options;
    options = {}; // 옵션이 없으므로 빈 객체 할당
  }

  setAttributesAndEvents(element, options);

  // children 처리
  if (children !== undefined && children !== null) {
    appendChildren(element, children);
  }

  return element;
}

/**
 * Check if the given value is a valid child (string, number, or array).
 * @param {*} value
 * @returns {boolean}
 */
function isChildren(value) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    Array.isArray(value) ||
    value instanceof HTMLElement
  );
}

/**
 * Set attributes and events on the element.
 * @param {HTMLElement} element - The element to apply attributes and events to.
 * @param {object} options - The options containing attributes and events.
 */
function setAttributesAndEvents(element, options) {
  Object.keys(options).forEach((key) => {
    const value = options[key];

    if (typeof value === "function" && key.startsWith("on")) {
      // 이벤트 처리
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, (event) =>
        value.call(element, event)
      );
    } else if (key === "class") {
      // 클래스 처리
      element.className = String(value);
    } else if (key in element) {
      // 직접 설정할 수 있는 속성 처리
      element[key] = value;
    } else {
      // 일반 속성 처리
      element.setAttribute(key, String(value));
    }
  });
}

/**
 * Append children to a parent element.
 * @param {HTMLElement} parent - The parent element.
 * @param {Element|string|number|Array<Element|string|number>} children - The children to append.
 */
function appendChildren(parent, children) {
  if (Array.isArray(children)) {
    children.forEach((child) => appendChildren(parent, child));
  } else if (children instanceof HTMLElement) {
    parent.appendChild(children);
  } else if (typeof children === "string" || typeof children === "number") {
    parent.appendChild(document.createTextNode(String(children)));
  } else {
    throw new Error(
      `children은 Element, string, number, null, undefined 중 하나여야 합니다. 받은 값: ${children}`
    );
  }
}

export const stateManager = {
  callbacks: {},

  /**
   * 상태를 저장합니다.
   * 다양한 타입(string, number, object, null)을 지원하며 내부적으로 타입을 감지합니다.
   *
   * @param {string} key - 상태를 저장할 키.
   * @param {string|number|object|null} value - 저장할 값.
   */
  set(key, value) {
    try {
      let serializedValue;

      // 값에 따른 타입 처리
      if (value === null) {
        serializedValue = "null"; // null을 문자열로 저장
      } else if (typeof value === "string" || typeof value === "number") {
        serializedValue = JSON.stringify({ type: typeof value, value }); // 타입과 값을 함께 저장
      } else if (typeof value === "object") {
        serializedValue = JSON.stringify({ type: "object", value });
      } else {
        throw new Error(
          "Unsupported type. Only string, number, object, or null are allowed."
        );
      }

      localStorage.setItem(key, serializedValue);
      this._triggerCallbacks(key, value); // 콜백 호출
    } catch (error) {
      console.error("Error setting value in localStorage:", error);
    }
  },

  /**
   * 상태를 가져옵니다.
   * 저장된 값을 원래 타입으로 반환합니다.
   *
   * @param {string} key - 상태를 가져올 키.
   * @returns {string|number|object|null} - 원래 타입의 저장된 값.
   */
  get(key) {
    try {
      const serializedValue = localStorage.getItem(key);
      if (!serializedValue) return null;

      // null 값 처리
      if (serializedValue === "null") return null;

      const { type, value } = JSON.parse(serializedValue);

      // 타입에 따라 값 복원
      switch (type) {
        case "string":
          return value;
        case "number":
          return Number(value);
        case "object":
          return value;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error getting value from localStorage:", error);
      return null;
    }
  },

  /**
   * 상태를 갱신하고 업데이트된 값을 반환합니다.
   * @param {string} key - 상태의 키.
   * @param {Function} updater - 현재 값을 기반으로 새로운 값을 반환하는 함수.
   * @returns {*} - 업데이트된 값.
   */
  update(key, updater) {
    const currentValue = this.get(key);
    const newValue = updater(currentValue);
    this.set(key, newValue);
    return newValue;
  },

  /**
   * 상태를 삭제합니다.
   *
   * @param {string} key - 삭제할 상태의 키.
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      this._triggerCallbacks(key, null); // 콜백 호출
    } catch (error) {
      console.error("Error removing value from localStorage:", error);
    }
  },

  /**
   * 모든 상태를 초기화합니다.
   */
  clear() {
    try {
      localStorage.clear();
      Object.keys(this.callbacks).forEach((key) =>
        this._triggerCallbacks(key, null)
      );
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  /**
   * 특정 상태에 변경 콜백을 등록합니다.
   * @param {string} key - 상태 키.
   * @param {Function} callback - 상태 변경 시 호출될 콜백 함수.
   */
  onChange(key, callback) {
    if (!this.callbacks[key]) {
      this.callbacks[key] = [];
    }
    this.callbacks[key].push(callback);
  },

  /**
   * 내부적으로 콜백을 호출합니다.
   * @param {string} key - 상태 키.
   * @param {*} value - 새로운 값.
   * @private
   */
  _triggerCallbacks(key, value) {
    if (this.callbacks[key]) {
      this.callbacks[key].forEach((callback) => callback(value));
    }
  },
};

export const Link = (href, props = {}, children) => {
  // 기존 클래스와 동적 클래스를 병합
  const dynamicClass =
    window.location.hash.slice(1) === href ? "router-active" : "";
  const combinedClass = [props.class, dynamicClass].filter(Boolean).join(" ");

  // class 속성을 명시적으로 props에서 제외하고 처리
  const { class: _, ...otherProps } = props;

  return elem(
    "a",
    {
      href: `#${href}`, // Hash URL로 설정
      onclick: function (e) {
        e.preventDefault(); // 기본 동작 방지
        window.location.hash = href; // Hash URL 변경
      },
      class: combinedClass, // 병합된 클래스 설정
      ...otherProps, // 기타 속성 병합
    },
    children
  );
};
