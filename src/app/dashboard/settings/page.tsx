import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AccountSettingsForm } from "@/components/account-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="mx-auto w-full max-w-7xl gap-4 grid grid-cols-2">
      <h1 className="text-3xl font-bold tracking-tight col-span-2">Settings</h1>
      <AccountSettingsForm
        initialName={session.user.name ?? ""}
        userId={session.user.id}
      />
      <Card>
        <CardHeader>
          <CardTitle>Server-controlled settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-sm text-muted-foreground">
            Some application-wide settings are managed via environment variables
            on the server. For example, you can lock down new user registrations
            using{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              NEXT_PUBLIC_REGISTRATION_LOCKED=true
            </code>
            . Update these variables in your deployment environment and redeploy
            to apply changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
