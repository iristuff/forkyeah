// Cooking a dish, one step at a time. Readable from the counter: big step text,
// one obvious "next" button, and a timer when the step needs one.
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { getCuisine } from '../content/cuisines';
import { useDish } from '../store/hooks';
import { useGame } from '../store/gameStore';
import { STEP_XP } from '../lib/game';
import { CuisineArt, cuisineVars } from '../components/CuisineArt';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { StepTimer } from '../components/StepTimer';
import styles from './Cook.module.css';

export default function Cook() {
  const { dishId = '' } = useParams();
  const navigate = useNavigate();
  const data = useDish(dishId);
  const completeStep = useGame(s => s.completeStep);

  const firstOpen = data ? data.dish.steps.findIndex((_, i) => !data.stepsDone.includes(i)) : -1;
  // Start on the ingredient list unless the dish is already under way
  const [step, setStep] = useState<number | 'intro'>(() => (data && data.stepsDone.length > 0 && firstOpen !== -1 ? firstOpen : 'intro'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  if (!data) return <Navigate to="/" replace />;
  const { dish, stepsDone, completed } = data;
  const cuisine = getCuisine(dish.cuisineId);
  const total = dish.steps.length;
  const back = () => (history.length > 1 ? navigate(-1) : navigate(`/cuisine/${dish.cuisineId}`));

  const header = (label: string) => (
    <>
      <div className={styles.top}>
        <button className="icon-btn" onClick={back} aria-label="Back">
          <Icon name="back" />
        </button>
        <div className={styles.topText}>
          <b>{dish.name}</b>
          <p className="dim">{label}</p>
        </div>
        {typeof step === 'number' && !stepsDone.includes(step) && <span className="xp">+{STEP_XP} XP</span>}
      </div>
      <ol className={styles.segs} aria-label={`${stepsDone.length} of ${total} steps done`}>
        {dish.steps.map((_, i) => (
          <li key={i} className={stepsDone.includes(i) ? styles.segDone : i === step ? styles.segNow : undefined} />
        ))}
      </ol>
    </>
  );

  // ── Overview: story + ingredients ──
  if (step === 'intro') {
    return (
      <div className={styles.page} style={cuisineVars(dish.cuisineId)}>
        {header(`${cuisine?.flag ?? ''} ${cuisine?.name ?? ''} · ${dish.timeMin} min · serves ${dish.serves}`)}
        <div className={styles.body}>
          <div className={styles.introArt}>
            <CuisineArt cuisineId={dish.cuisineId} size={88} />
          </div>
          <h1 className={styles.introTitle}>{dish.name}</h1>
          <p className={styles.story}>{dish.story}</p>
          <h2 className={styles.h2}>You’ll need</h2>
          <ul className={styles.ingredients}>
            {dish.ingredients.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.foot}>
          <button className="btn" onClick={() => setStep(firstOpen === -1 ? 0 : firstOpen)}>
            {completed ? 'Cook it again' : stepsDone.length ? 'Pick up where you left off' : 'Start cooking'}
          </button>
        </div>
      </div>
    );
  }

  // ── Finished ──
  if (step >= total) {
    return (
      <div className={styles.page} style={cuisineVars(dish.cuisineId)}>
        {header('All steps done')}
        <div className={`${styles.body} ${styles.finished}`}>
          <Mascot size={160} party />
          <h1>{dish.name} is ready!</h1>
          <p className="dim">Plate it up and enjoy.</p>
        </div>
        <div className={styles.foot}>
          <Link to={`/cuisine/${dish.cuisineId}`} className="btn">
            Back to {cuisine?.name ?? 'cuisine'}
          </Link>
        </div>
      </div>
    );
  }

  const current = dish.steps[step];
  const isDone = stepsDone.includes(step);
  const goNext = () => {
    if (!isDone) completeStep(dish.id, step);
    const after = stepsDone.includes(step) ? stepsDone : [...stepsDone, step];
    const nextOpen = dish.steps.findIndex((_, i) => i > step && !after.includes(i));
    setStep(nextOpen === -1 ? (after.length >= total ? total : step + 1) : nextOpen);
  };

  return (
    <div className={styles.page} style={cuisineVars(dish.cuisineId)}>
      {header(`Step ${step + 1} of ${total}`)}
      <div className={styles.body} key={step}>
        <p className={styles.stepText}>{current.text}</p>
        {current.tip && (
          <p className={styles.tip}>
            <Icon name="bulb" size={20} />
            <span>
              <b>Tip</b> {current.tip}
            </span>
          </p>
        )}
        {current.timerSec && <StepTimer seconds={current.timerSec} />}
        {step > 0 && (
          <button className={styles.prev} onClick={() => setStep(step - 1)}>
            <Icon name="back" size={16} /> Previous step
          </button>
        )}
      </div>
      <div className={styles.foot}>
        <Link to={`/chef?dish=${dish.id}&step=${step}`} className={`icon-btn ${styles.chat}`} aria-label="Ask the Sous Chef about this step">
          <Icon name="chat" />
        </Link>
        <button className="btn" onClick={goNext}>
          {step === total - 1 ? 'Finish dish' : isDone ? 'Next step' : 'Done, next step'}
        </button>
      </div>
    </div>
  );
}
