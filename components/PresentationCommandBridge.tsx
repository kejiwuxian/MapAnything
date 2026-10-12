"use client";

import { useEffect } from "react";
import { listenForPresentationCommands, listenForRemotePresentationCommands } from "../lib/presentation-sync";

export default function PresentationCommandBridge() {
  useEffect(() => {
    const handle = (command: Parameters<typeof handleCommand>[0]) => handleCommand(command);
    const stopLocal = listenForPresentationCommands(handle);
    const stopRemote = listenForRemotePresentationCommands(handle);
    return () => {
      stopLocal();
      stopRemote();
    };
  }, []);

  return null;
}

function handleCommand(command: { type: "navigate"; path: string } | { type: "run-core" }) {
  if (window.location.pathname === "/teleprompter") return;
  if (command.type === "navigate") window.location.assign(command.path);
  if (command.type === "run-core") window.dispatchEvent(new Event("mapanything-run-core"));
}
