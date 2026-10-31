import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { getCuisine } from '../content/cuisines';
import { usePassport, useProgress } from '../store/hooks';
import { isDishComplete } from '../lib/game';
import { CuisineArt, cuisineVars } from '../components/CuisineArt';
import { Icon } from '../components/Icon';
import styles from './Cuisine.module.css';

const DIFFICULTY = ['', 'Easy', 'Medium', 'Hard'] as const;

export default function Cuisine() {
  const { cuisineId = '' } = useParams();
  const navigate = useNavigate();
  const progress = useProgress();
  const passport = usePassport();
  const cuisine = getCuisine(cuisineId);
  if (!cuisine) return <Navigate to="/passport" replace />;

  const status = passport.find(p => p.cuisine.id === cuisine.id);
  const done = status?.done ?? 0;
  const left = cuisine.dishes.length - done;
  const next = cuisine.dishes.find(d => !isDishComplete(progress, d.id));

  return (
    <div className={styles.page} style={cuisineVars(cuisine.id)}>
      <button className="icon-btn" onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} aria-label="Back">
        <Icon name="back" />
      </button>

      <header className={styles.hero}>
        <span className={styles.flag} aria-hidden="true">
          {cuisine.flag}
        </span>
        <h1 className={styles.name}>{cuisine.name}</h1>
        <p className={styles.count}>
          {done} of {cuisine.dishes.length} dishes cooked
        </p>
        <p className={styles.pill}>
          {status?.stamped ? (
            <>
              <Icon name="stamp" size={16} /> Stamp earned
            </>
          ) : (
            <>
              <span className={styles.dot} /> Stamp: {left} {left === 1 ? 'dish' : 'dishes'} to go
            </>
          )}
        </p>
        <CuisineArt cuisineId={cuisine.id} size={150} className={styles.art} />
      </header>

      <p className={styles.story}>{cuisine.story}</p>

      <h2 className={styles.h2}>Dishes</h2>
      <ul className={styles.dishes}>
        {cuisine.dishes.map(dish => {
          const cooked = isDishComplete(progress, dish.id);
          const isLast = !cooked && left === 1;
          return (
            <li key={dish.id}>
              <Link to={`/cook/${dish.id}`} className={styles.dish}>
                <span className={cooked ? `${styles.thumb} ${styles.thumbDone}` : styles.thumb}>
                  {cooked ? <Icon name="check" size={26} strokeWidth={3} /> : <CuisineArt cuisineId={cuisine.id} size={42} />}
                </span>
                <span className={styles.dishText}>
                  <b>{dish.name}</b>
                  <span className="dim">
                    {dish.timeMin} min · {DIFFICULTY[dish.difficulty]} · {cooked ? 'Cooked' : isLast ? 'earns the stamp' : 'Not cooked yet'}
                  </span>
                </span>
                <span className="xp">+{dish.xp}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {next && (
        <Link to={`/cook/${next.id}`} className={`btn ${styles.cta}`}>
          Cook {next.name}
        </Link>
      )}
    </div>
  );
}
