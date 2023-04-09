import "./gallery.scss"

function assert_not_null<T>(value: T): asserts value is Exclude<T, undefined | null> {
	if (value === undefined || value === null)
		throw new Error("unexpected null type")
}

function assert_instance_of<T>(value: unknown, type: { new(): T }): asserts value is T {
	if (!(value instanceof type))
		throw new Error(`unexpected type; expected: ${type}, got: ${value}`)
}

function mod_index(index: number, mod: number) {
	index %= mod
	if (index < 0)
		index = mod + index

	return index
}

function get_child(target: HTMLElement, index: number) {
	const element = target.children.item(
		mod_index(index, target.children.length)
	)

	assert_instance_of(element, HTMLElement)
	return element
}

function filter_html_elements(elements: unknown[]): HTMLElement[] {
	return elements.filter(e => e instanceof HTMLElement) as HTMLElement[]
}

function get_children(element: HTMLElement): HTMLElement[] {
	return filter_html_elements(Array.from(element.children))
}

class TrashGallery {
	images: HTMLElement[]
	overlay: HTMLElement
	content: HTMLElement
	title: HTMLElement
	preview: HTMLElement
	start_x: number = -1
	offset_x: number = -1
	index: number = -1
	animation_duration: number

	constructor(element: HTMLElement | null, animation_duration = 400) {
		assert_not_null(element)
		this.images = get_children(element)
		this.animation_duration = animation_duration

		this.overlay = this.clone_template()
		this.content = this.get_template_class(this.overlay, ".images")
		this.title = this.get_template_class(this.overlay, ".title")
		this.preview = this.get_template_class(this.overlay, ".preview")

		this.images
			.map(image => image.cloneNode(true))
			.forEach(image => this.content.appendChild(image))

		this.images
			.map(image => {
				const clone = image.cloneNode(true)
				clone.addEventListener("click", () => this.set_pivot(image))
				return clone
			})
			.forEach(image => this.preview.appendChild(image))

		this.images.forEach(image => image.addEventListener("click", () => {
			this.set_pivot(image)
			this.add_event_listeners()
			document.body.appendChild(this.overlay)
			this.update_preview()
		}))
	}

	get_template_class(overlay: HTMLElement, classname: string): HTMLElement {
		const element = overlay.querySelector(classname)
		assert_instance_of(element, HTMLElement)
		return element
	}

	clone_template(): HTMLElement {
		const overlay = document.createElement("div")
		overlay.classList.add("gallery-overlay")

		overlay.appendChild(document.createElement("div")).classList.add("images")
		overlay.appendChild(document.createElement("p")).classList.add("title")
		overlay.appendChild(document.createElement("div")).classList.add("preview")

		return overlay
	}

	dragstart = (event: DragEvent): void => event.preventDefault()

	touchstart = (event: TouchEvent): void => {
		assert_instance_of(event.currentTarget, HTMLElement)
		if (this.start_x !== -1)
			return

		if (event.target === this.content)
			this.close_gallery()

		event.currentTarget.addEventListener("touchmove", this.touchmove)
		event.currentTarget.addEventListener("touchend", this.touchend)

		this.start_x = event.touches.item(0)?.screenX ?? -1
	}

	touchmove = (event: TouchEvent): void => {
		event.preventDefault()
		this.offset_x = (event.touches.item(0)?.screenX ?? 0) - this.start_x
		this.content.style.setProperty("--offset", `${this.offset_x}px`)
	}

	touchend = (event: TouchEvent): void => {
		assert_instance_of(event.currentTarget, HTMLElement)
		if (Math.abs(this.offset_x) > 0.2 * window.innerWidth)
			this.set_pivot(-Math.sign(this.offset_x))

		event.currentTarget.removeEventListener("touchmove", this.touchmove)
		event.currentTarget.removeEventListener("touchend", this.touchend)

		this.content.style.setProperty("--offset", "0px")
		this.after_animation(() => {
			this.start_x = -1
			this.offset_x = -1
		})
	}

