// Cursor.js
Math.lerp = (a, b, n) => (1 - n) * a + n * b;

export default class Cursor {
  constructor(opts = {}) {
    this.opts = Object.assign(
      {
        interactiveSelector:
          'a, button, input[type="button"], input[type="submit"], select, textarea, [role="button"], [data-cursor="pointer"], [href], .cursor-pointer, summary, label',
      },
      opts
    );

    this.pos = { curr: null, prev: null };
    this.handlers = {};
    this.create();
    this.init();
    this.rafId = null;
    this.render();
  }

  create() {
    // 创建 cursor DOM
    if (!this.cursor) {
      this.cursor = document.createElement("div");
      this.cursor.id = "cursor";
      this.cursor.classList.add("hidden");
      // 保证不会拦截鼠标事件
      this.cursor.style.pointerEvents = "none";
      document.body.append(this.cursor);
    }
  }

  /**
   * 判断元素是否应该被视为“可点击/pointer”元素
   * 使用结构检测而不是依赖 computed style（因为我们可能隐藏了系统 cursor）
   */
  isInteractiveElement(el) {
    if (!el) return false;
    // closest 会向上查找祖先（包含自身）
    try {
      return !!el.closest(this.opts.interactiveSelector);
    } catch (e) {
      return false;
    }
  }

  move(x, y) {
    // 我们把位置设为鼠标坐标，CSS 用 translate(-50%,-50%) 做居中
    this.cursor.style.left = `${x}px`;
    this.cursor.style.top = `${y}px`;
  }

  init() {
    // 存储可移除的 handler（以便 destroy）
    this.handlers.pointermove = (e) => {
      // 使用 pointer 事件，支持触控/鼠标
      this.pos.curr = { x: e.clientX, y: e.clientY };
      this.cursor.classList.remove("hidden");
    };

    this.handlers.pointerenter = () => {
      this.cursor.classList.remove("hidden");
    };

    this.handlers.pointerleave = () => {
      this.cursor.classList.add("hidden");
    };

    // pointerover/out 用于 hover（注意：使用 closest 判断交互元素）
    this.handlers.pointerover = (e) => {
      const el =
        e.target && e.target.closest
          ? e.target.closest(this.opts.interactiveSelector)
          : null;
      if (el) this.cursor.classList.add("hover");
    };
    this.handlers.pointerout = (e) => {
      const el =
        e.target && e.target.closest
          ? e.target.closest(this.opts.interactiveSelector)
          : null;
      if (el) this.cursor.classList.remove("hover");
    };

    this.handlers.pointerdown = () => this.cursor.classList.add("active");
    this.handlers.pointerup = () => this.cursor.classList.remove("active");

    // 绑定到 document（不会被 Vue 的虚拟 DOM 替换影响）
    document.addEventListener("pointermove", this.handlers.pointermove, {
      passive: true,
    });
    document.addEventListener("pointerenter", this.handlers.pointerenter);
    document.addEventListener("pointerleave", this.handlers.pointerleave);
    document.addEventListener("pointerover", this.handlers.pointerover);
    document.addEventListener("pointerout", this.handlers.pointerout);
    document.addEventListener("pointerdown", this.handlers.pointerdown);
    document.addEventListener("pointerup", this.handlers.pointerup);
  }

  refresh() {
    // 重新创建样式（比如你热重载了 CSS）
    this.destroy(); // 先清理
    this.pos = { curr: null, prev: null };
    this.create();
    this.init();
    this.render();
  }

  destroy() {
    // 移除 style
    if (this.scr && this.scr.parentNode) this.scr.remove();
    // 移除 cursor 元素
    if (this.cursor && this.cursor.parentNode) this.cursor.remove();
    // 卸载事件
    if (this.handlers.pointermove)
      document.removeEventListener("pointermove", this.handlers.pointermove);
    if (this.handlers.pointerenter)
      document.removeEventListener("pointerenter", this.handlers.pointerenter);
    if (this.handlers.pointerleave)
      document.removeEventListener("pointerleave", this.handlers.pointerleave);
    if (this.handlers.pointerover)
      document.removeEventListener("pointerover", this.handlers.pointerover);
    if (this.handlers.pointerout)
      document.removeEventListener("pointerout", this.handlers.pointerout);
    if (this.handlers.pointerdown)
      document.removeEventListener("pointerdown", this.handlers.pointerdown);
    if (this.handlers.pointerup)
      document.removeEventListener("pointerup", this.handlers.pointerup);
    // cancel animation frame
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  render() {
    if (this.pos.curr == null) {
      // nothing to render yet
      this.rafId = requestAnimationFrame(() => this.render());
      return;
    }
    if (this.pos.prev) {
      this.pos.prev.x = Math.lerp(this.pos.prev.x, this.pos.curr.x, 0.18);
      this.pos.prev.y = Math.lerp(this.pos.prev.y, this.pos.curr.y, 0.18);
    } else {
      // 首次直接同步
      this.pos.prev = { x: this.pos.curr.x, y: this.pos.curr.y };
    }
    this.move(this.pos.prev.x, this.pos.prev.y);
    this.rafId = requestAnimationFrame(() => this.render());
  }
}
