"use client";

import { signOut } from "next-auth/react";

import Button from "@/components/ui/Button";

export default function LogoutButton() {
  return (
    <Button
      variant="secondary"
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
    >
      ログアウト
    </Button>
  );
}
