import { Center, Stack, Text, Container, Box, ListItem, UnorderedList } from '@chakra-ui/layout';
import { Table, Thead, Tr, Th, Tbody, Td, TableCaption } from '@chakra-ui/react';

const Section = ({ title, content }: { title: string; content: string }) => (
    <Box experimental_spaceY={3}>
        <Text fontSize="md" fontWeight={'semibold'}>
            {title}
        </Text>
        <Text>{content}</Text>
    </Box>
);

export default function Page() {
    return (
        <Container maxW="container.xl" experimental_spaceY={4}>
            <Center>
                <Text fontSize="3xl" fontWeight="bold">
                    Partner Program Terms and Conditions
                </Text>
            </Center>
            <Stack spacing={4}>
                <Text>PARTNER PROGRAM TERMS AND CONDITIONS</Text>
                <Text fontWeight="semibold">Last updated: Feburary 26, 2022</Text>
                <Text>{`Streamlux, LLC ("PulseBanner"). All Rights Reserved.`}</Text>

                <Section
                    title="Rebates."
                    content={`
                        A rebate ("earnings", "credit") will be granted to a Partner when a Partner's personal discount code is
                        used by a Partner's customer to purchase a PulseBanner Membership subscription and said customer does not request
                        a refund or cancel the PulseBanner Membership subscription before the end of the refund period. The refund period is currently 2 weeks long.

                        The credit you earn will go towards your monthly (or yearly) subscription payment. For example, if you earn $4 in a month, and you have a PulseBanner subscription that costs $7.99 per month,
                        you will only be charged $2.99 for that month ($7.99 - $4.00 = $2.99). If your rebates sum to more than your payment amount, the
                        remaining credit rolls over to the next payment period. Earnings may be cancelled or cleared at any time by PulseBanner.

                        Earnings are controlled by us and can be changed at any time. Earnings cannot be withdrawn. Rebates are not considered income, and are not taxable.
                        Rebates are essentially gift cards.
                    `}
                />
                <Section
                    title="Marketing."
                    content={`
                        You may share your PulseBanner discount code with Fans; provided, however, that all marketing and other activities related
                        to your Fans, PulseBanner will be in strict
                        accordance with all applicable laws (collectively, including applicable laws related to deceptive practices, telemarketing,
                        privacy, consumer rights, e-mail, and electronic communications, “Laws”), these Terms, the specifications and instructions
                        outlined in Exhibit A to these Terms, and any other written policies or guidance provided to you by PulseBanner on behalf of PulseBanner
                        from time to time. You agree that you will not circulate the Referral Links via emails or other unsolicited electronic
                        communication (“Spamming”). Spamming will not be tolerated and may lead to immediate termination of these Terms by PulseBanner.
                        You will not be entitled to any commissions or other fees generated through Spamming tactics.
                    `}
                />
                <Section
                    title="License."
                    content={`
                        PulseBanner and Streamlux LLC, hereby grants to you, during the term of these Terms, a limited, worldwide, non-exclusive,
                        non-transferable, revocable license to use and display the discount code, PulseBanner's name and logo or other PulseBanner content
                        that may be provided to you under these Terms from time to time, for the
                        sole purpose of marketing PulseBanner and PulseBanner's products in accordance with the terms and conditions of these Terms. PulseBanner
                        may provide you with marketing materials, but you will be solely responsible for your own marketing activities
                        and you agree that such marketing activities shall be professional and in full compliance with applicable laws. You agree
                        that PulseBanner may, without prior notice, require you to remove or modify any marketing materials/advertisements/social
                        media posts in PulseBanner and PulseBanner's sole discretions. You hereby grant to PulseBanner a worldwide, non-exclusive right and
                        license to use and display your picture, name, voice, likeness, image, appearance and biographical information in, on or in
                        connection with any photographs, audio and video recordings, digital images, websites, applications and social media (external
                        and internal), television programs, advertising, sales and marketing brochures, books, magazines, other publications, DVDs
                        and all other printed and electronic forms and media throughout the world, at any time, for all legitimate PulseBanner business
                        purposes (“Permitted Uses”). You hereby forever release PulseBanner their members, shareholders, officers, managers,
                        employees, agents, representatives and third-party service providers from any and all claims, actions, damages, losses,
                        costs, expenses and liability of any kind, arising under any legal or equitable theory whatsoever at any time in connection
                        with any Permitted Use. You may not display PulseBanner's name and logo or other PulseBanner content that PulseBanner may provide to you
                        under these Terms in a manner that, in PulseBanner's sole discretion, portray's PulseBanner in negative light.
                    `}
                />
                <Section
                    title="Non-Disparagement."
                    content={`
                        You will not, directly or indirectly, at any time, make, publish or communicate to any person or entity or in any public
                        forum any defamatory or disparaging remarks, comments or statements concerning PulseBanner, Streamlux LLC, their affiliates or any of
                        their respective employees, managers, members, shareholders, officers, agents, contractors, representatives and existing,
                        prospective and former customers, vendors, investors, financial resources or any other associated third party with PulseBanner or
                        Streamlux LLC. The previous sentence does not, in any way, restrict you from exercising protected rights by speaking the truth to
                        the extent that such rights cannot be waived by agreement or from complying with any Law or a valid order of a court of
                        competent jurisdiction or an authorized government agency, provided that such compliance does not exceed that required by Laws.
                        You will promptly provide written notice of any such order to an authorized officer of each of PulseBanner and Streamlux LLC.
                    `}
                />
                <Section
                    title="Relationship of the Parties."
                    content={`
                        Without limiting anything herein, you will defend, indemnify and hold PulseBanner, Streamlux LLC and their affiliates, managers,
                        members, shareholders employees, officers, directors and representatives, harmless from and against any claims, damages, losses, costs,
                        liabilities and expenses, including attorneys' fees (collectively, “Claims”), arising out of or in connection with (a) your breach
                        of the representations, warranties and covenants made by you, (b) your fraud, negligence or willful misconduct, or (c) your
                        violations of Laws. You are solely responsible for your actions in connection with the Partner Program.
                    `}
                />
                <Section
                    title="Limitations of Liability."
                    content={`
                    The Partner Program is provided on an "as is" and "as available" basis and the use of the Partner Program is at your own risk. PulseBanner, and Streamlux LLC,
                    make no representations or warranties, either expressed or implied, with respect to the Partner Program, or any
                    service or information provided through the Partner Program. PulseBanner.com and Streamlux LLC are not responsible for any damages, injury
                    or economic loss arising from the use of or participation in the Partner Program. Should any part of the Partner Program cause damage or
                    inconvenience to the you or anyone claiming through you, you assume responsibility and the entire cost for them. You will indemnify and
                    hold harmless PulseBanner.com and Streamlux LLC, their directors, officers, employees, agents, subsidiaries, and third parties from and
                    against any losses, damages, liabilities, claims, judgments, settlements, fines, costs and expenses (including reasonable related
                    expenses, legal fees, costs of investigation) arising out of or relating to your or any third party's operation or use of the
                    Partner Program, including creating any content or advertisements using the PulseBanner name, logo or marketing materials.
                    `}
                />
                <Section
                    title="Relationship of the Parties."
                    content={`
                        The parties are PulseBanner customers, and nothing in these Terms will create any partnership, joint venture, agency, franchise,
                        sales representative, or employment relationship between the parties. Neither party will have the authority to make or accept any
                        offers, warranties or representations on the other party's behalf.
                    `}
                />
                <Section
                    title="Termination."
                    content={`
                    PulseBanner may, at any time, in its sole discretion and without any notice to you, provide special terms, limitations and conditions for
                    the Partner Program, or otherwise change or amend these Terms. Further, PulseBanner may, at any time, in its sole discretion and without
                    any notice to you, (a) discontinue the Partner Program, in whole or in part; (b) approve, deny or revoke the right to participate
                    in the Partner Program with respect to any person, including you, for any reason whatsoever; or (c) audit any Partner Program
                    account. You may terminate your participation in the Partner Program with immediate effect by giving PulseBanner a written notice of
                    termination. The notice must be sent through via email to contact@pulsebanner.com. Upon termination, you will
                    lose access to the Partner Dashboard and will forfeit all potential or unpaid Commissions.
                    `}
                />
                <Section
                    title="Interpretation of these Terms."
                    content={`
                        PulseBanner has the sole discretion to interpret and apply these Terms under and in connection with all circumstances, and all
                        questions or disputes regarding the Partner Program or these Terms will be resolved by PulseBanner, in its sole discretion.
                    `}
                />

                <Box experimental_spaceY={3}>
                    <Text fontWeight={'semibold'}>EXHIBIT A STANDARDS</Text>

                    <Text>
                        {`Without limiting anything in these Terms, all posts and all promotional messages, photos, or other communications made on social media platforms about PulseBanner and its products or services (collectively, “Posts”), must meet the following requirements:`}
                    </Text>

                    <Text>
                        {`You and all of the Posts must comply with the Federal Trade Commission's (the “FTC”) Guides Concerning Endorsements and
                        Testimonials (the “Endorsement Guides”) described in this Section 1 of this Exhibit A and PulseBanner's social media endorsement
                        policies in effect from time to time. You will, if requested by PulseBanner, participate in training which is designed to ensure
                        compliance with the Endorsement Guides and PulseBanner's policies.
                        Without limiting the foregoing, with respect to promotional messages, photos, or other communications made on social media platforms
                        about PulseBanner and its products or services, including all Posts and you will adhere to the following standards:
                        You will comply with the Federal Trade Commission's (the “FTC”) Guides Concerning Endorsements and Testimonials
                        (http://www.ftc.gov/os/2009/10/091005revisedendorsementguides.pdf), including making:
                        statements that reflect honest beliefs, opinions, and experiences; and
                        clear and conspicuous disclosure about any connection to PulseBanner in all Posts.`}
                    </Text>

                    <Box experimental_spaceY={3}>
                        <Text>You will review:</Text>
                        <UnorderedList>
                            <ListItem>
                                {`The FTC's Endorsement Guides: What People Are Asking (https://www.ftc.gov/tips-advice/business-center/guidance/ftcs-endorsement-guides-what-people-are-asking).`}
                            </ListItem>
                            <ListItem>
                                {`FTC: The Do's and Don'ts for Social Media Influencers (https://www.ftc.gov/news-events/press-releases/2017/09/csgo-lotto-owners-settle-ftcs-first-ever-complaint-against).`}
                            </ListItem>
                            <ListItem>
                                {`FTC: Disclosures 101 for Social Media Influencers (https://www.ftc.gov/system/files/documents/plain-language/1001a-influencer-guide-508_1.pdf).`}
                            </ListItem>
                            <ListItem>{`FTC: Do you endorse things on social media? (https://www.ftc.gov/news-events/audio-video/video/advice-social-media-influencers).`}</ListItem>
                        </UnorderedList>
                    </Box>

                    <Box experimental_spaceY={3}>
                        <Text>You will not:</Text>
                        <UnorderedList>
                            <ListItem>{`make deceptive or misleading claims about PulseBanner's products or services or PulseBanner's competitors' products or services;`}</ListItem>
                            <ListItem>
                                {`make any claims about PulseBanner's products or services or PulseBanner's competitors' products or services that are not backed up by evidence;`}
                            </ListItem>
                            <ListItem>{`disclose any Confidential Information;`}</ListItem>
                            <ListItem>{`disparage PulseBanner or PulseBanner products or services;`}</ListItem>
                            <ListItem>
                                {`engage in any communication that is defamatory or infringes upon the copyright, trademark, privacy, publicity, or other intellectual property rights of others;`}
                            </ListItem>
                            <ListItem>{`offer for sale or solicit products on behalf of PulseBanner;`}</ListItem>
                            <ListItem>{`make offensive comments that have the purpose or effect of creating an intimidating or hostile environment;`}</ListItem>
                            <ListItem>
                                {`post content that promotes bigotry, racism, or discrimination based on race, gender, religion, nationality, disability, sexual orientation, or age;`}
                            </ListItem>
                            <ListItem>{`use ethnic slurs, personal insults, obscenity, or other offensive language; or`}</ListItem>
                            <ListItem>
                                {`make any comments or post any content that in any way promotes unsafe activities that could lead to an unsafe situation involving PulseBanner's consumers or other individuals.`}
                            </ListItem>
                        </UnorderedList>
                    </Box>

                    <Box experimental_spaceY={3}>
                        <Text>You will adhere to:</Text>
                        <UnorderedList>
                            <ListItem>{`the posted policies, guidelines, and terms of use on any platform on which you post content on behalf of PulseBanner, understanding that any these platforms' disclosure requirements about any connection to PulseBanner do not necessarily satisfy FTC disclosure requirements; and`}</ListItem>
                            <ListItem>{`any additional guidelines provided by PulseBanner, such as product-specific program requirements and PulseBanner's policies in effect from time to time.`}</ListItem>
                            <ListItem>{`You will not create fake followers or engagement on social media platforms, such as buying followers; using bots to grow audience size by automating account creation, following, commenting, and liking; or post fake sponsored content.`}</ListItem>
                            <ListItem>{`You must clearly and conspicuously disclose the “material connection” with PulseBanner, making it clear that you are a paid influencer and have received compensation. You must place the disclosure in plain sight in close proximity to any audio or visual communications that you make about PulseBanner, PulseBanner's brand or PulseBanner's products. You may not bury the disclosure in a link or place the disclosure in a string of hashtags or other disclosures. For the avoidance of doubt, this disclosure is required regardless of any space limitations of the platform (like Twitter), and includes any platform where hashtags for the disclosure (like #ad or #sponsored) can be used. If a platform does not allow for a clear and conspicuous disclosure, you should not use that platform to post about PulseBanner.`}</ListItem>
                            <ListItem>{`Posts will only make factual statements about PulseBanner and PulseBanner's products that are known for certain are true and can be proven or verified. In the Campaign Materials (as defined below), PulseBanner will provide you with a list of verified factual statements that may be used in Posts by you.`}</ListItem>
                            <ListItem>{`Posts should be authentic and based on your own opinions, beliefs, and experiences; provided, however, that Posts will rely on the Campaign Materials to accurately use the PulseBanner trademarks, describe the Campaign, and describe the PulseBanner products.`}</ListItem>
                            <ListItem>{`Posts by you will be original and created solely by you.`}</ListItem>
                            <ListItem>{`Posts by you will not include the intellectual property of other parties, including any third-party music, photographs, artwork, trademarks, logos, or slogans.`}</ListItem>
                            <ListItem>{`Posts by you will not include any person, or personally identifiable information about anyone, other than you unless you receive PulseBanner's prior written approval and has such person(s) at issue sign a release provided by PulseBanner.`}</ListItem>
                            <ListItem>{`Posts by you will comply with the rules of the applicable social media platforms and each of the provisions set forth in this Exhibit A. `}</ListItem>
                        </UnorderedList>
                    </Box>
                </Box>
            </Stack>
        </Container>
    );
}
