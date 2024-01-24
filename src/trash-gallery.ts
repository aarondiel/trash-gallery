import "./trash-gallery-modal"
import { LitElement, css, html } from "lit"
import { customElement, query, queryAssignedElements, state } from "lit/decorators.js"
import { TrashGalleryElement, TrashGalleryModal } from "./trash-gallery-modal";

TrashGalleryModal.getPropertyOptions

@customElement("trash-gallery")
export class TrashGallery extends LitElement {
	@queryAssignedElements()
	private assigned_elements!: HTMLElement[]

	@query("trash-gallery-modal")
	private modal!: TrashGalleryModal

	@state()
	private elements: TrashGalleryElement[] = []

  static styles = css`
    :host {}

    ::slotted(*) {
			cursor: pointer;
    }
  `

  render() {
    return html`
			<trash-gallery-modal .elements=${this.elements}></trash-gallery-modal>
      <slot @slotchange=${this.update_elements}></slot>
    `
  }

	update_elements() {
		this.elements = this.assigned_elements.flatMap(element => {
			if (element.matches(".trash-gallery-ignore"))
				return []

			if (element instanceof HTMLImageElement)
				return [ new TrashGalleryElement(element) ]

			const image = element.querySelector(":not(figcaption)")
			const caption = element.querySelector("figcaption")

			if (!(image instanceof HTMLElement) || caption === null)
				return []

			return [ new TrashGalleryElement(image, caption.innerHTML) ]
		})

		let i = 0
		this.elements.forEach(element => {
			element.html.setAttribute("data-index", (i++).toString())
			element.html.onclick = () =>
				this.modal.open(parseInt(element.html.getAttribute("data-index") ?? "0")
			)
		})
	}
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-gallery": TrashGallery
  }
}
