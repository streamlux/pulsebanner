import { Center, Stack, Text } from '@chakra-ui/react';

export default function Page() {
    return (
        <>
            <Center>
                <Text fontSize="3xl" fontWeight="bold">
                    Code of Conduct
                </Text>
            </Center>
            <Stack spacing="3">
                <Text>
                    All participants of PulseBanner are expected to abide by our Code of Conduct, both online and during in-person events that are hosted and/or associated with
                    PulseBanner.
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                    The Pledge
                </Text>
                <Text>
                    In the interest of fostering an open and welcoming environment, we pledge to make participation in our project and our community a harassment-free experience
                    for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race,
                    religion, or sexual identity and orientation.
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                    The Standards
                </Text>
                <Text>Examples of behaviour that contributes to creating a positive environment include:</Text>
                <Text>- Using welcoming and inclusive language</Text>
                <Text>- Being respectful of differing viewpoints and experiences</Text>
                <Text>- Gracefully accepting constructive criticism</Text>
                <Text>- Referring to people by their preferred pronouns and using gender-neutral pronouns when uncertain</Text>
                <Text>Examples of unacceptable behaviour by participants include:</Text>
                <Text>- Trolling, insulting/derogatory comments, public or private harassment </Text>
                <Text>- Publishing others&apos; private information, such as a physical or electronic address, without explicit permission </Text>
                <Text>
                    - Not being respectful to reasonable communication boundaries, such as &apos;leave me alone,&apos; &apos;go away,&apos; or &apos;I’m not discussing this with
                    you.&apos;{' '}
                </Text>
                <Text>- Demonstrating the graphics or any other content you know may be considered disturbing </Text>
                <Text>- Starting and/or participating in arguments related to politics </Text>
                <Text>
                    - Assuming or promoting any kind of inequality including but not limited to: age, body size, disability, ethnicity, gender identity and expression, nationality
                    and race, personal appearance, religion, or sexual identity and orientation{' '}
                </Text>
                <Text>- Drug promotion of any kind </Text>
                <Text>- Attacking personal tastes </Text>
                <Text>- Other conduct which you know could reasonably be considered inappropriate in a professional setting. </Text>
                <Text fontSize="lg" fontWeight="bold">
                    Enforcment
                </Text>
                <Text>
                    Violations of the Code of Conduct may be reported by sending an email to pulsebanner@streamlux.com. All reports will be reviewed and investigated and will
                    result in a response that is deemed necessary and appropriate to the circumstances. Further details of specific enforcement policies may be posted separately.
                    We hold the right and responsibility to remove comments or other contributions that are not aligned to this Code of Conduct, or to ban temporarily or
                    permanently any members for other behaviours that they deem inappropriate, threatening, offensive, or harmful.
                </Text>
            </Stack>
        </>
    );
}
