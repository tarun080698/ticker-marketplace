import Link from "next/link";
import Logo from "@/assets/logo/bookit-logo.png";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import SearchBar from "./SearchBar";

function Header() {
  return (
    <div className="border-b shadow-lg bg-pink-400">
      <div className="flex flex-col lg:flex-row items-center gap-4 py-4 w-full container mx-auto">
        <div className="flex items-center justify-between ">
          <Link href="/" className="font-bold shrink-0">
            <Image
              src={Logo}
              alt="brand_logo"
              width={100}
              height={100}
              className="w-36 lg:w-40"
            />
          </Link>

          <div className="lg:hidden">
            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="p-2 shadow-md bg-yellow-300 text-pink-300 font-semibold rounded-lg hover:bg-yellow-200">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <div className="w-full lg:max-w-lg">
          <SearchBar />
        </div>

        <div className="hidden lg:block ml-auto">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/seller">
                <button className="bg-yellow-300 text-pink-300 font-semibold px-3 py-1 rounded-lg hover:bg-yellow-200 transition ">
                  Sell Tickets
                </button>
              </Link>
              <Link href="/tickets">
                <button className="border border-yellow-300 text-yellow-300 font-semibold px-3 py-1 rounded-lg hover:bg-pink-400 transition ">
                  My Tickets
                </button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="p-2 shadow-md bg-yellow-300 text-pink-300 font-semibold rounded-lg hover:bg-yellow-200">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
        {/* Mobile Action Buttons */}
        <div className="lg:hidden w-full flex justify-center gap-3">
          <SignedIn>
            <Link href="/seller" className="flex-1">
              <button className="w-full bg-yellow-300 text-pink-300 font-semibold px-3 py-1 rounded-lg hover:bg-yellow-200 transition ">
                Sell Tickets
              </button>
            </Link>
            <Link href="/tickets" className="flex-1">
              <button className="w-full border border-yellow-300 text-yellow-300 font-semibold px-3 py-1 rounded-lg hover:bg-pink-400 transition ">
                My Tickets
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Header;