	mousedown = (event: MouseEvent): void => {
		assert_instance_of(event.currentTarget, HTMLElement)
		if (this.start_x !== -1)
			return

		if (event.target === this.content)
			this.close_gallery()

		event.currentTarget.addEventListener("mousemove", this.mousemove)
		event.currentTarget.addEventListener("mouseup", this.mouseup)

		this.start_x = event.screenX
	}

	mousemove = (event: MouseEvent): void => {
		this.offset_x = event.screenX - this.start_x
		this.content.style.setProperty("--offset", `${this.offset_x}px`)
	}

	mouseup = (event: MouseEvent): void => {
		assert_instance_of(event.currentTarget, HTMLElement)

		event.currentTarget.removeEventListener("mousemove", this.mousemove)
		event.currentTarget.removeEventListener("mouseup", this.mouseup)

		if (Math.abs(this.offset_x) > 0.2 * window.innerWidth)
			this.set_pivot(-Math.sign(this.offset_x))

		this.content.style.setProperty("--offset", "0px")
		this.after_animation(() => {
			this.start_x = -1
			this.offset_x = -1
		})
	}

	keyup = (event: KeyboardEvent): void => {
		if (event.key === "ArrowLeft")
			this.set_pivot(-1)
		else if (event.key === "ArrowRight")
			this.set_pivot(1)
		else if (event.key === "Escape")
			this.close_gallery()
	}

	remove_event_listeners(): void {
		this.content.removeEventListener("dragstart", this.dragstart)
		this.content.removeEventListener("touchstart", this.touchstart)
		this.content.removeEventListener("touchmove", this.touchmove)
		this.content.removeEventListener("touchend", this.touchend)
		this.content.removeEventListener("mousedown", this.mousedown)
		document.removeEventListener("keyup", this.keyup)
	}

	add_event_listeners(): void {
		this.content.addEventListener("dragstart", this.dragstart)
		this.content.addEventListener("touchstart", this.touchstart)
		this.content.addEventListener("touchmove", this.touchmove)
		this.content.addEventListener("touchend", this.touchend)
		this.content.addEventListener("mousedown", this.mousedown)
		document.addEventListener("keyup", this.keyup)
	}

	close_gallery() {
		this.remove_event_listeners()
		this.overlay.remove()
	}

	update_title() {
		let text = this.images[this.index]?.getAttribute("data-title") ?? ""
		this.title.innerText = text
	}

	update_preview() {
		let pivot = get_child(this.preview, this.index)
		let offset = pivot.offsetLeft
		offset -= (this.preview.clientWidth - pivot.clientWidth) / 2;

		this.preview.scrollTo({ left: offset, behavior: "smooth" })
	}

	after_animation(callback: () => void): void {
		window.setTimeout(callback, this.animation_duration)
	}

	set_pivot(direction: HTMLElement | number): void {
		if (direction instanceof HTMLElement) {
			const new_index = this.images.indexOf(direction)

			if (Math.abs(new_index - this.index) === 1)
				direction = 1

			this.index = new_index
		} else
			this.index += direction

		this.overlay.style.setProperty(
			"--animation-duration",
			`${this.animation_duration}ms`
		)

		for (const target of [this.content, this.preview]) {
			get_children(target).forEach(e => e.removeAttribute("class"))

			const pivot = get_child(target, this.index)
			const previous = get_child(target, this.index - 1)
			const next = get_child(target, this.index + 1)

			pivot.classList.add("visible")
			pivot.classList.add("pivot")
			previous.classList.add("previous")
			next.classList.add("next")

			if (direction instanceof HTMLElement || direction < 0) 
				this.after_animation(() => previous.classList.add("visible"))
			else
				previous.classList.add("visible")

			if (direction instanceof HTMLElement || direction > 0)
				this.after_animation(() => next.classList.add("visible"))
			else
				next.classList.add("visible")
		}

		this.after_animation(() => 
			this.overlay.style.setProperty("--animation-duration", "0ms")
		)

		this.update_title()
		this.update_preview()
	}
}

filter_html_elements(Array.from(document.querySelectorAll("#gallery")))
	.forEach(e => new TrashGallery(e))

export default TrashGallery
