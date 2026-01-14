export type SetType = "warmup" | "working" | "failure" | "drop" | "amrap";
export const setTypeConfig: Record<
	SetType,
	{ label: string | null; color: string; bg: string; fullName: string }
> = {
	warmup: {
		label: "W",
		color: "text-yellow-600",
		bg: "bg-yellow-100",
		fullName: "Warmup (W)",
	},
	working: {
		label: null,
		color: "text-zinc-100",
		bg: "bg-zinc-900",
		fullName: "Working Set",
	},
	failure: {
		label: "F",
		color: "text-red-600",
		bg: "bg-red-100",
		fullName: "Failure (F)",
	},
	drop: {
		label: "D",
		color: "text-blue-600",
		bg: "bg-blue-100",
		fullName: "Drop Set (D)",
	},
	amrap: {
		label: "A",
		color: "text-green-600",
		bg: "bg-green-100",
		fullName: "AMRAP (A)",
	},
};
