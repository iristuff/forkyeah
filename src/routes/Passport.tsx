import { Link } from 'react-router';
import { usePassport, useProgress } from '../store/hooks';
import { isDishComplete } from '../lib/game';
import { CuisineArt, cuisineVars } from '../components/CuisineArt';
import { Mascot } from '../components/Mascot';
import styles from './Passport.module.css';

export default function Passport() {
  const passport = usePassport();
  const progress = useProgress();
  const stamped = passport.filter(p => p.stamped).length;

  // Suggest the cuisine closest to its stamp
  const next = passport
    .filter(p => !p.stamped)
    .sort((a, b) => b.done / b.total - a.done / a.total)[0];
  const nextDish = next?.cuisine.dishes.find(d => !isDishComplete(progress, d.id));

  return (
    <div>
      <h1>Passport</h1>
      <p className="dim">
        {stamped} of {passport.length} cuisines stamped
      </p>

      <ul className={styles.grid}>
        {passport.map(({ cuisine, done, total, stamped: isStamped }) => {
          const state = isStamped ? styles.stamped : done > 0 ? styles.started : styles.notStarted;
          return (
            <li key={cuisine.id} style={cuisineVars(cuisine.id)}>
              <Link to={`/cuisine/${cuisine.id}`} className={styles.cell}>
                <span className={`${styles.ring} ${state}`}>
                  {isStamped && <span className={styles.tag}>Stamped</span>}
                  <CuisineArt cuisineId={cuisine.id} size={62} className={styles.art} />
                  <span className={styles.flag} aria-hidden="true">
                    {cuisine.flag}
                  </span>
                </span>
                <b>{cuisine.name}</b>
                <span className="dim">
                  {done} of {total} dishes
                </span>
              </Link>
            </li>
          );
        })}
        <li className={styles.cell}>
          <span className={`${styles.ring} ${styles.notStarted}`}>
            <Mascot size={58} />
          </span>
          <b>More soon</b>
        </li>
      </ul>

      {next && nextDish && (
        <section className={styles.next} style={cuisineVars(next.cuisine.id)}>
          <b>
            Next stamp: {next.cuisine.flag} {next.cuisine.name}
          </b>
          <p>
            {next.total - next.done === 1 ? `Cook ${nextDish.name} to earn it.` : `${next.total - next.done} dishes to go. Start with ${nextDish.name}.`}
          </p>
          <Link to={`/cook/${nextDish.id}`} className="btn">
            Cook {nextDish.name}
          </Link>
        </section>
      )}
    </div>
  );
}
