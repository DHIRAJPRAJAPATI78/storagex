"use client";

import { useState, useEffect } from "react";
import {
  updateUser,
  validatePassword,
  getCurrentUser,
} from "@/lib/actions/userAction";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [hasPassword, setHasPassword] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkPasswordStatus = async () => {
      const localFlag = localStorage.getItem("passwordFlag");
      if (localFlag === "true") {
        setHasPassword(true);
        setLoading(false);
        return;
      }
      try {
        const user = await getCurrentUser();
        if (user?.password) {
          localStorage.setItem("passwordFlag", "true");
          setHasPassword(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // ✅ stop loading after fetch
      }
    };
    checkPasswordStatus();
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateUser({ password, confirmPassword });
      localStorage.setItem("passwordFlag", "true");
      setAccessGranted(true);
      setShowDialog(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleValidatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const isValid = await validatePassword(inputPassword);
      if (!isValid) throw new Error("Invalid password.");
      setAccessGranted(true);
      setShowDialog(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className='p-6 text-center'>
        <p className='text-muted-foreground'>Checking access...</p>
      </div>
    );
  }

  // ✅ If user hasn’t entered the correct password yet
  if (!accessGranted) {
    return (
      <>
        <div className='p-6 text-center space-y-4'>
          <p className='text-lg font-semibold'>
            {hasPassword
              ? "🔐 This space is locked. Please enter your password to unlock it."
              : "🛡️ Welcome! Before you proceed, secure your space by setting a password."}
          </p>

          <Button onClick={() => setShowDialog(true)} className='mt-2'>
            {hasPassword ? " Enter Password" : " Set Password"}
          </Button>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>
                {hasPassword ? "Enter your password" : "Set a password"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={
                hasPassword ? handleValidatePassword : handleSetPassword
              }
              className='space-y-4'
            >
              {hasPassword ? (
                <div className='grid gap-2'>
                  <Label>Password</Label>
                  <Input
                    type='password'
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className='grid gap-2'>
                    <Label>Password</Label>
                    <Input
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label>Confirm Password</Label>
                    <Input
                      type='password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {error && <p className='text-sm text-red-500'>{error}</p>}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type='submit'>
                  {hasPassword ? "Enter" : "Set Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ✅ Main content once access is granted
  return <div className='p-6'>Welcome to your private space!</div>;
}
