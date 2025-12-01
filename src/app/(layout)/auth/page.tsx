"use client";

import { useEffect, useState } from "react";
import AuthBox from "@/components/authbox/AuthBox";

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <AuthBox />;
}
