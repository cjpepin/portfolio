import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}
  
export function IconButton({ children, className, ...rest }: ButtonProps) {
    return (
        <button {...rest} className={styles.iconButton}>
            {children}
        </button>
    );
}
  