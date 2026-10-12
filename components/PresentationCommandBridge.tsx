"use client";

import { useEffect } from "react";
import { listenForPresentationCommands } from "../lib/presentation-sync";

export default function PresentationCommandBridge() {
  useEffect(() => listenForPresentationCommands((command) => {
    if (window.location.pathname === "/teleprompter") return;
    if (command.type === "navigate") window.location.assign(command.path);
  }), []);

  return null;
}
