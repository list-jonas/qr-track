"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function LogoutButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <Button
      variant="outline"
      className={cn("flex items-center", className)}
      onClick={handleLogout}
      {...props}
    >
      Logout <LogOutIcon className="size-4" />
    </Button>
  );
}
