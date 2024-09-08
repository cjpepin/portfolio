
//make Chip component\

import React from 'react';
import styles from './chip.module.css';

type ChipProps = {
    children: React.ReactNode;
}

const Chip: React.FC<ChipProps> = ({ children }) => {
    return (
        <div className={styles.chip}>
            {children}
        </div>
    );
}

export default Chip;