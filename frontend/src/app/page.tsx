"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

function Home() {
  useEffect(() => {
    redirect("/explore");
  }, []);

  return null;
}

export default Home;
