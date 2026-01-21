import Image from "next/image";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="lg:hidden flex justify-center gap-2 md:justify-start">
          <Link href="/">
            <Image
              width={100}
              height={100}
              alt="eddysylva logo"
              src="/assets/esk-logo.png"
              className="size-14"
            />
          </Link>
        </div>
        <div className="flex flex-1 sm:items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          width={1024}
          height={1024}
          src="/assets/mockup.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
