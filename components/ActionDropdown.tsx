"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/fileAction";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import { Permission } from "@/lib/actions/fileAction";
import { getCurrentUser } from "@/lib/actions/userAction";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  console.log(file);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [isAllowedToShare, setIsAllowedToShare] = useState(false);
  const [user, setUser] = useState<string>("");
  const [error, setError] = useState("");
  const [isPermissionUpdating, setIsPermissionUpdating] = useState(false);

  const path = usePathname();
  async function getuser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser.accountId);
  }
  useEffect(() => {
    getuser();
  }, []);
  console.log(user);
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    //   setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    try {
      const actions = {
        rename: () =>
          renameFile({
            fileId: file.$id,
            name,
            extension: file.extension,
            path,
          }),
        share: () => updateFileUsers({ fileId: file.$id, emails, path }),
        delete: () =>
          deleteFile({
            fileId: file.$id,
            bucketFileId: file.bucketField,
            path,
          }),
      };

      const success = await actions[action.value as keyof typeof actions]();

      if (success) {
        closeAllModals();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

const handelPermission = async () => {
  setIsPermissionUpdating(true);

  try {
    const newValue = !isAllowedToShare;
    setIsAllowedToShare(newValue);
     await Permission({
      fileId: file.$id,
      path,
      canShareInstead: newValue,
    });
  } catch (error) {
    console.error("Failed to update permission:", error);
    alert("Something went wrong while updating permission.");
  } finally {
    setIsPermissionUpdating(false);
  }
};

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className='focus:ring-0 focus:ring-offset-0 focus-visible:border-none outline-none focus-visible:outline-none focus-visible:ring-transparent focus-visible:ring-offset-0'>
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle className='text-center text-[#333F4E]'>
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className='text-center text-[#333F4E]'>
              Are you sure you want to delete{` `}
              <span className='font-medium text-[#EA6365]'>{file.name}</span>?
            </p>
          )}
        </DialogHeader>

        {(value === "share" || error) && (
          <span className='text-[red]'>{error}</span>
        )}
        
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className='flex flex-col gap-3 md:flex-row'>
            <Button
              onClick={closeAllModals}
              className='h-[52px] flex-1 rounded-full bg-white text-[#333F4E] hover:bg-transparent'
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className='bg-[#FA7275] hover:bg-brand-100 transition-all rounded-full text-[14px] leading-[20px] font-medium !mx-0 h-[52px] w-full flex-1'
            >
              <p className='capitalize'>{value}</p>
              {isLoading && (
                <Image
                  src='/assets/icons/loader.svg'
                  alt='loader'
                  width={24}
                  height={24}
                  className='animate-spin'
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className='outline-none ring-offset-transparent focus:ring-transparent focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 '>
          <Image
            src='/assets/icons/dots.svg'
            alt='dots'
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className='max-w-[200px] truncate'>
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className='cursor-pointer'
              onClick={() => {
                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketField)}
                  download={file.name}
                  className='flex items-center gap-2'
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className='flex items-center gap-2'>
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
  {file.owner.accountId === user && (
    <div
      className="flex items-center gap-2"
      title="Toggle whether the receiver can reshare this file"
      onClick={handelPermission}
    >
      {isPermissionUpdating ? (
        <Image
          src="/assets/icons/loader.svg"
          alt="loading"
          width={24}
          height={24}
          className="animate-spin"
        />
      ) : (
        <div className='flex items-center gap-2'>
                  <Image
                    src={file.share?"/assets/icons/reddot.png":"/assets/icons/greendot.jpg"}
                    alt='share'
                    width={30}
                    height={30}
                  />
                </div>
      )}
      {file.share ? "Unprotected" : "Protected"}
    </div>
  )}
</DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};
export default ActionDropdown;
