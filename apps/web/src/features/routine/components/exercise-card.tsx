import {
	IconDotsVertical,
	IconInfoCircle,
	IconQuestionMark,
	IconTrash,
} from "@tabler/icons-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal.store";
import { SetRow } from "./set-row";

interface ExerciseCardProps {
	id: string;
	exerciseIndex: number;
	onRemove: () => void;
}

export function ExerciseCard({
	id,
	exerciseIndex,
	onRemove,
}: ExerciseCardProps) {
	const { control, register, watch, setValue } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `exercises.${exerciseIndex}.sets`,
	});

	const exerciseName = watch(`exercises.${exerciseIndex}.name`);
	const thumbnailUrl = watch(`exercises.${exerciseIndex}.thumbnailUrl`);
	const sets = watch(`exercises.${exerciseIndex}.sets`);
	const { open } = useModal();
	return (
		<AccordionItem
			value={id}
			className="rounded-md border-none px-2 py-1 transition-colors duration-200 hover:bg-accent/10"
		>
			<div className="flex items-start gap-2">
				<div className="group flex-1 space-y-3">
					<div className="flex w-full items-start gap-2">
						<Avatar
							className={"group"}
							onClick={() =>
								open({
									type: "EXERCISE_DETAIL",
									data: {
										exercisePublicId: watch(
											`exercises.${exerciseIndex}.exercisePublicId`,
										),
									},
								})
							}
						>
							<AvatarImage
								src={thumbnailUrl}
								alt={exerciseName}
								className={"relative aspect-square rounded-md"}
							/>
							<div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100">
								<IconQuestionMark className="size-2 bg-background" />
							</div>
							<AvatarFallback>?</AvatarFallback>
						</Avatar>
						<AccordionTrigger
							className={cn(
								"flex w-full flex-1 items-stretch px-2 py-1 text-left",
								"hover:no-underline",
								"group-data-[state=open]:mb-2",
								"[&_svg:last-child]:hidden",
							)}
						>
							<div className="flex min-h-full w-full flex-col justify-center gap-1">
								<div className="flex items-center gap-2">
									<h3 className="text-lg leading-tight">
										{exerciseName || "Exercise"}
									</h3>
									<IconInfoCircle className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
								</div>

								<div className="flex flex-col gap-0.5 group-aria-expanded/accordion-trigger:hidden">
									{fields.map((field, idx) => {
										const set = sets?.[idx] || {};
										return (
											<div
												key={field.id}
												className="flex items-center gap-2 text-[10px] text-muted-foreground"
											>
												<div
													className={cn(
														"flex h-4 w-4 items-center justify-center rounded-full font-bold text-[8px]",
														set.setType === "warmup"
															? "text-[#D4D44A]"
															: set.setType === "failure"
																? "text-[#E54D2E]"
																: set.setType === "drop"
																	? "text-[#3E63DD]"
																	: "text-primary",
													)}
												>
													{set.setType === "warmup"
														? "W"
														: set.setType === "failure"
															? "F"
															: set.setType === "drop"
																? "D"
																: idx + 1}
												</div>
												<span>
													{set.targetWeight || 0}kg × {set.targetReps || 0}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						</AccordionTrigger>

						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button
										variant="ghost"
										size="icon-sm"
										className="md:opacity-0 md:group-hover:opacity-100"
									>
										<IconDotsVertical className="h-4 w-4" />
									</Button>
								}
							/>
							<DropdownMenuContent align="end" className="w-fit">
								<DropdownMenuItem
									variant="destructive"
									onClick={onRemove}
									className={"flex items-center justify-center"}
								>
									<IconTrash />
									Remove Exercise
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<AccordionContent className="pt-0">
						<div className="w-full">
							{fields.length > 0 && (
								<div className="grid grid-cols-[44px_1fr_1fr_44px] gap-1 border-t px-2 py-2 font-bold text-[10px] text-muted-foreground/60 uppercase tracking-wider">
									<div className="text-center">Set</div>
									<div className="text-center">Weight (kg)</div>
									<div className="text-center">Reps</div>
									<div />
								</div>
							)}

							<div className="">
								{fields.map((field, index) => (
									<SetRow
										key={field.id}
										exerciseIndex={exerciseIndex}
										setIndex={index}
										register={register}
										onRemove={() => remove(index)}
										watch={watch}
										setValue={setValue}
									/>
								))}
							</div>

							<Button
								type="button"
								className="mt-2 w-full"
								variant="ghost"
								onClick={() =>
									append({
										setType: "working",
										targetWeight: 1,
										targetReps: 1,
										targetRpe: 1,
										order: `a${fields.length}`,
									})
								}
							>
								+ Add Set
							</Button>
						</div>
					</AccordionContent>
				</div>
			</div>
		</AccordionItem>
	);
}
