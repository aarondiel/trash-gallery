import { LitElement, css, html } from "lit"
import { customElement, property, query, queryAssignedElements, state } from "lit/decorators.js"
import { styleMap } from "lit/directives/style-map.js"

function mod(index: number, mod: number) {
	index %= mod
	return (index < 0) ? mod + index : index
}

@customElement("trash-infinite-slider")
export class TrashInfiniteSlider extends LitElement {
	@queryAssignedElements({ selector: "img" })
	private images!: HTMLImageElement[]

	@query("div")
	private track!: HTMLDivElement

	@state()
	private left_duplicates: HTMLImageElement[] = []

	@state()
	private right_duplicates: HTMLImageElement[] = []

	@property()
	public smooth_scrolling: boolean = true

	private intersection_observer?: IntersectionObserver
	private index = 0

  static styles = css`
		div {
			display: grid;
			gap: 2rem;
			grid-auto-flow: column;
			grid-auto-columns: 100%;
			overflow-x: scroll;
			scroll-snap-type: x mandatory;
		}

		::slotted(img), img {
			scroll-snap-align: center;
			max-width: 100%;
			display: block;
		}
	`

  render() {
    return html`
			<div style=${styleMap({ scrollBehavior: this.smooth_scrolling ? "smooth" : "auto" })}>
				${this.left_duplicates}
				<slot @slotchange=${this.update_duplicates}></slot>
				${this.right_duplicates}
			</div>
		`
  }

	update_index = (entries: IntersectionObserverEntry[]) => {
		let is_on_duplicate = false;

		entries.forEach(entry => {
			if (entry.intersectionRatio !== 1)
				return

			const index = parseInt(entry.target.getAttribute("data-index") ?? "0")
			is_on_duplicate ||= index < 0 || index >= this.images.length
			this.index = mod(index, this.images.length)
		})

		if (is_on_duplicate)
			this.set_index(this.index, true)
	}

	update_duplicates() {
		if (this.images.length === 0)
			return

		if (this.images.length === 1)
			throw Error("todo: handle single image slider")

		this.left_duplicates = this.images.slice(this.images.length - 2, this.images.length)
			.map(img => img.cloneNode(true) as HTMLImageElement)

		this.right_duplicates = this.images.slice(0, 2)
			.map(img => img.cloneNode(true) as HTMLImageElement)

		let i = -2
	 	this.left_duplicates.forEach(img => img.setAttribute("data-index", (i++).toString()))

		i = this.images.length
	 	this.right_duplicates.forEach(img => img.setAttribute("data-index", (i++).toString()))

		this.intersection_observer = new IntersectionObserver(this.update_index, {
			root: this.track,
			threshold: 1.0
		})

		this.images.forEach(image => this.intersection_observer?.observe(image))
		this.left_duplicates.forEach(image => this.intersection_observer?.observe(image))
		this.right_duplicates.forEach(image => this.intersection_observer?.observe(image))
	}

	get_index() {
		return this.index
	}

	set_index(index: number, disable_smooth_scrolling: boolean = false) {
		this.index = index

		if (0 <= this.index && this.index < this.images.length)
			this.renderRoot.querySelector("slot")
				?.assignedElements()
				.filter(node => node.getAttribute("data-index") === this.index.toString())
				.forEach(node => node.scrollIntoView({
					behavior: this.smooth_scrolling && !disable_smooth_scrolling ? "smooth" : "instant"
				}))
		else
			this.track.querySelector(`img[data-index="${index}"]`)
				?.scrollIntoView({
					behavior: this.smooth_scrolling && !disable_smooth_scrolling ? "smooth" : "instant"
				})
	}
}

declare global {
  interface HTMLElementTagNameMap {
    "trash-infinite-slider": TrashInfiniteSlider
  }
}
