import Link from 'next/link';

export default function Header() {
  return (
    <Link href="/">
      <img src="/imgs/logo.svg" alt="logo" />
    </Link>
  );
}
