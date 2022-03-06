/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormControl, Button, Icon, FormErrorMessage, Stack } from '@chakra-ui/react';
import { LegacyRef, MutableRefObject, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FiFile } from 'react-icons/fi';
import { FileUpload, FormValues } from './fileUpload';

export const UploadForm = ({ onChange, onSubmit }: { onChange: any; onSubmit: any }): JSX.Element => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<FormValues>();

    const formRef = useRef<HTMLFormElement>();
    const onSubmitInternal = handleSubmit((data) => {
        onSubmit(data);
    });

    const validateFiles = (value: FileList) => {
        if (value.length < 1) {
            return 'Files is required';
        }
        for (const file of Array.from(value)) {
            const fsMb = file.size / (1024 * 1024);
            const MAX_FILE_SIZE = 10;
            if (fsMb > MAX_FILE_SIZE) {
                return 'Max file size 10mb';
            }
        }
        return true;
    };

    return (
        <form ref={formRef as unknown as MutableRefObject<HTMLFormElement>} onSubmit={onSubmitInternal}>
            <Stack direction={['column', 'row']}>
                <FormControl isInvalid={!!errors.file_} isRequired>
                    <FileUpload accept={'image/*'} multiple register={register('file_', { validate: validateFiles, onChange })}>
                        <Button leftIcon={<Icon as={FiFile} />}>Select file</Button>
                    </FileUpload>

                    <FormErrorMessage>{errors.file_ && errors?.file_.message}</FormErrorMessage>
                </FormControl>

                <Button size="md" colorScheme={'green'} type="submit">
                    Save
                </Button>
            </Stack>
        </form>
    );
};
