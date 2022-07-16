import React from 'react';
import { Box, Button } from '@mui/material';
import { TValidSize } from '../../interfaces';

interface Props {
    sizes: TValidSize[];
    selectedSize?: TValidSize;

    // Methods
    onSizeSelected: (size: TValidSize) => void;
}

export const SizeSelector: React.FC<Props> = ({sizes, selectedSize, onSizeSelected}) => {
    return (
        <Box>
            {
                sizes.map(size => (
                    <Button
                        key={size}
                        size='small'
                        color={selectedSize === size ? 'primary' : 'info'}
                        onClick={() => onSizeSelected(size)}
                    >
                        {size}
                    </Button>
                ))
            }
        </Box>
    );
};
