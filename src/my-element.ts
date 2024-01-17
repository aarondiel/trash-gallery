import { LitElement, css, html } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("trash-gallery")
export class TrashGallery extends LitElement {
  render() {
    return html`
      <slot></slot>
    `
  }

  static styles = css`
    :host {
    }

    ::slotted(img) {
			display: block;
			min-width: 0;
			max-width: 100%;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-gallery": TrashGallery
  }
}
