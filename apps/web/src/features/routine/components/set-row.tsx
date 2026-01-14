import { Trash2 } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	type SetType,
	setTypeConfig,
} from "@/features/routine/utils/set-type-config";
import { cn } from "@/lib/utils";

interface SetRowProps {
	exerciseIndex: number;
	setIndex: number;
	register: UseFormRegister<any>;
	onRemove: () => void;
	watch: any;
	setValue: any;
}

export function SetRow({
	exerciseIndex,
	setIndex,
	register,
	onRemove,
	watch,
	setValue,
}: SetRowProps) {
	const setType = (watch(
		`exercises.${exerciseIndex}.sets.${setIndex}.setType`,
	) || "working") as SetType;
	const config = setTypeConfig[setType] || setTypeConfig.working;

	const getSetIndicator = () => {
		return (
			<div
				className={cn(
					"flex h-6 w-6 items-center justify-center rounded-full font-bold text-[10px]",
					config.bg,
					config.color,
				)}
			>
				{config.label ?? setIndex + 1}
			</div>
		);
	};

	return (
		<div className="group flex flex-row items-center justify-between gap-1 px-2 py-1 even:bg-accent/10 hover:bg-accent/20">
			<div className="flex justify-center">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button type="button" className="outline-none">
								{getSetIndicator()}
							</button>
						}
					/>
					<DropdownMenuContent align="start">
						{Object.entries(setTypeConfig).map(([type, typeConfig]) => (
							<DropdownMenuItem
								key={type}
								onClick={() =>
									setValue(
										`exercises.${exerciseIndex}.sets.${setIndex}.setType`,
										type,
									)
								}
							>
								{typeConfig.fullName}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex justify-center">
				<Input
					type="number"
					placeholder="0"
					className="h-7 border-none bg-transparent text-center font-medium text-sm [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					{...register(
						`exercises.${exerciseIndex}.sets.${setIndex}.targetWeight`,
						{
							valueAsNumber: true,
						},
					)}
				/>
			</div>

			<div className="flex justify-center">
				<Input
					type="number"
					placeholder="0"
					className="h-7 border-none bg-transparent text-center font-medium text-sm [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					{...register(
						`exercises.${exerciseIndex}.sets.${setIndex}.targetReps`,
						{
							valueAsNumber: true,
						},
					)}
				/>
			</div>

			<div className="flex justify-center">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onRemove}
					className="h-8 w-8 text-muted-foreground/30 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 lg:opacity-0"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
