function assert_not_null<T>(value: T): asserts value is Exclude<T, undefined | null> {
	if (value === undefined || value === null)
		throw new Error("unexpected null type")
}

function assert_instance_of<T>(value: unknown, type: { new(): T }): asserts value is T {
	if (!(value instanceof type))
		throw new Error("unexpected type")
}

function gallery_is_open(): boolean {
	return document.querySelector(".trash-gallery-overlay") !== null
}

function clone_template(): HTMLElement | undefined {
	const template = document.getElementById("trash-gallery-overlay")
	assert_instance_of(template, HTMLTemplateElement)

	const node = template.content.cloneNode(true)
	const div = document.createElement("div")

	div.classList.add("trash-gallery-overlay")
	div.append(node)

	return div
}

function add_event_listeners(overlay: HTMLElement): void {
	const content = overlay.querySelector(".images")
	assert_instance_of(content, HTMLElement)

	let start_x = -1
	let offset_x = -1

	content.addEventListener("dragstart", (event) => event.preventDefault())

	content.addEventListener("touchstart", (event) => {
		if (start_x === -1)
			start_x = event.touches.item(0)?.screenX ?? -1
	})

	content.addEventListener("touchmove", (event) => {
		event.preventDefault()
		offset_x = (event.touches.item(0)?.screenX ?? 0) - start_x

		content.style.setProperty("--offset", `${offset_x}px`)
	})

	content.addEventListener("touchend", () => {
		if (Math.abs(offset_x) > 0.2 * window.innerWidth)
			move_pivot(overlay, Math.sign(offset_x))

		content.style.setProperty("--offset", "0px")
		start_x = -1
	})
}

function add_images_to_overlay(
	overlay: HTMLElement,
	images: HTMLImageElement[],
	pivot: HTMLImageElement
): void {
	const content = overlay.querySelector(".images")
	const preview_bar = overlay.querySelector(".preview")

	assert_instance_of(content, HTMLElement)
	assert_instance_of(preview_bar, HTMLElement)

	let pivot_hit = false
	for (const image of images) {
		if (image === pivot)
			pivot_hit = true
		else if (!pivot_hit)
			continue
		
		const a: unknown = content.appendChild(image.cloneNode(true))
		const b: unknown = preview_bar.appendChild(image.cloneNode(true))

		assert_instance_of(a, HTMLElement)
		a.classList.toggle("pivot", image === pivot)

		assert_instance_of(b, HTMLElement)
		b.classList.toggle("pivot", image === pivot)
	}

	for (const image of images) {
		if (image === pivot)
			break

		content.appendChild(image.cloneNode(true))
		preview_bar.appendChild(image.cloneNode(true))
	}
}

function rotate_images(
	overlay: HTMLElement,
	n: number
): void {
	if (n === 0)
		return

	const container = overlay.querySelector(".images")
	const fragment = document.createDocumentFragment()
	assert_not_null(container)

	for (const start of [container.children.length - n, 0]) {
		let image = container.children.item(start)
		while (image != null) {
			fragment.appendChild(image).classList.remove("pivot")
			image = container.children.item(start)
		}
	}

	fragment.children.item(0)?.classList.add("pivot")
	container.replaceChildren(fragment)
}

function move_pivot(overlay: HTMLElement, direction: number): void {
	const content = overlay.querySelector(".images")
	assert_instance_of(content, HTMLElement)

	const images = Array.from(content.children)

	if (direction < 0)
		rotate_images(overlay, images.length + direction)
	else
		rotate_images(overlay, direction)
}

function open_gallery(
	pivot: HTMLImageElement,
	images: HTMLImageElement[]
): void {
	if (gallery_is_open())
		return

	const overlay = clone_template()
	assert_not_null(overlay)

	// todo: special cases 1 or 2 images

	add_images_to_overlay(overlay, images, pivot)
	add_event_listeners(overlay)

	document.body.appendChild(overlay)
}

function add_click_event(
	pivot: HTMLImageElement,
	images: HTMLImageElement[]
): void {
	const callback = () => open_gallery(pivot, images)
	pivot.addEventListener("click", callback)
}

function initialize_trash_gallery(): void {
	const trash_gallery = document.getElementById("trash-gallery")
	assert_not_null(trash_gallery)

	const children = Array.from(trash_gallery.children)
		.filter(element => element instanceof HTMLImageElement) as HTMLImageElement[]

	children.forEach(pivot => add_click_event(pivot, children))
}

initialize_trash_gallery()

export {}
