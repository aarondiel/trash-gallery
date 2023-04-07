function assert_not_null<T>(value: T): asserts value is Exclude<T, undefined | null> {
	if (value === undefined || value === null)
		throw new Error("unexpected null type")
}

function assert_instance_of<T>(value: unknown, type: { new(): T }): asserts value is T {
	if (!(value instanceof type))
		throw new Error("unexpected type")
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

function get_children(element: HTMLElement): HTMLElement[] {
	return Array.from(element.children)
		.filter(e => e instanceof HTMLElement) as HTMLElement[]
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

	constructor(element: HTMLElement | null) {
		assert_not_null(element)
		this.images = get_children(element)

		this.overlay = this.clone_template()
		this.content = this.get_template_class(this.overlay, ".images")
		this.title = this.get_template_class(this.overlay, ".title")
		this.preview = this.get_template_class(this.overlay, ".preview")

		this.add_images(this.content)
		this.add_images(this.preview)

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
		const template = document.getElementById("trash-gallery-overlay")
		assert_instance_of(template, HTMLTemplateElement)

		const node = template.content.cloneNode(true)
		const div = document.createElement("div")

		div.classList.add("trash-gallery-overlay")
		div.appendChild(node)

		return div
	}

	add_images(target: HTMLElement): void {
		this.images
			.map(image => image.cloneNode(true))
			.forEach(image => target.appendChild(image))
	}

	dragstart = (event: DragEvent): void => event.preventDefault()

	touchstart = (event: TouchEvent): void => {
		if (this.start_x === -1)
			this.start_x = event.touches.item(0)?.screenX ?? -1

		if (event.target === this.content)
			this.close_gallery()
	}

	touchmove = (event: TouchEvent): void => {
		event.preventDefault()
		this.offset_x = (event.touches.item(0)?.screenX ?? 0) - this.start_x

		this.content.style.setProperty("--offset", `${this.offset_x}px`)
	}

	touchend = (): void => {
		if (Math.abs(this.offset_x) > 0.2 * window.innerWidth)
			this.set_pivot(-Math.sign(this.offset_x))

		this.content.style.setProperty("--offset", "0px")
		this.start_x = -1
		this.offset_x = -1
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
		this.start_x = -1
		this.offset_x = -1
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

	clear_classes(element: HTMLElement) {
		get_children(element).forEach(child => child.removeAttribute("class"))
	}

	update_title() {
		let text = this.images[this.index]?.getAttribute("data-title") ?? ""
		this.title.innerText = text
	}

	update_preview() {
		let pivot = get_child(this.preview, this.index)
		let offset = pivot.offsetLeft
		offset -= (this.preview.clientWidth - pivot.clientWidth) / 2;

		this.preview.scrollTo({
			left: offset,
			behavior: "smooth"
		})
	}

	set_pivot(pivot: HTMLElement | number): void {
		if (pivot instanceof HTMLElement)
			this.index = this.images.indexOf(pivot)
		else
			this.index += pivot

		for (const target of [this.content, this.preview]) {
			this.clear_classes(target)

			const pivot = get_child(target, this.index)
			const previous = get_child(target, this.index - 1)
			const next = get_child(target, this.index + 1)

			pivot.classList.add("pivot")
			previous.classList.add("previous")
			next.classList.add("next")
		}

		this.update_title()
		this.update_preview()
	}
}

new TrashGallery(document.getElementById("trash-gallery"))

export {}
