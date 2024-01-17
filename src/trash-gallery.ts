import { LitElement, css, html } from "lit"
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js"

@customElement("trash-gallery")
export class TrashGallery extends LitElement {
	@queryAssignedElements({ selector: "img" })
	private images!: HTMLImageElement[];

	@state()
	private sources: string[] = [ ]

  static styles = css`
    :host {
    }

    ::slotted(img) {
			display: block;
			min-width: 0;
			max-width: 100%;
    }
  `

  render() {
    return html`
      <slot @slotchange=${this.cook_sauces}></slot>
			${this.sources.map(source => html`<p>${source}</p>`)}
    `
  }

	cook_sauces() {
		this.sources = this.images.map(img => img.src)
	}
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-gallery": TrashGallery
  }
}
