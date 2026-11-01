import { Link } from 'react-router';
import { CUISINES, getCuisine } from '../content/cuisines';
import { useDailyMission, useLevel, useProgress, useQuests, useStreak, useStreakWeek } from '../store/hooks';
import { CuisineArt, cuisineVars } from '../components/CuisineArt';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { titleForLevel } from '../lib/xp';
import styles from './Home.module.css';

const DIFFICULTY = ['', 'Easy', 'Medium', 'Hard'] as const;
const WEEKDAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Home() {
  const { profile } = useProgress();
  const level = useLevel();
  const streak = useStreak();
  const week = useStreakWeek();
  const { dish, done } = useDailyMission();
  const quests = useQuests();
  const cuisine = dish ? getCuisine(dish.cuisineId) : undefined;

  // Show the quests closest to finishing first
  const openQuests = quests
    .filter(q => !q.claimed)
    .sort((a, b) => b.progress / b.quest.total - a.progress / a.quest.total)
    .slice(0, 2);

  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className="dim">{date}</p>
          <h1>Hi, {profile.name}!</h1>
        </div>
        <Mascot size={60} splashTarget />
      </header>

      <section className={styles.level} aria-label="Your level">
        <div className={styles.levelTop}>
          <b>
            Lv {level.level} · {level.title}
          </b>
          <span className="num">{level.xp.toLocaleString()} XP</span>
        </div>
        <div className={`track ${styles.levelTrack}`}>
          <i style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        <p className={styles.levelNext}>
          {level.nextLevelXP === null ? 'Top level reached. Fork yeah!' : `${level.xpToNext.toLocaleString()} XP to ${titleForLevel(level.level + 1)}`}
        </p>
      </section>

      <h2 className={styles.h2}>Today’s dish</h2>
      {dish && cuisine ? (
        <article className={styles.dish} style={cuisineVars(cuisine.id)}>
          <div className={styles.dishHead}>
            <div className={styles.dishArt}>
              <CuisineArt cuisineId={cuisine.id} size={54} />
            </div>
            <div>
              <Link to={`/cuisine/${cuisine.id}`} className={styles.chip}>
                <span aria-hidden="true">{cuisine.flag}</span> {cuisine.name}
              </Link>
              <h3 className={styles.dishName}>{dish.name}</h3>
            </div>
          </div>
          <p className="dim">{firstSentence(dish.story)}</p>
          <div className={styles.meta}>
            <span>
              <Icon name="clock" size={16} /> {dish.timeMin} min
            </span>
            <span>{DIFFICULTY[dish.difficulty]}</span>
            <span className={`xp ${styles.metaXp}`}>+{dish.xp} XP</span>
          </div>
          {done ? (
            <p className={styles.done}>
              <Icon name="check" size={18} strokeWidth={3} /> Done for today. See you tomorrow!
            </p>
          ) : (
            <Link to={`/cook/${dish.id}`} className="btn">
              Start cooking
            </Link>
          )}
        </article>
      ) : (
        <article className={styles.dish}>
          <h3 className={styles.dishName}>You’ve cooked everything!</h3>
          <p className="dim">New dishes are on the way. Revisit a favourite from the cuisines below.</p>
        </article>
      )}

      <h2 className={styles.h2}>
        This week
        <span className={styles.streak}>
          <Icon name="flame" size={16} /> {streak} {streak === 1 ? 'day' : 'days'}
        </span>
      </h2>
      <ol className={styles.week} aria-label={`Cooking streak: ${streak} days`}>
        {week.map((d, i) => (
          <li key={d.day} className={d.cooked ? styles.cooked : d.isToday ? styles.today : undefined}>
            <span className={styles.lid}>{d.cooked && <Icon name="check" size={16} strokeWidth={3} />}</span>
            <span aria-hidden="true">{WEEKDAY[i]}</span>
            <span className="visually-hidden">
              {d.day}
              {d.cooked ? ', cooked' : ''}
            </span>
          </li>
        ))}
      </ol>

      {openQuests.length > 0 && (
        <>
          <h2 className={styles.h2}>Quests</h2>
          <ul className={styles.quests}>
            {openQuests.map(({ quest, progress }) => (
              <li key={quest.id}>
                <div className={styles.questText}>
                  <b>{quest.name}</b>
                  <p className="dim">
                    {quest.description} · {progress} of {quest.total}
                  </p>
                  <div className={`track ${styles.questTrack}`}>
                    <i style={{ width: `${(progress / quest.total) * 100}%` }} />
                  </div>
                </div>
                <span className="xp">+{quest.xpReward}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className={styles.h2}>Explore cuisines</h2>
      <ul className={styles.explore}>
        {CUISINES.map(c => (
          <li key={c.id} style={cuisineVars(c.id)}>
            <Link to={`/cuisine/${c.id}`}>
              <span className={styles.tile}>
                <CuisineArt cuisineId={c.id} size={46} />
                <span className={styles.tileFlag} aria-hidden="true">
                  {c.flag}
                </span>
              </span>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function firstSentence(text: string): string {
  const end = text.search(/[.!?](\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}
