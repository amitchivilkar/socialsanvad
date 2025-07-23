import styles from './Footer.module.css';

export default function Footer() {
    return (
        <>
            <footer className={styles.footer}>
                <div className={styles.wrapper}>
                    <p className={styles.copyright}>&copy; 2024-{new Date().getFullYear()}: All Rights Reserved @ Social Sanvad. </p>
                </div>
            </footer>
        </>
    );
}