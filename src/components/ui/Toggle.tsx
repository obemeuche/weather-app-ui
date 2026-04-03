import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function Toggle({ checked, onChange, id }: ToggleProps) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
    </label>
  );
}
