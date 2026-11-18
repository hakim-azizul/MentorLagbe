import { getSession } from "@/lib/core/serverUser";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await getSession();
  const user = session?.user || null;

  return <NavbarClient user={user} />;
}