export function mod(index: number, mod: number) {
	index %= mod
	return (index < 0) ? mod + index : index
}
