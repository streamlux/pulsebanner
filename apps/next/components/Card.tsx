import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';

export const Card: React.FC = ({ children }) => {
    const styles = useColorModeValue<BoxProps>(
        {
            border: '1px solid',
            borderColor: 'gray.300',
        },
        {
            background: 'whiteAlpha.100',
        }
    );

    return (
        <Box rounded="md" p="4" experimental_spaceY="8" {...styles}>
            {children}
        </Box>
    );
};
