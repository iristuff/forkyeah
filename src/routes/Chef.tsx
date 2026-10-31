// AI Sous Chef: streamed chat that knows which dish and step you're on.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { getDish } from '../content/cuisines';
import { useGame } from '../store/gameStore';
import { askChef, ChefError } from '../lib/chefClient';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import styles from './Chef.module.css';

const SUGGESTIONS = ['How spicy is this?', 'Make it vegetarian', 'What can I swap?'];

export default function Chef() {
  const [params] = useSearchParams();
  const dish = getDish(params.get('dish') ?? '');
  const stepParam = Number(params.get('step'));
  const stepIdx = dish && Number.isInteger(stepParam) && stepParam >= 0 && stepParam < dish.steps.length ? stepParam : undefined;

  const chat = useGame(s => s.progress.chat);
  const addChatMessage = useGame(s => s.addChatMessage);
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState<string | null>(null); // streaming text
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [chat.length, reply]);

  const busy = reply !== null;

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setError(null);
    setDraft('');
    addChatMessage({ role: 'user', text: question, dishId: dish?.id });
    const history = [...useGame.getState().progress.chat].map(m => ({ role: m.role, text: m.text }));

    abort.current = new AbortController();
    setReply('');
    try {
      const full = await askChef({ messages: history, dishId: dish?.id, stepIdx }, chunk => setReply(r => (r ?? '') + chunk), abort.current.signal);
      addChatMessage({ role: 'model', text: full, dishId: dish?.id });
    } catch (err) {
      if (err instanceof ChefError && err.code === 'aborted') return;
      setError(err instanceof ChefError ? err.message : 'Something went wrong. Please try again.');
      setDraft(question); // never lose what they typed
    } finally {
      setReply(null);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.avatar}>
          <Mascot size={42} />
        </span>
        <div>
          <h1 className={styles.title}>Sous Chef</h1>
          <p className="dim">{dish ? `Cooking with you: ${dish.name}${stepIdx !== undefined ? ` · step ${stepIdx + 1}` : ''}` : 'Ask about techniques, swaps and stories'}</p>
        </div>
      </header>

      <div className={styles.thread} aria-live="polite">
        {chat.length === 0 && reply === null && (
          <div className={`${styles.msg} ${styles.bot}`}>
            {dish
              ? `Hi! I’m here for your ${dish.name}. Ask me anything: swaps, timing, or where the dish comes from.`
              : 'Hi! I’m your Sous Chef. Ask me about a technique, an ingredient swap, or the story behind a dish.'}
          </div>
        )}
        {chat.map(m => (
          <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}>
            {m.text}
          </div>
        ))}
        {reply !== null && (
          <div className={`${styles.msg} ${styles.bot}`}>
            {reply || (
              <span className={styles.typing} aria-label="Sous Chef is typing">
                <i />
                <i />
                <i />
              </span>
            )}
          </div>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!busy && (
          <div className={styles.chips}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => void send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className={styles.score}>
          <span className={styles.scoreArt}>
            <Mascot size={44} party />
          </span>
          <div>
            <b>Done cooking?</b>
            <p className="dim">Plate scoring from a photo is coming soon, with bonus XP.</p>
          </div>
          <span className={styles.scoreIcon} aria-hidden="true">
            <Icon name="camera" size={20} />
          </span>
        </div>
        <div ref={end} />
      </div>

      <form className={styles.composer} onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor="chef-input">
          Message the Sous Chef
        </label>
        <input
          id="chef-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={dish ? 'Ask about this step…' : 'Ask the Sous Chef…'}
          maxLength={2000}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" className={styles.send} disabled={busy || !draft.trim()} aria-label="Send">
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  );
}
