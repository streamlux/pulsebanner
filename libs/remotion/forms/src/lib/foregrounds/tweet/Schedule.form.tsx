import { CloseIcon } from '@chakra-ui/icons';
import { Box, Button, Checkbox, Flex, FormControl, FormHelperText, FormLabel, HStack, IconButton, Input, Spacer, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { useState } from 'react';
import { LayerForm } from '../../LayerForm';
import { cloneDeep } from 'lodash-es';

const days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayMap: Record<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday', number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

export const Schedule: LayerForm<typeof ForegroundComponents.Schedule> = ({ props, setProps }) => {
    const events = props.events.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));

    const setEvents = (newEvents: any[]) => {
        setProps({ events: newEvents.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day)) });
    };

    return (
        <Box w="full" experimental_spaceY={2}>
            <Wrap>
                {days.map((day: string) => (
                    <WrapItem>
                        <Button
                            size="xs"
                            colorScheme={events.find((v) => v.day === day) !== undefined ? 'green' : undefined}
                            onClick={() => {
                                if (events.find((v) => v.day === day)) {
                                    setProps({ events: events.filter((event) => event.day !== day).sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day)) });
                                } else {
                                    setProps({ events: [...events, { day, time: '', title: '' }].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day)) });
                                }
                            }}
                        >
                            {day}
                        </Button>
                    </WrapItem>
                ))}
            </Wrap>
            <VStack align="start" w="full">
                {events.map((event) => (
                    <Box fontSize="sm" w="full" experimental_spaceY={1}>
                        <Flex direction="row" width="full" justifyItems="stretch">
                            <Text>{event.day}</Text>
                        </Flex>
                        <Flex justify="space-between" direction="row" width="full" experimental_spaceX={2}>
                            <Input
                                size="sm"
                                type="text"
                                defaultValue={event.title}
                                onChange={(e) => {
                                    const newEvents = cloneDeep(events.filter((ev) => ev.day !== event.day));
                                    newEvents.push({ ...event, title: e.target.value });
                                    setEvents(newEvents);
                                }}
                            />
                            <Input
                                size="sm"
                                type="text"
                                w="32"
                                defaultValue={event.time}
                                onChange={(e) => {
                                    const newEvents = cloneDeep(events.filter((ev) => ev.day !== event.day));
                                    newEvents.push({ ...event, time: e.target.value });
                                    setEvents(newEvents);
                                }}
                            />
                        </Flex>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};
