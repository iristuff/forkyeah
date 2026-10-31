import styles from './ComingSoon.module.css';

interface Props {
  emoji: string;
  title: string;
  blurb: string;
}

// Placeholder body for tabs that get built in later steps
export function ComingSoon({ emoji, title, blurb }: Props) {
  return (
    <section className={styles.wrap}>
      <span className={styles.emoji} aria-hidden="true">{emoji}</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.blurb}>{blurb}</p>
    </section>
  );
}
