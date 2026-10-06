import { createFileRoute } from "@tanstack/react-router";
import { NotesApp } from "@/components/notes/notes-app";
import { SignInGate } from "@/lib/auth/gates";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <SignInGate>
      <NotesApp />
    </SignInGate>
  );
}
