import "./trash-gallery-modal"
import { LitElement, css, html } from "lit"
import { customElement, query, queryAssignedElements, state } from "lit/decorators.js"
import { TrashGalleryElement, TrashGalleryModal } from "./trash-gallery-modal";

@customElement("trash-gallery")
export class TrashGallery extends LitElement {
	@queryAssignedElements({ selector: "img" })
	private images!: HTMLImageElement[];

	@queryAssignedElements({ selector: "figure" })
	private figures!: HTMLElement[]

	@query("trash-gallery-modal")
	private modal!: TrashGalleryModal;

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
		const figure_images = this.figures.flatMap(figure =>
			Array.from(figure.querySelectorAll("img"))
		)

		const images = this.images.filter(img => !figure_images.some(
			figure_image => figure_image === img)
		)

		this.elements = [
			...images.map(img => new TrashGalleryElement(img)),
			...this.figures.flatMap(figure => {
				const img = figure.querySelector("img")
				const caption = figure.querySelector("figcaption")

				if (!(img instanceof HTMLImageElement))
					return []

				return [ new TrashGalleryElement(img, caption?.innerHTML) ]
			})
		]

		let i = 0
		let onclick_elements = [...this.images, ...this.figures]

		onclick_elements.forEach(image => {
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
