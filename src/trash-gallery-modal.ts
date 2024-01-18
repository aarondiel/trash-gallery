import "./trash-infinte-slider"
import { LitElement, css, html } from "lit"
import { customElement, property, query } from "lit/decorators.js"
import { TrashInfiniteSlider } from "./trash-infinte-slider"

export class TrashGalleryElement {
	public html: HTMLImageElement
	public caption?: HTMLElement

	constructor(
		html: TrashGalleryElement["html"],
		caption?: TrashGalleryElement["caption"]
	) {
		this.html = html
		this.caption = caption
	}
}

@customElement("trash-gallery-modal")
export class TrashGalleryModal extends LitElement {
	@property()
	elements: TrashGalleryElement[] = []

	@query("dialog")
	dialog!: HTMLDialogElement

	@query("trash-infinite-slider")
	slider!: TrashInfiniteSlider

  static styles = css`
		:host {
			position: absolute
		}

		dialog[open] {
			position: fixed;
			inset: 0;
			display: grid;
			place-content: center;
			height: 100dvh;
			margin: 0;
			padding: 0;
			border: none;
			outline: none;
			background-color: transparent;
			backdrop-filter: blur(0.2rem);
			padding: 2rem;
			box-sizing: border-box;
		}

		.image-viewer {
			display: grid;
			grid-template-rows: 1fr;
			grid-template-columns: 1fr;
			isolation: isolate;

			> * {
				grid-column: 1;
				grid-row: 1;
			}

			> button {
				cursor: pointer;
				background: none;
				border: none;
				outline: none;
				font-size: 2em;
				padding: 0.5em;
			}

			> button:focus-visible {
				font-weight: bold;
			}

			> .close-button { place-self: start end; }
			> .left-button { place-self: center start; }
			> .right-button { place-self: center end; }
			> trash-infinite-slider { z-index: -1; }
		}

		img {
			display: block;
			max-width: 100%;
		}
	`

  render() {
    return html`
			<dialog @keyup=${this.keyup}>
				<div class="image-viewer">
					<button @click=${this.close} class="close-button">X</button>
					<button @click=${this.left} class="left-button">&lt;</button>
					<button @click=${this.right} class="right-button">&gt;</button>

					<trash-infinite-slider>
						${this.elements.map(element => element.html.cloneNode(true))}
					</trash-infinite-slider>
				</div>

				<div>
					caption here
				</div>

				<div>
					previewer here
				</div>
			</dialog>
		`
  }

	open(index: number) {
		this.dialog.show()
		this.slider.set_index(index, true)
	}

	close() {
		this.dialog.close()
	}

	left() {
		this.slider.set_index(this.slider.get_index() - 1)
	}

	right() {
		this.slider.set_index(this.slider.get_index() + 1)
	}

	keyup(e: KeyboardEvent) {
		if (e.key === "Escape")
			this.close()

		if (e.key === "ArrowLeft")
			this.left()

		if (e.key === "ArrowRight")
			this.right()
	}
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-gallery-modal": TrashGalleryModal
  }
}
