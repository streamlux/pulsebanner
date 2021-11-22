import NextLink from 'next/link';
import { Center, Link } from '@chakra-ui/react';
import styles from './footer.module.css';
import React from 'react';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <Center>
                <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                        <Link isExternal={true} href="https://twitter.com/pulsebanner">
                            Twitter
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <NextLink href="/privacy">
                            <Link>Privacy</Link>
                        </NextLink>
                    </li>
                    <li className={styles.navItem}>
                        <NextLink href="/terms">
                            <Link>Terms of Use</Link>
                        </NextLink>
                    </li>
                </ul>
            </Center>
        </footer>
    );
}
