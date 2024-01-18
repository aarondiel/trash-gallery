import "./trash-gallery-modal"
import { LitElement, css, html } from "lit"
import { customElement, query, queryAssignedElements, state } from "lit/decorators.js"
import { TrashGalleryElement, TrashGalleryModal } from "./trash-gallery-modal";

@customElement("trash-gallery")
export class TrashGallery extends LitElement {
	@queryAssignedElements({ selector: "img" })
	private images!: HTMLImageElement[];

	@query("trash-gallery-modal")
	private modal!: TrashGalleryModal;

	@state()
	private elements: TrashGalleryElement[] = []

  static styles = css`
    :host {}

    ::slotted(img) {
			cursor: pointer;
			display: block;
			max-width: 100%;
    }
  `

  render() {
    return html`
			<trash-gallery-modal .elements=${this.elements}></trash-gallery-modal>
      <slot @slotchange=${this.update_elements}></slot>
    `
  }

	update_elements() {
		this.elements = this.images.map(img => new TrashGalleryElement(img))
		let i = 0

		this.images.forEach(image => {
			image.setAttribute("data-index", (i++).toString())
			image.onclick = () =>
				this.modal.open(parseInt(image.getAttribute("data-index") ?? "0"))
			})
	}
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-gallery": TrashGallery
  }
}
