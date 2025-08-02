"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateQrCode, deleteQrCode } from "@/server/qr-codes";
import { useSession } from "@/hooks/use-session";

interface QrCode {
  id: string;
  name: string;
  url: string;
  description: string | null;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QrCodeActionsProps {
  qrCode: QrCode;
}

export function QrCodeActions({ qrCode }: QrCodeActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: qrCode.name,
    url: qrCode.url,
    description: qrCode.description || "",
    isActive: qrCode.isActive,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in");
      return;
    }

    if (!formData.name || !formData.url) {
      toast.error("Name and URL are required");
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await updateQrCode(qrCode.id, session.user.id, {
        name: formData.name,
        url: formData.url,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });

      if (success) {
        toast.success("QR code updated successfully!");
        setIsEditOpen(false);
        router.refresh();
      } else {
        toast.error(error || "Failed to update QR code");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await deleteQrCode(qrCode.id, session.user.id);

      if (success) {
        toast.success("QR code deleted successfully!");
        router.push("/dashboard/qr-codes");
      } else {
        toast.error(error || "Failed to delete QR code");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit QR Code</DialogTitle>
            <DialogDescription>
              Update the details of your QR code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url">URL *</Label>
              <Input
                id="edit-url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update QR Code"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete QR Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{qrCode.name}&quot;? This
              action cannot be undone and will also delete all associated scan
              data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete QR Code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
