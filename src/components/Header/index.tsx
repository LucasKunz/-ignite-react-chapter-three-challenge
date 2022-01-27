import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <span>
            <img src="/logo.svg" alt="logo" />
            spacetraveling
          </span>
        </a>
      </Link>
    </header>
  );
}
