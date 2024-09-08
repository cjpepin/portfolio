import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}
  
const IconButton = ({ children, className, ...rest }: ButtonProps) => {
    return (
        <button {...rest} className={styles.iconButton}>
            {children}
        </button>
    );
}
  
export default IconButton;