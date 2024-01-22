import { LitElement, css, html } from "lit"
import { customElement, queryAssignedElements } from "lit/decorators.js"
import { mod } from "./utils"

@customElement("trash-gallery-previewer")
export class TrashGalleryPreviewer extends LitElement {
	@queryAssignedElements()
	private images!: HTMLElement[]

  static styles = css`
		:host {
			padding-block: 1rem;
			display: flex;
			gap: 2rem;
			overflow-x: scroll;
			scroll-snap-type: x proximity;
		}

		::slotted(*) {
			scroll-snap-align: center;
			display: block;
			height: 100%;
			width: auto;
			border: solid transparent 2px;
			border-radius: 0.5rem;
		}

		::slotted(.active) {
			border-color: white;
		}
	`

  render() {
		return html`<slot></slot>`
	}

	set_index(index: number) {
		this.images.forEach(img => img.classList.remove("active"))
		this.images[mod(index, this.images.length)].classList.add("active")
		this.images[mod(index, this.images.length)].scrollIntoView({
			behavior: "smooth"
		})
	}
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-gallery-previewer": TrashGalleryPreviewer
  }
}
