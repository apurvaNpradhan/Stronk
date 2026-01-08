import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { env } from "@base/env/web";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import {
	IconCamera,
	IconLoader2,
} from "@tabler/icons-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { cn } from "@/lib/utils";

export function ProfileForm() {
	const {
		data: session,
		isPending: isSessionPending,
		refetch,
	} = useSuspenseQuery(sessionQueryOptions);
	const user = session?.data?.user;

	const [name, setName] = useState(user?.name || "");
	const [isUpdatingName, setIsUpdatingName] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	const { mutateAsync: upload } = useMutation(orpc.upload.mutationOptions());

	const handleUpdateName = async () => {
		if (!name || name === user?.name) return;
		setIsUpdatingName(true);
		try {
			await authClient.updateUser({
				name: name,
			});
			toast.success("Name updated successfully");
			refetch();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update name";
			toast.error(message);
		} finally {
			setIsUpdatingName(false);
		}
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploadingAvatar(true);
		try {
			const { url } = await upload({ file });
			const absoluteUrl = `${env.VITE_SERVER_URL}${url}`;

			await authClient.updateUser({
				image: absoluteUrl,
			});
			toast.success("Avatar updated successfully");
			refetch();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update avatar";
			toast.error(message);
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	if (isSessionPending) {
		return (
			<div className="flex items-center justify-center p-8">
				<IconLoader2 className="animate-spin" />
			</div>
		);
	}

	return (
					<ItemGroup className="gap-0 rounded-md">
						<Item variant={"muted"} >
							<ItemContent>
								<ItemTitle className="text-base">Profile picture</ItemTitle>
							</ItemContent>
							<ItemActions>
								<div className="group relative cursor-pointer">
									<Avatar className="h-10 w-10   ">
										<AvatarImage src={user?.image || ""} />
										<AvatarFallback className="text-lg">
											{user?.name?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
									<label
										htmlFor="avatar-upload"
										className={cn(
											"absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-background-foreground/40 opacity-0 transition-opacity group-hover:opacity-100",
											isUploadingAvatar && "cursor-not-allowed opacity-100"
										)}
									>
										{isUploadingAvatar ? (
											<IconLoader2 className="h-6 w-6 text-accent animate-spin" />
										) : (
											<IconCamera className="h-6 w-6 text-accent" />
										)}
									</label>
									<Input
										id="avatar-upload"
										type="file"
										className="hidden"
										accept="image/*"
										onChange={handleAvatarChange}
										disabled={isUploadingAvatar}
									/>
								</div>
							</ItemActions>
						</Item>

						<Separator />

						<Item variant={"muted"}>
							<ItemContent>
								<ItemTitle className="text-base">Email</ItemTitle>
							</ItemContent>
							<ItemActions className="gap-4">
								<div className="flex flex-col items-end gap-1 text-right">
									<span className="text-muted-foreground">{user?.email}</span>
									<span className="text-[10px] text-muted-foreground/60 uppercase font-medium">Changing email is currently disabled</span>
								</div>
							</ItemActions>
						</Item>

						<Separator />

						<Item variant={"muted"}>
							<ItemContent>
								<ItemTitle className="text-base">Full name</ItemTitle>
							</ItemContent>
							<ItemActions className="gap-2">
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									onBlur={handleUpdateName}
									placeholder="Your name"
									className="bg-background"
								/>
								{isUpdatingName && (
									<IconLoader2 className="h-4 w-4 animate-spin" />
								)}
							</ItemActions>
						</Item>
					</ItemGroup>
	);
}
