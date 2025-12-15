'use client';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import {useState} from 'react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        // { title: "होम", url: "/" },
        // { title: "आम्ही कोण", url:"/about" },
        // { title: "ब्लॉग", url: "/blog" },
        { title: "Let's Subscribe", url: "/"}
    ]

    return (
        <>
            <header className={styles.header}>
                <div className={styles.wrapper}>
                    <Link href="/" className={styles.logo}>
                        <Image src="/images/logo.png" alt='Social Sanvad Logo' width={65} height={48} />
                    </Link>
                    <div className={styles.nav__toggle} onClick={toggleMenu}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                        <ul className={styles.nav__list}>
                            {menuItems.map((item, index) => (
                                <li key={index} className={styles.nav__item}>
                                    <Link href={item.url}>
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    );
}