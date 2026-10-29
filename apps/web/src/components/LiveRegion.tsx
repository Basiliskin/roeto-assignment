import ui from './ui.module.css';

export function LiveRegion({ message }: { message: string }) {
  return (
    <div className={ui.srOnly} aria-live="assertive" role="status">
      {message}
    </div>
  );
}
